import { Rule, RuleDefinition } from '../../types';
import { ValidationContext } from '../../types';
import { RuleEngine } from '../../core/rule-engine';

// Reusable RuleEngine instance to avoid repeated instantiation
let sharedRuleEngine: RuleEngine | null = null;

// Cache for property validation results
const propertyValidationCache = new Map<string, boolean>();

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
      
      // Create cache key for this validation
      const cacheKey = `${field}.${propertyName}:${JSON.stringify(propertyRules)}:${JSON.stringify(value[propertyName])}`;
      
      // Check cache first
      if (propertyValidationCache.has(cacheKey)) {
        const cachedResult = propertyValidationCache.get(cacheKey)!;
        if (!cachedResult) {
          return false; // Early exit on cached failure
        }
        continue;
      }

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
        validatePropertyWithCaching(
          sharedRuleEngine,
          propertyValue,
          ruleDefinition,
          propertyContext,
          cacheKey
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
 * Optimized property validation with caching
 */
async function validatePropertyWithCaching(
  ruleEngine: RuleEngine,
  propertyValue: any,
  ruleDefinition: RuleDefinition,
  propertyContext: ValidationContext,
  cacheKey: string
): Promise<boolean> {
  try {
    const result = await ruleEngine.validateValue(propertyValue, ruleDefinition, propertyContext);
    const passed = result.passed;
    
    // Cache the result with size limit
    if (propertyValidationCache.size < 1000) { // Prevent memory bloat
      propertyValidationCache.set(cacheKey, passed);
    }
    
    return passed;
  } catch (error) {
    // Cache failures too
    if (propertyValidationCache.size < 1000) {
      propertyValidationCache.set(cacheKey, false);
    }
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
    
    // Use 'in' operator for better performance than hasOwnProperty
    return propertyName in value;
  },
  message: 'The {field} must have the property {0}.'
};

// Utility function to clear cache when needed (export for external use)
export function clearObjectValidationCache(): void {
  propertyValidationCache.clear();
}