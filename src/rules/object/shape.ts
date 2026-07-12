import { Rule, RuleDefinition } from '../../types';
import { ValidationContext } from '../../types';
import { RuleEngine } from '../../core/rule-engine';

// Reusable RuleEngine instance to avoid repeated instantiation
let sharedRuleEngine: RuleEngine | null = null;

// Pre-compiled type checkers
const isValidObject = (value: any): value is Record<string, any> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isValidShapeDefinition = (shapeDefinition: any): shapeDefinition is Record<string, any> => {
  return shapeDefinition && typeof shapeDefinition === 'object' && !Array.isArray(shapeDefinition);
};

/**
 * Object shape validation - validates object structure against a schema
 */
export const objectShapeRule: Rule = {
  name: 'object.shape',
  validate: async (value: any, parameters: any[], field: string, data: Record<string, any>): Promise<boolean> => {
    // Fast path for non-objects
    if (!isValidObject(value)) {
      return false;
    }
   
    const [shapeDefinition] = parameters;
    if (!isValidShapeDefinition(shapeDefinition)) {
      return true; // No shape to validate against
    }

    // Lazy initialization of shared RuleEngine
    if (!sharedRuleEngine) {
      sharedRuleEngine = new RuleEngine();
    }

    // Get all shape properties once
    const shapeEntries = Object.entries(shapeDefinition);
    
    // Early return if no properties to validate
    if (shapeEntries.length === 0) {
      return true;
    }

    // Batch validation for better performance
    const validationPromises: Promise<boolean>[] = [];
    
    for (let i = 0; i < shapeEntries.length; i++) {
      const [propertyName, propertyRules] = shapeEntries[i] as [string, any];

      // Prepare validation
      const propertyValue = value[propertyName];
      const propertyContext: ValidationContext = {
        field: `${field}.${propertyName}`,
        data: data,
        parameters: []
      };

      // Optimize rule definition processing
      const ruleDefinition = normalizeRuleDefinition(propertyRules);
      
      // Add to validation batch
      validationPromises.push(
        validateProperty(
          sharedRuleEngine,
          propertyValue,
          ruleDefinition,
          propertyContext
        )
      );
    }

    // Execute all validations
    const results = await Promise.all(validationPromises);
    
    // Check if all validations passed
    return results.every(result => result);
  },
  message: 'The {field} does not match the required shape.',
  async: true
};

/**
 * Optimized helper function to normalize rule definitions
 */
function normalizeRuleDefinition(propertyRules: any): RuleDefinition {
  // Fast path for string rules
  if (typeof propertyRules === 'string') {
    return propertyRules;
  }
  
  // Fast path for fluent builder objects
  if (propertyRules && typeof propertyRules === 'object' && propertyRules._type === 'fluent') {
    return propertyRules as RuleDefinition;
  }
  
  // Default case
  return propertyRules as RuleDefinition;
}

/**
 * Optimized property validation (no value-keyed caching, which previously retained
 * JSON-serialized payloads and could return stale results).
 */
async function validateProperty(
  ruleEngine: RuleEngine,
  propertyValue: any,
  ruleDefinition: RuleDefinition,
  propertyContext: ValidationContext
): Promise<boolean> {
  try {
    const result = await ruleEngine.validateValue(propertyValue, ruleDefinition, propertyContext);
    return result.passed;
  } catch (error) {
    return false;
  }
}

/**
 * Object has property validation - optimized version
 */
export const objectHasRule: Rule = {
  name: 'object.has',
  validate: (value: any, parameters: any[]): boolean => {
    // Fast path for non-objects
    if (!isValidObject(value)) {
      return false;
    }
   
    const [propertyName] = parameters;
    
    // Fast path for invalid property names
    if (typeof propertyName !== 'string' && typeof propertyName !== 'number' && typeof propertyName !== 'symbol') {
      return false;
    }
    
    // Only consider own (non-inherited) properties to avoid prototype pollution.
    return Object.prototype.hasOwnProperty.call(value, propertyName);
  },
  message: 'The {field} must have the property {0}.'
};

// Utility function retained for API compatibility (previously cleared a value-keyed cache).
export function clearObjectValidationCache(): void {
  // No-op: results are no longer cached by value.
}