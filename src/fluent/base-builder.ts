import {
  FluentRule,
  RuleModifier,
  DataType,
  CompiledRule,
  ValidationContext,
} from '../types';
import { RuleRegistry } from '@/core/rule-registry';
export abstract class BaseFluentBuilder implements FluentRule {
  _type: 'fluent' = 'fluent';
  _rules: CompiledRule[] = [];
  _modifiers: RuleModifier[] = [];
  _dataType: DataType;

  constructor(dataType: DataType) {
    this._dataType = dataType;
    // Add automatic type validation using registry
    // this.addRegistryRule(dataType, []);
  }

  /**
   * Helper method to add rules that reference the central registry
   * instead of inline validators
   */
  protected addRegistryRule(ruleName: string, parameters: any[] = []): this {
    const compiledRule: CompiledRule = {
      name: ruleName,
      validator: (_value: any, _context: ValidationContext) => {
        // This will be handled by the rule engine using the registry
        // Return a placeholder that indicates registry lookup is needed
        return { passed: true };
      },
      parameters,
      async: false,
      dependencies: [],
    };

    this._rules.push(compiledRule);
    return this;
  }

  required(): this {
    this._modifiers.push({ type: 'required' });
    return this;
  }

  nullable(): this {
    this._modifiers.push({ type: 'nullable' });
    return this;
  }

  optional(): this {
    return this.nullable();
  }

  custom(name: string, parameters: any[] = []): this {
    // Check if the custom rule exists in the registry
    if (!RuleRegistry.has(name)) {
      throw new Error(
        `Custom rule '${name}' is not registered. Use Validator.extend() to register it first.`
      );
    }

    return this.addRegistryRule(name, parameters);
  }

  // Conditional requirements
  requiredIf(field: string, value: any | ((value: any) => boolean)): this {
    this._modifiers.push({
      type: 'conditional',
      parameters: [
        'required_if',
        field,
        typeof value === 'function' ? 'callback' : value,
      ],
    });
    return this;
  }

  requiredWith(...fields: string[]): this {
    this._modifiers.push({
      type: 'conditional',
      parameters: ['required_with', ...fields],
    });
    return this;
  }

  requiredWithAll(fields: string[]): this {
    this._modifiers.push({
      type: 'conditional',
      parameters: ['required_with_all', ...fields],
    });
    return this;
  }

  requiredWithout(...fields: string[]): this {
    this._modifiers.push({
      type: 'conditional',
      parameters: ['required_without', ...fields],
    });
    return this;
  }

  requiredWithoutAll(fields: string[]): this {
    this._modifiers.push({
      type: 'conditional',
      parameters: ['required_without_all', ...fields],
    });
    return this;
  }

  requiredUnless(field: string, value: any): this {
    this._modifiers.push({
      type: 'conditional',
      parameters: ['required_unless', field, value],
    });
    return this;
  }

  // Add missing prohibited modifiers
  prohibited(): this {
    this._modifiers.push({ type: 'conditional', parameters: ['prohibited'] });
    return this;
  }

  prohibitedIf(field: string, value: any): this {
    this._modifiers.push({
      type: 'conditional',
      parameters: ['prohibited_if', field, value],
    });
    return this;
  }

  prohibitedUnless(field: string, value: any): this {
    this._modifiers.push({
      type: 'conditional',
      parameters: ['prohibited_unless', field, value],
    });
    return this;
  }

  // Fix incorrectly implemented modifiers
  same(field: string): this {
    this._modifiers.push({
      type: 'conditional',
      parameters: ['same', field],
    });
    return this;
  }

  present(field: string): this {
    this._modifiers.push({
      type: 'conditional',
      parameters: ['present', field],
    });
    return this;
  }

  confirmed(field: string): this {
    this._modifiers.push({
      type: 'conditional',
      parameters: ['confirmed', field],
    });
    return this;
  }

  different(field: string): this {
    this._modifiers.push({
      type: 'conditional',
      parameters: ['different', field],
    });
    return this;
  }

  when(field: string, conditions: any): this {
    this._modifiers.push({
      type: 'conditional',
      parameters: ['when', field, conditions],
    });
    return this;
  }
}
