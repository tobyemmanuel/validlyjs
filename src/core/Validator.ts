import {
  ValidationSchema,
  ValidationResult,
  ValidatorOptions,
  GlobalConfig,
  CompiledRule,
  ValidationContext,
  RuleResult,
  ValidationError,
  AsyncValidationTask,
  CustomRuleDefinition,
  ParsedRule,
  CoercionOptions,
} from '../types';
import { RuleEngine } from './rule-engine';
import { FieldResolver } from './field-resolver';
import { UnionValidator } from './union-validator';
import { AsyncValidator } from './async-validator';
import { ParserFactory } from '../parsers';
import { MessageResolver } from '../messages/message-resolver';
import { ResponseFormatter, ResponseFormatterFactory } from '../response';
import { CompiledRuleCache, RuleCompiler } from './performance';
import { RuleRegistry } from './rule-registry';
import * as GlobalConfigModule from '../config';
import { parseDateString, toBoolean } from '@/utils';

export class Validator {
  private schema: ValidationSchema;
  private options: ValidatorOptions;
  private ruleEngine: RuleEngine;
  private fieldResolver: FieldResolver;
  private unionValidator: UnionValidator;
  private asyncValidator: AsyncValidator;
  private messageResolver: MessageResolver;
  private responseFormatter: ResponseFormatter;
  private cache: CompiledRuleCache;
  private compiler: RuleCompiler;
  private compiledRules: Map<string, CompiledRule[]> = new Map();
  
  // Performance optimizations - cached computed values
  private readonly defaultOptions: ValidatorOptions;
  private readonly coercionEnabled: boolean;
  private readonly coercionConfig: CoercionOptions;
  private readonly stopOnFirstError: boolean;
  private readonly debugMode: boolean;
  private readonly schemaKeys: string[];
  private readonly wildcardPatterns: { pattern: string; regex: RegExp }[];
  private readonly ruleNameToCoercionMap: Map<string, (value: any) => any>;
  private readonly fieldPathToWildcardCache: Map<string, string | null> = new Map();

  constructor(schema: ValidationSchema, options: ValidatorOptions = {}) {
    this.validateSchema(schema);
    this.schema = schema;
    this.defaultOptions = this.getDefaultOptions();
    this.options = { ...this.defaultOptions, ...options };
    
    // Cache frequently accessed options
    this.coercionEnabled = this.options.coercion?.enabled ?? true;
    this.coercionConfig = this.options.coercion!;
    this.stopOnFirstError = this.options.stopOnFirstError ?? false;
    this.debugMode = this.options.debug ?? false;
    this.schemaKeys = Object.keys(this.schema);
    
    // Pre-compile wildcard patterns for faster lookup
    this.wildcardPatterns = this.schemaKeys
      .filter(key => key.includes('*'))
      .map(pattern => ({
        pattern,
        regex: this.createWildcardRegex(pattern)
      }));
    
    // Create coercion function map for faster lookup
    this.ruleNameToCoercionMap = new Map([
      ['string', this.coercionConfig.strings ? (v: any) => v != null ? String(v) : v : null],
      ['number', this.coercionConfig.numbers ? (v: any) => {
        if (v == null) return v;
        const num = Number(v);
        return isNaN(num) ? v : num;
      } : null],
      ['boolean', this.coercionConfig.booleans ? (v: any) => v != null ? toBoolean(v) : v : null],
      ['date', this.coercionConfig.dates ? (v: any) => {
        if (v == null || typeof v !== 'string') return v;
        const result = parseDateString(v);
        return result ?? v;
      } : null],
    ].filter(([_, fn]) => fn !== null) as [string, (value: any) => any][]);

    this.messageResolver = new MessageResolver(this.options);
    this.ruleEngine = new RuleEngine();
    this.fieldResolver = new FieldResolver();
    this.unionValidator = new UnionValidator(this.ruleEngine, {
      parallelValidation: this.options.performance?.parallelValidation ?? false,
      stopOnFirstPass: true,
    });
    this.asyncValidator = new AsyncValidator(this.messageResolver);
    this.responseFormatter = ResponseFormatterFactory.getFormatter(
      this.options.responseType || 'laravel'
    );
    this.cache = new CompiledRuleCache();
    this.compiler = new RuleCompiler(this.ruleEngine);

    if (this.options.performance?.compileRules) {
      this.compileSchema();
    }
  }

  private validateSchema(schema: ValidationSchema): void {
    if (!schema || typeof schema !== 'object') {
      throw new Error('Invalid schema: must be a non-empty object');
    }
    for (const [field, rule] of Object.entries(schema)) {
      if (!field || typeof rule === 'undefined') {
        throw new Error(`Invalid schema entry for field "${field}"`);
      }
    }
  }

  private coerceValue(value: any, rules: CompiledRule[]): any {
    if (!this.coercionEnabled) return value;

    // Fast path - use pre-built coercion functions
    for (const rule of rules) {
      const coercionFn = this.ruleNameToCoercionMap.get(rule.name);
      if (coercionFn) {
        return coercionFn(value);
      }
    }
    return value;
  }

  validateSync(data: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];
    const resolvedFields = this.fieldResolver.resolveFields(this.schema, data);

    for (const [fieldPath, value] of resolvedFields) {
      const rules = this.getCompiledRules(fieldPath);
      const coercedValue = this.coerceValue(value, rules);
      
      const context: ValidationContext = {
        field: fieldPath,
        data,
        parameters: [],
      };

      // Only add optional properties if they have values
      const parentPath = this.fieldResolver.getParentPath(fieldPath);
      if (parentPath !== undefined) {
        context.parentPath = parentPath;
      }

      const arrayIndex = this.fieldResolver.getArrayIndex(fieldPath);
      if (arrayIndex !== undefined) {
        context.index = arrayIndex;
      }

      const fieldErrors = this.validateField(coercedValue, rules, context);
      errors.push(...fieldErrors);

      if (this.stopOnFirstError && errors.length > 0) {
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors: this.responseFormatter.format(errors, data),
      data,
    };
  }

  async validate(data: Record<string, any>): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const resolvedFields = this.fieldResolver.resolveFields(this.schema, data);
    const asyncTasks: AsyncValidationTask[] = [];

    for (const [fieldPath, value] of resolvedFields) {
      const rules = this.getCompiledRules(fieldPath);
      const coercedValue = this.coerceValue(value, rules);

      const context: ValidationContext = {
        field: fieldPath,
        data,
        parameters: [],
      };

      // Only add optional properties if they have values
      const parentPath = this.fieldResolver.getParentPath(fieldPath);
      if (parentPath !== undefined) {
        context.parentPath = parentPath;
      }

      const arrayIndex = this.fieldResolver.getArrayIndex(fieldPath);
      if (arrayIndex !== undefined) {
        context.index = arrayIndex;
      }

      const { syncErrors, asyncTasks: fieldAsyncTasks } =
        this.validateFieldWithAsync(coercedValue, rules, context);
      errors.push(...syncErrors);
      asyncTasks.push(...fieldAsyncTasks);
      
      if (this.stopOnFirstError && errors.length > 0) {
        break;
      }
    }

    if (
      asyncTasks.length > 0 &&
      (!this.stopOnFirstError || errors.length === 0)
    ) {
      const asyncErrors = await this.asyncValidator.validateTasks(asyncTasks);
      errors.push(...asyncErrors);
    }
    
    return {
      isValid: errors.length === 0,
      errors: this.responseFormatter.format(errors, data),
      data,
    };
  }

  private validateField(
    value: any,
    rules: CompiledRule[],
    context: ValidationContext
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    let shouldSkipRemaining = false;

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i] as CompiledRule;
      if (rule.async) continue;
      if (shouldSkipRemaining) break;

      try {
        const ruleContext = { ...context, parameters: rule.parameters || [] };
        const result = rule.validator(value, ruleContext) as RuleResult;

        if (result.skip) {
          shouldSkipRemaining = true;
          continue;
        }

        if (!result.passed) {
          const message = result.message || this.messageResolver.resolve({
            ...ruleContext,
            rule: rule.name,
            value,
          });
          errors.push({
            field: context.field,
            rule: rule.name,
            message,
            value,
            parameters: rule.parameters || [],
          });

          if (this.stopOnFirstError) {
            break;
          }
        }
      } catch (error) {
        if (this.debugMode) {
          console.error(
            `Rule "${rule.name}" failed for field "${context.field}":`,
            error
          );
        }
        errors.push({
          field: context.field,
          rule: rule.name,
          message: `Validation rule "${rule.name}" threw an error`,
          value,
          parameters: [],
        });
      }
    }

    return errors;
  }

  private validateFieldWithAsync(
    value: any,
    rules: CompiledRule[],
    context: ValidationContext
  ): { syncErrors: ValidationError[]; asyncTasks: AsyncValidationTask[] } {
    const syncErrors: ValidationError[] = [];
    const asyncTasks: AsyncValidationTask[] = [];
    let shouldSkipRemaining = false;

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i] as CompiledRule;
      if (shouldSkipRemaining) break;

      const ruleContext = { ...context, parameters: rule.parameters || [] };
      
      if (rule.async) {
        const validator = rule.validator as (
          value: any,
          context: ValidationContext
        ) => Promise<RuleResult>;
        
        asyncTasks.push({
          field: context.field,
          rule: rule.name,
          value,
          parameters: rule.parameters || [],
          validator: validator,
          context: ruleContext,
          ruleName: rule.name,
          execute: () => validator(value, ruleContext),
        });
      } else {
        try {
          const result = rule.validator(value, ruleContext) as RuleResult;
          
          if (result.skip) {
            shouldSkipRemaining = true;
            continue;
          }

          if (!result.passed) {
            const message = result.message || this.messageResolver.resolve({
              ...ruleContext,
              rule: rule.name,
              value,
            });
            
            syncErrors.push({
              field: context.field,
              rule: rule.name,
              message,
              value,
              parameters: rule.parameters || [],
            });

            if (this.stopOnFirstError) {
              break;
            }
          }
        } catch (error) {
          if (this.debugMode) {
            console.error(
              `Rule "${rule.name}" failed for field "${context.field}":`,
              error
            );
          }
          syncErrors.push({
            field: context.field,
            rule: rule.name,
            message: `Validation rule "${rule.name}" threw an error`,
            value,
            parameters: [],
          });
        }
      }
    }

    return { syncErrors, asyncTasks };
  }

  private getCompiledRules(fieldPath: string): CompiledRule[] {
    // Fast path - check compiled rules cache first
    const cachedRules = this.compiledRules.get(fieldPath);
    if (cachedRules) {
      return cachedRules;
    }

    // Check for exact match first
    let ruleDefinition = this.schema[fieldPath];
    let schemaKey = fieldPath;

    // If no exact match, try wildcard pattern
    if (!ruleDefinition) {
      schemaKey = this.findWildcardPattern(fieldPath) || fieldPath;
      ruleDefinition = schemaKey ? this.schema[schemaKey] : [];
    }

    if (!ruleDefinition) {
      return [];
    }

    const cacheKey = this.cache.generateKey(ruleDefinition);
    const cachedCompiledRules = this.cache.get(cacheKey);
    if (cachedCompiledRules) {
      this.compiledRules.set(fieldPath, cachedCompiledRules);
      return cachedCompiledRules;
    }

    const parser = ParserFactory.getParser(ruleDefinition);
    const parsedResult = parser.parse(ruleDefinition);

    let parsedRules: ParsedRule[];

    // Check if we have a union structure
    const hasUnionStructure = Array.isArray(parsedResult) &&
      parsedResult.some(rule => 
        Array.isArray(rule) || 
        (rule && typeof rule === 'object' && Array.isArray(rule.parameters?.[0]))
      );

    if (hasUnionStructure) {
      const modifierRules: ParsedRule[] = [];
      let unionRuleSets: ParsedRule[][] = [];

      for (const item of parsedResult) {
        if (Array.isArray(item)) {
          unionRuleSets.push(item);
        } else if (item && typeof item === 'object') {
          if (item.name === 'union' && Array.isArray(item.parameters?.[0])) {
            unionRuleSets = item.parameters[0];
          } else {
            modifierRules.push(item);
          }
        }
      }

      const unionRule: ParsedRule = {
        name: 'union',
        parameters: [unionRuleSets, true],
        modifiers: [],
        dataType: 'union' as any,
        async: true,
      };

      parsedRules = [...modifierRules, unionRule];
    } else {
      parsedRules = parsedResult as ParsedRule[];
    }

    const compiledRules = this.compiler.compile(parsedRules);
    this.cache.set(cacheKey, compiledRules);
    this.compiledRules.set(fieldPath, compiledRules);
    return compiledRules;
  }

  private createWildcardRegex(pattern: string): RegExp {
    let regexPattern = pattern;
    regexPattern = regexPattern.replace(/[+?^${}()|[\]\\]/g, '\\$&');
    regexPattern = regexPattern.replace(/\.\*/g, '\\[\\d+\\]');
    regexPattern = regexPattern.replace(/\./g, '\\.');
    return new RegExp(`^${regexPattern}$`);
  }

  private findWildcardPattern(fieldPath: string): string | null {
    // Check cache first
    const cached = this.fieldPathToWildcardCache.get(fieldPath);
    if (cached !== undefined) {
      return cached;
    }

    // Use pre-compiled regex patterns for faster matching
    for (const { pattern, regex } of this.wildcardPatterns) {
      if (regex.test(fieldPath)) {
        this.fieldPathToWildcardCache.set(fieldPath, pattern);
        return pattern;
      }
    }

    this.fieldPathToWildcardCache.set(fieldPath, null);
    return null;
  }

  private compileSchema(): void {
    for (const fieldPath of this.schemaKeys) {
      this.getCompiledRules(fieldPath);
    }
  }

  private getDefaultOptions(): ValidatorOptions {
    return {
      responseType: 'laravel',
      language: 'en',
      messages: {},
      fieldMessages: {},
      stopOnFirstError: false,
      coercion: {
        enabled: true,
        strings: true,
        numbers: true,
        booleans: false,
        dates: true,
      },
      performance: {
        cacheRules: true,
        optimizeUnions: true,
        parallelValidation: true,
        compileRules: true,
      },
    };
  }

  extend(name: string, rule: CustomRuleDefinition): void {
    this.ruleEngine.registerCustomRule({ name, ...rule });
    this.clearCompiledRulesCaches();
  }

  refresh(): void {
    this.clearCompiledRulesCaches();
  }

  private clearCompiledRulesCaches(): void {
    this.compiledRules.clear();
    this.cache.clear();
    this.fieldPathToWildcardCache.clear();
  }

  // private clearCachesForCustomRule(ruleName: string): void {
  //   for (const [fieldPath, rules] of this.compiledRules.entries()) {
  //     if (rules.some(rule => rule.name === ruleName)) {
  //       this.compiledRules.delete(fieldPath);
  //     }
  //   }
  //   this.cache.clear();
  // }

  setLanguage(language: string): void {
    this.options.language = language;
    this.messageResolver.setLanguage(language);
  }

  createLanguage(code: string, messages: any): void {
    this.options.language = code;
    this.options.messages = { ...this.options.messages, ...messages };
  }

  setMessages(messages: Record<string, string>): void {
    this.options.messages = { ...this.options.messages, ...messages };
  }

  setFieldMessages(fieldMessages: Record<string, string>): void {
    this.options.messages = { ...this.options.messages, ...fieldMessages };
  }

  static extend(name: string, rule: CustomRuleDefinition): void {
    RuleRegistry.registerCustomRule(name, rule);
  }

  static configure(config: Partial<GlobalConfig>): void {
    GlobalConfigModule.GlobalConfig.configure(config);
  }

  static usePreset(preset: string): void {
    GlobalConfigModule.GlobalConfig.usePreset(preset);
  }

  static createPreset(name: string, config: Partial<GlobalConfig>): void {
    GlobalConfigModule.GlobalConfig.createPreset(name, config);
  }
}