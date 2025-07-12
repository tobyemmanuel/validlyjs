import { CompiledRule, ValidationContext, ParsedRule } from '../../types';
import { RuleEngine } from '../rule-engine';
import { parseDateString } from '@/utils';

export class RuleCompiler {
  private compiledRuleCache = new Map<string, CompiledRule>();
  private ruleEngine: RuleEngine;
  private options: { optimizeUnions: boolean; parallelValidation: boolean };

  // Pre-compiled regex patterns for better performance
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly ALPHA_REGEX = /^[a-zA-Z]+$/;
  private static readonly ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;

  // Cached compiled rules for common patterns
  private static readonly COMMON_VALIDATORS = new Map<string, (value: any) => { passed: boolean; skip?: boolean }>();

  constructor(
    ruleEngine: RuleEngine,
    options?: { optimizeUnions?: boolean; parallelValidation?: boolean }
  ) {
    this.ruleEngine = ruleEngine;
    this.options = {
      optimizeUnions: options?.optimizeUnions ?? false,
      parallelValidation: options?.parallelValidation ?? false,
    };
    
    // Initialize common validators if not already done
    if (RuleCompiler.COMMON_VALIDATORS.size === 0) {
      this.initializeCommonValidators();
    }
  }

  private initializeCommonValidators(): void {
    // Cache frequently used validators
    RuleCompiler.COMMON_VALIDATORS.set('string', (value: any) => ({ passed: typeof value === 'string' }));
    RuleCompiler.COMMON_VALIDATORS.set('number', (value: any) => ({ passed: typeof value === 'number' }));
    RuleCompiler.COMMON_VALIDATORS.set('boolean', (value: any) => ({ passed: typeof value === 'boolean' }));
    RuleCompiler.COMMON_VALIDATORS.set('array', (value: any) => ({ passed: Array.isArray(value) }));
    RuleCompiler.COMMON_VALIDATORS.set('required', (value: any) => ({
      passed: value !== undefined && value !== null && value !== '',
    }));
  }

  compile(rules: ParsedRule[]): CompiledRule[] {
    const compiled: CompiledRule[] = new Array(rules.length);
    
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i] as ParsedRule;
      const cacheKey = this.getCacheKey(rule);
      let compiledRule = this.compiledRuleCache.get(cacheKey);
      
      if (!compiledRule) {
        compiledRule = rule.name === 'union' 
          ? this.compileUnion(rule)
          : this.compileRule(rule);
        
        this.compiledRuleCache.set(cacheKey, compiledRule);
      }
      
      compiled[i] = compiledRule;
    }
    
    return compiled;
  }

  private getCacheKey(rule: ParsedRule): string {
    // Faster string concatenation for cache keys
    return rule.parameters.length === 0 
      ? rule.name 
      : `${rule.name}:${JSON.stringify(rule.parameters)}`;
  }

  private compileRule(rule: ParsedRule): CompiledRule {
    // Check common validators first for faster lookup
    const commonValidator = RuleCompiler.COMMON_VALIDATORS.get(rule.name);
    if (commonValidator) {
      return {
        name: rule.name,
        validator: commonValidator,
        async: false,
        parameters: rule.parameters,
      };
    }

    // Use lookup table for better performance than switch
    const compiler = this.getCompiler(rule.name);
    return compiler ? compiler(rule) : this.compileGeneric(rule);
  }

  private getCompiler(ruleName: string): ((rule: ParsedRule) => CompiledRule) | undefined {
    const compilers: Record<string, (rule: ParsedRule) => CompiledRule> = {
      'string.min': this.compileStringMin.bind(this),
      'string.max': this.compileStringMax.bind(this),
      'string.regex': this.compileStringRegex.bind(this),
      'string.email': this.compileStringEmail.bind(this),
      'string.url': this.compileStringUrl.bind(this),
      'string.alpha': this.compileStringAlpha.bind(this),
      'string.alphanumeric': this.compileStringAlphanumeric.bind(this),
      'number.min': this.compileNumberMin.bind(this),
      'number.max': this.compileNumberMax.bind(this),
      'number.between': this.compileNumberBetween.bind(this),
      'number.integer': this.compileNumberInteger.bind(this),
      'date': this.compileDate.bind(this),
      'nullable': this.compileNullable.bind(this),
      'optional': this.compileOptional.bind(this),
    };

    return compilers[ruleName];
  }

  private compileStringMin(rule: ParsedRule): CompiledRule {
    const min = parseInt(rule.parameters[0], 10);
    return {
      name: rule.name,
      validator: (value: any) => ({
        passed: typeof value === 'string' && value.length >= min
      }),
      async: false,
      parameters: rule.parameters,
    };
  }

  private compileStringMax(rule: ParsedRule): CompiledRule {
    const max = parseInt(rule.parameters[0], 10);
    return {
      name: rule.name,
      validator: (value: any) => ({
        passed: typeof value === 'string' && value.length <= max
      }),
      async: false,
      parameters: rule.parameters,
    };
  }

  private compileStringRegex(rule: ParsedRule): CompiledRule {
    const pattern = new RegExp(rule.parameters[0]);
    return {
      name: rule.name,
      validator: (value: any) => ({
        passed: typeof value === 'string' && pattern.test(value)
      }),
      async: false,
      parameters: rule.parameters,
    };
  }

  private compileStringEmail(rule: ParsedRule): CompiledRule {
    return {
      name: rule.name,
      validator: (value: any) => ({
        passed: typeof value === 'string' && RuleCompiler.EMAIL_REGEX.test(value)
      }),
      async: false,
      parameters: rule.parameters,
    };
  }

  private compileStringUrl(rule: ParsedRule): CompiledRule {
    return {
      name: rule.name,
      validator: (value: any) => {
        if (typeof value !== 'string') return { passed: false };
        
        try {
          new URL(value);
          return { passed: true };
        } catch {
          return { passed: false };
        }
      },
      async: false,
      parameters: rule.parameters,
    };
  }

  private compileStringAlpha(rule: ParsedRule): CompiledRule {
    return {
      name: rule.name,
      validator: (value: any) => ({
        passed: typeof value === 'string' && RuleCompiler.ALPHA_REGEX.test(value)
      }),
      async: false,
      parameters: rule.parameters,
    };
  }

  private compileStringAlphanumeric(rule: ParsedRule): CompiledRule {
    return {
      name: rule.name,
      validator: (value: any) => ({
        passed: typeof value === 'string' && RuleCompiler.ALPHANUMERIC_REGEX.test(value)
      }),
      async: false,
      parameters: rule.parameters,
    };
  }

  private compileNumberMin(rule: ParsedRule): CompiledRule {
    const min = parseFloat(rule.parameters[0]);
    return {
      name: rule.name,
      validator: (value: any) => ({
        passed: typeof value === 'number' && value >= min
      }),
      async: false,
      parameters: rule.parameters,
    };
  }

  private compileNumberMax(rule: ParsedRule): CompiledRule {
    const max = parseFloat(rule.parameters[0]);
    return {
      name: rule.name,
      validator: (value: any) => ({
        passed: typeof value === 'number' && value <= max
      }),
      async: false,
      parameters: rule.parameters,
    };
  }

  private compileNumberBetween(rule: ParsedRule): CompiledRule {
    const min = parseFloat(rule.parameters[0]);
    const max = parseFloat(rule.parameters[1]);
    return {
      name: rule.name,
      validator: (value: any) => ({
        passed: typeof value === 'number' && value >= min && value <= max
      }),
      async: false,
      parameters: rule.parameters,
    };
  }

  private compileNumberInteger(rule: ParsedRule): CompiledRule {
    return {
      name: rule.name,
      validator: (value: any) => ({
        passed: typeof value === 'number' && Number.isInteger(value)
      }),
      async: false,
      parameters: rule.parameters,
    };
  }

  private compileNullable(rule: ParsedRule): CompiledRule {
    return {
      name: rule.name,
      validator: (value: any) => {
        if (value == null || (typeof value === 'string' && value.trim() === '')) {
          return { passed: true, skip: true };
        }
        return { passed: true };
      },
      async: false,
      parameters: rule.parameters,
    };
  }

  private compileOptional(rule: ParsedRule): CompiledRule {
    return {
      name: rule.name,
      validator: (value: any) => {
        if (value == null || (typeof value === 'string' && value.trim() === '')) {
          return { passed: true, skip: true };
        }
        return { passed: true };
      },
      async: false,
      parameters: rule.parameters,
    };
  }

  private compileDate(rule: ParsedRule): CompiledRule {
    return {
      name: rule.name,
      validator: (value: any) => {
        if (value instanceof Date) {
          return { passed: !isNaN(value.getTime()) };
        }

        if (typeof value === 'string') {
          const parsed = parseDateString(value);
          return { passed: parsed instanceof Date && !isNaN(parsed.getTime()) };
        }

        return { passed: false };
      },
      async: false,
      parameters: rule.parameters,
    };
  }

  private compileGeneric(rule: ParsedRule): CompiledRule {
    const ruleDefinition = this.ruleEngine.getRule(rule.name);

    if (!ruleDefinition) {
      const errorMessage = `Rule "${rule.name}" not found`;
      return {
        name: rule.name,
        validator: () => ({ passed: false, message: errorMessage }),
        async: false,
        parameters: rule.parameters,
      };
    }

    // Pre-compute parameters array to avoid repeated property access
    const parameters = rule.parameters || [];

    if (ruleDefinition.async) {
      return {
        name: rule.name,
        validator: async (value: any, context: ValidationContext) => {
          try {
            const result = await ruleDefinition.validate(
              value,
              parameters,
              context.field,
              context.data
            );
            return { passed: result };
          } catch (error) {
            return {
              passed: false,
              message: `Rule "${rule.name}" execution failed: ${(error as Error).message}`,
            };
          }
        },
        async: true,
        parameters,
      };
    }

    return {
      name: rule.name,
      validator: (value: any, context: ValidationContext) => {
        try {
          const result = ruleDefinition.validate(
            value,
            parameters,
            context.field,
            context.data
          );

          if (result instanceof Promise) {
            throw new Error(
              `Rule "${rule.name}" is marked as synchronous but returned a Promise`
            );
          }

          return { passed: result };
        } catch (error) {
          return {
            passed: false,
            message: `Rule "${rule.name}" execution failed: ${(error as Error).message}`,
          };
        }
      },
      async: false,
      parameters,
    };
  }

  private compileUnion(rule: ParsedRule): CompiledRule {
    const unionRuleFromRegistry = this.ruleEngine.getRule('union');
    
    if (!unionRuleFromRegistry) {
      const errorMessage = 'Union rule not found';
      return {
        name: rule.name,
        validator: () => ({ passed: false, message: errorMessage }),
        async: true,
        parameters: rule.parameters,
      };
    }

    // Pre-compute performance options to avoid repeated property access
    const performanceOptions = {
      optimizeUnions: this.options.optimizeUnions,
      parallelValidation: this.options.parallelValidation,
    };

    return {
      name: rule.name,
      validator: async (value: any, context: ValidationContext) => {
        try {
          const passed = await unionRuleFromRegistry.validate(
            value,
            [...rule.parameters, performanceOptions],
            context.field,
            context.data
          );
          return { passed };
        } catch {
          return { passed: false, message: 'Union validation failed' };
        }
      },
      async: true,
      parameters: rule.parameters,
    };
  }
}