import {
  Rule,
  RuleResult,
  ValidationContext,
  RuleDefinition,
} from '../types';
import { RuleRegistry } from './rule-registry';
import { ValidationCache } from './performance/cache';
import { StringParser } from '../parsers/string-parser';

export class RuleEngine {
  private cache: ValidationCache = new ValidationCache();
  private stringParser: StringParser = new StringParser();

  constructor() {
    // Load built-in rules using the static RuleRegistry
    RuleRegistry.loadBuiltInRules();
  }

  registerRule(rule: Rule): void {
    RuleRegistry.register(rule.name, rule);
  }

  registerCustomRule(rule: Rule): void {
    RuleRegistry.registerCustomRule(rule.name, rule);
  }

  getRule(name: string): Rule | undefined {
    return RuleRegistry.get(name);
  }

  getAllRules(): Rule[] {
    return Array.from(RuleRegistry.getAll().values());
  }

  hasRule(name: string): boolean {
    return RuleRegistry.has(name);
  }

  async executeRule(
    ruleName: string,
    value: any,
    parameters: any[],
    context: ValidationContext
  ): Promise<RuleResult> {
    const cacheKey = `${ruleName}:${context.field}:${JSON.stringify(parameters)}:${JSON.stringify(value)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const rule = this.getRule(ruleName);
    if (!rule) {
      return { passed: false, message: `Unknown validation rule: ${ruleName}` };
    }

    // Handle nullable/optional rules with early return
    if (this.isNullableRule(rule.name) && this.isNullOrEmpty(value)) {
      return { passed: true, skip: true };
    }

    try {
      this.validateParameters(rule, parameters);
      const result = await rule.validate(
        value,
        parameters,
        context.field,
        context.data
      );

      const ruleResult: RuleResult = {
        passed: result,
        skip: false,
        ...((!result && rule.message) && { message: rule.message }) // Only add message when needed
      };

      this.cache.set(cacheKey, ruleResult);
      return ruleResult;
    } catch (error) {
      const ruleResult: RuleResult = {
        passed: false,
        message: `Rule "${ruleName}" execution failed: ${(error as Error).message}`,
        skip: false,
      };
      this.cache.set(cacheKey, ruleResult);
      return ruleResult;
    }
  }

  private isNullableRule(ruleName: string): boolean {
    return ruleName === 'nullable' || ruleName === 'optional';
  }

  private isNullOrEmpty(value: any): boolean {
    return value == null || (typeof value === 'string' && value.trim() === '');
  }

  private validateParameters(rule: Rule, parameters: any[]): void {
    if (!rule.name.startsWith('string.')) return;

    const rulePart = rule.name.split('.')[1];
    if (!rulePart || !['min', 'max', 'length', 'size', 'between'].includes(rulePart)) {
      return;
    }

    parameters.forEach((p, i) => {
      if (isNaN(Number(p))) {
        throw new Error(`Parameter ${i} for ${rule.name} must be a number`);
      }
    });
  }

  async validateValue(
    value: any,
    rule: RuleDefinition,
    context: ValidationContext
  ): Promise<RuleResult> {
    // Handle array rules
    if (Array.isArray(rule)) {
      return this.validateArrayRules(value, rule, context);
    }

    // Handle string rules
    if (typeof rule === 'string') {
      return this.validateStringRule(value, rule, context);
    }

    // Handle fluent rules
    if (rule._type === 'fluent') {
      return this.validateFluentRule(value, rule, context);
    }

    // Handle union rules
    if (rule._type === 'union') {
      return this.validateUnionRule(value, rule, context);
    }

    return {
      passed: false,
      message: `Unsupported rule format: ${JSON.stringify(rule)}`,
      skip: false,
    };
  }

  private async validateArrayRules(
    value: any,
    rules: RuleDefinition[],
    context: ValidationContext
  ): Promise<RuleResult> {
    for (const subRule of rules) {
      const result = await this.validateValue(value, subRule, context);
      if (!result.passed || result.skip) {
        return result;
      }
    }
    return { passed: true, skip: false };
  }

  private async validateStringRule(
    value: any,
    rule: string,
    context: ValidationContext
  ): Promise<RuleResult> {
    try {
      const parsedRules = this.stringParser.parse(rule);

      // Execute each parsed rule in sequence
      for (const parsedRule of parsedRules) {
        const result = await this.executeRule(
          parsedRule.name,
          value,
          parsedRule.parameters || [],
          context
        );

        if (!result.passed || result.skip) {
          return result;
        }
      }

      return { passed: true, skip: false };
    } catch (error) {
      return {
        passed: false,
        message: `Failed to parse rule '${rule}': ${(error as Error).message}`,
      };
    }
  }

  private async validateFluentRule(
    value: any,
    rule: any,
    context: ValidationContext
  ): Promise<RuleResult> {
    // Process modifiers first (required, nullable, etc.)
    if (rule._modifiers && rule._modifiers.length > 0) {
      const modifierResult = await this.processModifiers(value, rule._modifiers, context);
      if (!modifierResult.passed || modifierResult.skip) {
        return modifierResult;
      }
    }

    // Then process the regular rules
    for (const subRule of rule._rules) {
      const result = await this.executeRule(
        subRule.name,
        value,
        subRule.parameters || [],
        context
      );
      if (!result.passed || result.skip) {
        return result;
      }
    }
    return { passed: true, skip: false };
  }

  private async processModifiers(
    value: any,
    modifiers: any[],
    context: ValidationContext
  ): Promise<RuleResult> {
    for (const modifier of modifiers) {
      let modifierResult: RuleResult;

      switch (modifier.type) {
        case 'required':
          modifierResult = await this.executeRule('required', value, [], context);
          break;
        case 'nullable':
          modifierResult = await this.executeRule('nullable', value, [], context);
          break;
        case 'conditional':
          if (modifier.parameters) {
            const [ruleName, ...params] = modifier.parameters;
            modifierResult = await this.executeRule(ruleName, value, params, context);
          } else {
            modifierResult = { passed: true, skip: false };
          }
          break;
        default:
          modifierResult = { passed: true, skip: false };
      }

      if (!modifierResult.passed || modifierResult.skip) {
        return modifierResult;
      }
    }

    return { passed: true, skip: false };
  }

  private async validateUnionRule(
    value: any,
    rule: any,
    context: ValidationContext
  ): Promise<RuleResult> {
    for (const subRule of rule.rules) {
      const result = await this.validateValue(value, subRule, context);
      if (result.passed) {
        return { passed: true, skip: false };
      }
    }
    return {
      passed: false,
      message: 'None of the union rules passed.',
      skip: false,
    };
  }
}