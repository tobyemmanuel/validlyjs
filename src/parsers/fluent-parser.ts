import {
  Parser,
  ParsedRule,
  FluentRule,
  RuleModifier,
} from '../types';

export class FluentParser implements Parser {
  priority = 3; // Highest priority as it's the most specific
  
  canParse(input: any): boolean {
    return input?._type === 'fluent';
  }
  
  parse(input: any): ParsedRule[] | ParsedRule[][] {
    if (!input || input._type !== 'fluent') {
      throw new Error('Invalid fluent schema');
    }
    
    const dataType = input._dataType;
    
    // Use switch for better performance than multiple if statements
    switch (dataType) {
      case 'union':
        return this.parseUnion(input);
      case 'object':
        return this.parseObject(input);
      default:
        return this.parseRegular(input);
    }
  }
  
  private parseUnion(input: any): ParsedRule[][] {
    const unionSchemas: FluentRule[] = input.rules || [];
    const result: ParsedRule[][] = [];
    
    // Pre-allocate array for better performance
    result.length = unionSchemas.length;
    
    for (let i = 0; i < unionSchemas.length; i++) {
      result[i] = this.parse(unionSchemas[i]) as ParsedRule[];
    }
    
    return result;
  }
  
  private parseObject(input: any, prefix: string = ''): ParsedRule[] {
    const rules: ParsedRule[] = [];
    
    // Add the object type rule only for root level
    if (!prefix) {
      rules.push({
        name: 'object',
        parameters: [],
        modifiers: [],
        dataType: 'object',
      });
    }
    
    // Process modifiers
    const modifiers = input._modifiers;
    if (modifiers && modifiers.length > 0) {
      for (let i = 0; i < modifiers.length; i++) {
        rules.push(this.parseModifier(modifiers[i]));
      }
    }
    
    // Process rules - find shape rule first for efficiency
    const inputRules = input._rules;
    let shapeRule = null;
    
    if (inputRules && inputRules.length > 0) {
      // Single pass through rules to find shape rule and collect others
      for (let i = 0; i < inputRules.length; i++) {
        const rule = inputRules[i];
        if (rule.name === 'object.shape') {
          shapeRule = rule;
        } else {
          rules.push({
            name: rule.name,
            parameters: rule.parameters || [],
            modifiers: [],
            dataType: 'object',
          });
        }
      }
      
      // Add shape rule if found
      if (shapeRule && shapeRule.parameters[0]) {
        rules.push({
          name: 'object.shape',
          parameters: shapeRule.parameters,
          modifiers: [],
          dataType: 'object',
        });
      }
    }
    
    return rules;
  }
  
  private parseRegular(input: FluentRule): ParsedRule[] {
    const dataType = input._dataType;
    const rules: ParsedRule[] = [];
    
    // Add data type rule first
    rules.push({
      name: dataType,
      parameters: [],
      modifiers: [],
      dataType: dataType,
    });
    
    // Add all modifiers
    const modifiers = input._modifiers;
    if (modifiers && modifiers.length > 0) {
      for (let i = 0; i < modifiers.length; i++) {
        rules.push(this.parseModifier(modifiers[i] as RuleModifier));
      }
    }
    
    // Add all validation rules
    const inputRules = input._rules;
    if (inputRules && inputRules.length > 0) {
      for (let i = 0; i < inputRules.length; i++) {
        const rule = inputRules[i];
        rules.push({
          name: rule?.name as string || 'unknown',
          parameters: rule?.parameters || [],
          modifiers: [],
          dataType: dataType,
        });
      }
    }
    
    return rules;
  }
  
  private parseModifier(modifier: RuleModifier): ParsedRule {
    return {
      name: modifier.type,
      parameters: modifier.parameters || [],
      modifiers: [],
      isModifier: true,
    };
  }
}