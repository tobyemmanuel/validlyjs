import { Parser, ParsedRule, DataType } from '../types';
import { RuleRegistry } from '../core/rule-registry';

export class StringParser implements Parser {
  readonly priority = 1;

  // Common modifiers that apply to any data type
  private static readonly MODIFIERS = new Set([
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

  // Data types
  private static readonly DATA_TYPES = new Set<DataType>([
    'string',
    'number',
    'boolean',
    'date',
    'array',
    'object',
    'file',
  ]);

  // Rules that should treat their entire parameter as a single string
  private static readonly LITERAL_PARAMETER_RULES = new Set([
    'format',
    'regex',
    'pattern',
  ]);

  // Reference to union parser - should be injected
  private unionParser: any = null;

  // Method to set union parser reference
  setUnionParser(unionParser: any): void {
    this.unionParser = unionParser;
  }

  canParse(input: any): boolean {
    return (
      typeof input === 'string' &&
      input.length > 0 &&
      !input.startsWith('union:')
    );
  }

  parse(input: string): ParsedRule[] {
    if (!input?.trim()) {
      throw new Error('Invalid string schema');
    }

    const rules = this.splitRules(input);
    const parsedRules: ParsedRule[] = [];
    const modifierRules: ParsedRule[] = [];
    let currentDataType: DataType | null = null;

    for (const rule of rules) {
      try {
        const parsedRule = this.parseRule(rule);

        // Handle union rules
        if (this.isUnionRule(parsedRule, rule)) {
          return this.handleUnionRule(rule, parsedRule, modifierRules);
        }

        // Process rule based on type
        const processedRule = this.processRule(parsedRule, currentDataType);

        if (processedRule.isModifier) {
          modifierRules.push(processedRule);
        } else {
          if (
            processedRule.dataType &&
            StringParser.DATA_TYPES.has(processedRule.dataType)
          ) {
            currentDataType = processedRule.dataType;
          }
          parsedRules.push(processedRule);
        }
      } catch (error: any) {
        throw new Error(`Error parsing rule '${rule}': ${error.message}`);
      }
    }

    // Return modifiers first, then other rules
    return [...modifierRules, ...parsedRules];
  }

  private isUnionRule(
    parsedRule: [string, any[] | null],
    rule: string
  ): boolean {
    return parsedRule[0] === 'union' || rule.startsWith('union:');
  }

  private handleUnionRule(
    rule: string,
    parsedRule: [string, any[] | null],
    modifierRules: ParsedRule[]
  ): ParsedRule[] {
    if (!this.unionParser) {
      throw new Error('Union parser not available');
    }

    const unionInput = rule.startsWith('union:')
      ? rule
      : `union:${parsedRule[1]?.join(',') || ''}`;

    const unionResult = this.unionParser.parse(unionInput);

    // Return modifiers first, then union result
    return modifierRules.length > 0
      ? [...modifierRules, ...unionResult]
      : unionResult;
  }

  private processRule(
    parsedRule: [string, any[] | null],
    currentDataType: DataType | null
  ): ParsedRule {
    const [name, params] = parsedRule;

    // Check if this is a data type
    if (StringParser.DATA_TYPES.has(name as DataType)) {
      return {
        name,
        parameters: params || [],
        modifiers: [],
        dataType: name as DataType,
      };
    }

    // Check if this is a modifier
    if (StringParser.MODIFIERS.has(name)) {
      return {
        name,
        parameters: params || [],
        modifiers: [],
        isModifier: true,
      };
    }

    // Handle custom rules
    if (RuleRegistry.isCustomRule(name)) {
      return {
        name,
        parameters: params || [],
        modifiers: [],
        dataType: 'custom',
      };
    }

    // Handle typed rules
    if (!currentDataType) {
      currentDataType = 'string';
      // throw new Error(`Validation rule '${name}' found without a data type`);
    }

    return {
      name: `${currentDataType}.${name}`,
      parameters: params || [],
      modifiers: [],
      dataType: currentDataType,
    };
  }

  private splitRules(input: string): string[] {
    const rules: string[] = [];
    let current = '';
    let state = {
      inParameters: false,
      bracketDepth: 0,
      inQuotes: false,
      quoteChar: '',
    };

    for (let i = 0; i < input.length; i++) {
      const char = input[i] as string;

      if (this.handleQuotes(char, state)) {
        current += char;
      } else if (
        this.handleSpecialCharacters(char, state, current, rules, i, input)
      ) {
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      rules.push(current.trim());
    }

    return rules;
  }

  private handleQuotes(char: string, state: any): boolean {
    if ((char === '"' || char === "'") && !state.inQuotes) {
      state.inQuotes = true;
      state.quoteChar = char;
      return true;
    } else if (char === state.quoteChar && state.inQuotes) {
      state.inQuotes = false;
      state.quoteChar = '';
      return true;
    } else if (state.inQuotes) {
      return true;
    }
    return false;
  }

  private handleSpecialCharacters(
    char: string,
    state: any,
    current: string,
    rules: string[],
    index: number,
    input: string
  ): boolean {
    if (char === ':' && !state.inParameters) {
      state.inParameters = true;
      return false;
    }

    if (char === '(' && state.inParameters) {
      state.bracketDepth++;
      return false;
    }

    if (char === ')' && state.inParameters) {
      state.bracketDepth--;
      return false;
    }

    if (char === '|' && state.bracketDepth === 0) {
      if (state.inParameters) {
        // Look ahead to see if this starts a new rule
        const nextNonSpace = this.findNextNonSpace(input, index + 1);
        if (
          nextNonSpace !== -1 &&
          /[a-zA-Z]/.test(input[nextNonSpace] as string)
        ) {
          state.inParameters = false;
        }
      }

      if (!state.inParameters) {
        rules.push(current.trim());
        return true;
      }
    }

    return false;
  }

  private findNextNonSpace(input: string, startIndex: number): number {
    for (let i = startIndex; i < input.length; i++) {
      if (input[i] !== ' ') {
        return i;
      }
    }
    return -1;
  }

  private parseRule(rule: string): [string, any[] | null] {
    const colonIndex = this.findParameterSeparator(rule);

    if (colonIndex === -1) {
      return [rule.trim(), null];
    }

    const name = rule.substring(0, colonIndex).trim();
    const paramString = rule.substring(colonIndex + 1);

    if (!paramString) {
      return [name, null];
    }

    // Special handling for union rules
    if (name === 'union') {
      return [name, [paramString]];
    }

    // Special handling for literal parameter rules
    if (StringParser.LITERAL_PARAMETER_RULES.has(name)) {
      return [name, [paramString.trim()]];
    }

    // Parse comma-separated parameters
    const params = this.parseParameters(paramString);
    return [name, params];
  }

  private parseParameters(paramString: string): any[] {
    const params: any[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (const char of paramString) {
      if (
        this.handleParameterQuotes(
          char,
          { inQuotes, quoteChar },
          current,
          params
        )
      ) {
        // Quote handling done, continue
        ({ inQuotes, quoteChar } = { inQuotes, quoteChar });
      } else if (char === ',' && !inQuotes) {
        params.push(this.convertParameter(current.trim()));
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      params.push(this.convertParameter(current.trim()));
    }

    return params;
  }

  private handleParameterQuotes(
    char: string,
    state: { inQuotes: boolean; quoteChar: string },
    _current: string,
    _params: any[]
  ): boolean {
    if ((char === '"' || char === "'") && !state.inQuotes) {
      state.inQuotes = true;
      state.quoteChar = char;
      return true;
    } else if (char === state.quoteChar && state.inQuotes) {
      state.inQuotes = false;
      state.quoteChar = '';
      return true;
    }
    return false;
  }

  private convertParameter(param: string): any {
    // Try to convert to number
    const num = Number(param);
    if (!isNaN(num) && param !== '') {
      return num;
    }

    // Try to convert to boolean
    if (param === 'true') return true;
    if (param === 'false') return false;

    // Return as string
    return param;
  }

  private findParameterSeparator(rule: string): number {
    // For rules that need special handling of colons
    for (const specialRule of StringParser.LITERAL_PARAMETER_RULES) {
      if (rule.startsWith(specialRule + ':')) {
        return specialRule.length;
      }
    }

    // For other rules, find the first colon
    return rule.indexOf(':');
  }
}
