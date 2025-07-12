import { Rule } from '../../types/rules';
import { ValidationContext } from '../../types';
import { RuleEngine } from '../../core/rule-engine';

// Cache rule engine instance to avoid repeated instantiation
let cachedRuleEngine: RuleEngine | null = null;

const getRuleEngine = (): RuleEngine => {
  if (!cachedRuleEngine) {
    cachedRuleEngine = new RuleEngine();
  }
  return cachedRuleEngine;
};

/**
 * Array each validation - validates each array element against rules
 */
export const arrayEachRule: Rule = {
  name: 'array.each',
  validate: async (value: any, parameters: any[], field: string, data: Record<string, any>): Promise<boolean> => {
    // Fast type check using bitwise operations for array detection
    if (!(value && typeof value === 'object' && typeof value.length === 'number')) return false;
    
    const ruleDefinition = parameters[0];
    if (!ruleDefinition) return true; // No rule to validate against
    
    const ruleEngine = getRuleEngine();
    const len = value.length;
    
    // Pre-allocate context object to avoid repeated object creation
    const elementContext: ValidationContext = {
      field: '',
      data,
      parameters: [],
      index: 0
    };
    
    // Use for loop with cached length for maximum performance
    for (let i = 0; i < len; i++) {
      // Reuse context object, only update changing properties
      elementContext.field = `${field}[${i}]`;
      elementContext.index = i;
      
      const result = await ruleEngine.validateValue(value[i], ruleDefinition, elementContext);
      if (!result.passed) {
        return false;
      }
    }
    
    return true;
  },
  message: 'One or more items in {field} are invalid.',
  async: true
};
