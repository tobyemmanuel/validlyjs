import { Parser, ParsedRule, DataType } from '../types';
import { RuleRegistry } from '../core/rule-registry';

// Pre-defined sets for faster lookups
const TYPE_RULES = new Set([
  'string',
  'number',
  'boolean',
  'date',
  'file',
  'array',
  'object',
]);

const MODIFIER_RULES = new Set([
  'required',
  'optional',
  'nullable',
  'required_with',
  'required_unless',
  'required_with_all',
  'required_without',
  'required_if',
  'prohibited_if',
  'prohibited_unless',
  'prohibited',
  'same',
  'present',
  'confirmed',
  'different',
]);

export class ArrayParser implements Parser {
  priority = 2;

  canParse(input: any): boolean {
    if (!Array.isArray(input)) return false;

    for (let i = 0; i < input.length; i++) {
      const item = input[i];
      if (typeof item === 'string') continue;

      if (Array.isArray(item)) {
        for (let j = 0; j < item.length; j++) {
          if (typeof item[j] !== 'string') return false;
        }
      } else {
        return false;
      }
    }

    return true;
  }

  parse(input: any): ParsedRule[] | ParsedRule[][] {
    if (!this.canParse(input)) {
      throw new Error('Invalid array schema');
    }

    const typedInput = input as (string | string[])[];

    // Handle nested arrays for union types
    if (typedInput.length > 0 && Array.isArray(typedInput[0])) {
      const result: ParsedRule[][] = [];
      result.length = typedInput.length;

      for (let i = 0; i < typedInput.length; i++) {
        result[i] = this.parseRuleSet(typedInput[i] as string[]);
      }

      return result;
    }

    // Return flat array for regular rule sets
    return this.parseRuleSet(typedInput as string[]);
  }

  private parseRuleSet(rules: string[]): ParsedRule[] {
    let dataType: DataType | undefined;

    // First pass: find the data type
    for (let i = 0; i < rules.length; i++) {
      const [name] = this.parseRule(rules[i] as string);
      if (TYPE_RULES.has(name)) {
        dataType = name as DataType;
        break;
      }
    }

    // If no explicit type found, default to 'string'
    if (!dataType) {
      dataType = 'string';
    }

    const result: ParsedRule[] = [];
    result.length = rules.length;

    for (let i = 0; i < rules.length; i++) {
      const [name, params] = this.parseRule(rules[i] as string);

      // Check if this rule updates the data type
      if (TYPE_RULES.has(name)) {
        dataType = name as DataType;
        result[i] = {
          name,
          parameters: [],
          modifiers: [],
          dataType: dataType!,
        };
        continue;
      }

      // Check if this is a modifier
      if (MODIFIER_RULES.has(name)) {
        result[i] = {
          name,
          parameters: this.convertParameters(params),
          modifiers: [],
          isModifier: true,
        };
        continue;
      }

      // Handle custom rules - check if rule exists in registry
      if (RuleRegistry.isCustomRule(name)) {
        result[i] = {
          name,
          parameters: this.convertParameters(params),
          modifiers: [],
          dataType: 'custom',
        };
        continue;
      }

      // This is a validation rule - prefix with data type
      result[i] = {
        name: `${dataType}.${name}`,
        parameters: this.convertParameters(params),
        modifiers: [],
        dataType: dataType!,
      };
    }

    return result;
  }

  private parseRule(rule: string): [string, string[] | null] {
    // Find the first colon that's not part of a time format
    const colonIndex = this.findParameterSeparator(rule);

    if (colonIndex === -1) {
      return [rule.trim(), null];
    }

    const name = rule.substring(0, colonIndex).trim();
    const paramString = rule.substring(colonIndex + 1);

    if (!paramString) {
      return [name, null];
    }

    // For format rules, treat the entire parameter as a single string
    if (name === 'format') {
      return [name, [paramString.trim()]];
    }

    // For other rules, split by comma
    const params = paramString.split(',');
    for (let i = 0; i < params.length; i++) {
      params[i] = params[i]?.trim() ?? '';
    }

    return [name, params];
  }

  private findParameterSeparator(rule: string): number {
    // For format rules, we need to be more careful about colons
    if (rule.startsWith('format:')) {
      return 6; // Length of 'format'
    }

    // For other rules, find the first colon
    return rule.indexOf(':');
  }

  private convertParameters(params: string[] | null): any[] {
    if (!params) return [];

    const result: any[] = [];
    result.length = params.length;

    for (let i = 0; i < params.length; i++) {
      const param = params[i];

      // Try to convert to number
      const num = Number(param);
      if (!isNaN(num)) {
        result[i] = num;
        continue;
      }

      // Try to convert to boolean
      if (param === 'true') {
        result[i] = true;
        continue;
      }
      if (param === 'false') {
        result[i] = false;
        continue;
      }

      // Return as string
      result[i] = param;
    }

    return result;
  }
}
