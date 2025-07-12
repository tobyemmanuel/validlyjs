import { Rule, RuleDefinition } from '../../types';
import { ValidationContext } from '../../types';
import { RuleEngine } from '../../core/rule-engine';

// Reusable RuleEngine instance to avoid repeated instantiation
let sharedRuleEngine: RuleEngine | null = null;

/**
 * Helper function to check if a field has a value
 */
function hasValue(data: Record<string, any>, field: string): boolean {
  const value = data[field];
  return field in data && value !== null && value !== undefined && value !== '';
}

/**
 * Helper function to check if value is present
 */
function isPresent(value: any): boolean {
  if (value == null) return false; // null or undefined
  if (typeof value === 'string')
    return value.length > 0 && value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Required if another field has a specific value
 */
export const requiredIfRule: Rule = {
  name: 'required_if',
  validate: (
    value: any,
    parameters: any[],
    _field: string,
    data: Record<string, any>
  ): boolean => {
    const targetField = parameters[0];
    const targetValue = parameters[1];

    // Early return if no target field
    if (!targetField) return true;

    // If target field doesn't match the condition, field is not required
    return data[targetField] !== targetValue || isPresent(value);
  },
  message: 'The {field} field is required when {0} is {1}.',
  priority: 1,
};

/**
 * Required unless another field has a specific value
 */
export const requiredUnlessRule: Rule = {
  name: 'required_unless',
  validate: (
    value: any,
    parameters: any[],
    _field: string,
    data: Record<string, any>
  ): boolean => {
    const targetField = parameters[0];
    const targetValue = parameters[1];

    if (!targetField) return isPresent(value);

    // If target field matches the condition, field is not required
    return data[targetField] === targetValue || isPresent(value);
  },
  message: 'The {field} field is required unless {0} is {1}.',
  priority: 1,
};

/**
 * Required with - field is required if any of the specified fields are present
 */
export const requiredWithRule: Rule = {
  name: 'required_with',
  validate: (
    value: any,
    parameters: any[],
    _field: string,
    data: Record<string, any>
  ): boolean => {
    const len = parameters.length;
    if (len === 0) return true;

    // Check if any of the specified fields are present
    for (let i = 0; i < len; i++) {
      if (hasValue(data, parameters[i])) {
        return isPresent(value);
      }
    }

    return true;
  },
  message: 'The {field} field is required when {0} is present.',
  priority: 1,
};

/**
 * Required with all - field is required if all specified fields are present
 */
export const requiredWithAllRule: Rule = {
  name: 'required_with_all',
  validate: (
    value: any,
    parameters: any[],
    _field: string,
    data: Record<string, any>
  ): boolean => {
    const len = parameters.length;
    if (len === 0) return true;

    // Check if all specified fields are present
    for (let i = 0; i < len; i++) {
      if (!hasValue(data, parameters[i])) {
        return true; // Not all fields present, so not required
      }
    }

    // All fields are present, so current field is required
    return isPresent(value);
  },
  message: 'The {field} field is required when {0} are present.',
  priority: 1,
};

/**
 * Required without - field is required if any of the specified fields are missing
 */
export const requiredWithoutRule: Rule = {
  name: 'required_without',
  validate: (
    value: any,
    parameters: any[],
    _field: string,
    data: Record<string, any>
  ): boolean => {
    const len = parameters.length;
    if (len === 0) return true;

    // Check if any of the specified fields are missing
    for (let i = 0; i < len; i++) {
      if (!hasValue(data, parameters[i])) {
        return isPresent(value); // At least one field is missing
      }
    }

    return true; // All fields are present, so not required
  },
  message: 'The {field} field is required when {0} is not present.',
  priority: 1,
};

/**
 * Required without all - field is required if all specified fields are missing
 */
export const requiredWithoutAllRule: Rule = {
  name: 'required_without_all',
  validate: (
    value: any,
    parameters: any[],
    _field: string,
    data: Record<string, any>
  ): boolean => {
    const len = parameters.length;
    if (len === 0) return true;

    // Check if all specified fields are missing
    for (let i = 0; i < len; i++) {
      if (hasValue(data, parameters[i])) {
        return true; // At least one field is present, so not required
      }
    }

    // All fields are missing, so current field is required
    return isPresent(value);
  },
  message: 'The {field} field is required when none of {0} are present.',
  priority: 1,
};

/**
 * Prohibited - field must not be present
 */
export const prohibitedRule: Rule = {
  name: 'prohibited',
  validate: (
    value: any,
    _parameters: any[],
    field: string,
    data: Record<string, any>
  ): boolean => {
    return !(field in data) || !isPresent(value);
  },
  message: 'The {field} field is prohibited.',
  priority: 1,
};

/**
 * Prohibited if another field has a specific value
 */
export const prohibitedIfRule: Rule = {
  name: 'prohibited_if',
  validate: (
    value: any,
    parameters: any[],
    _field: string,
    data: Record<string, any>
  ): boolean => {
    const targetField = parameters[0];
    const targetValue = parameters[1];

    if (!targetField) return true;

    // If target field doesn't match the condition, field is allowed
    return data[targetField] !== targetValue || !isPresent(value);
  },
  message: 'The {field} field is prohibited when {0} is {1}.',
  priority: 1,
};

/**
 * Prohibited unless another field has a specific value
 */
export const prohibitedUnlessRule: Rule = {
  name: 'prohibited_unless',
  validate: (
    value: any,
    parameters: any[],
    _field: string,
    data: Record<string, any>
  ): boolean => {
    const targetField = parameters[0];
    const targetValue = parameters[1];

    if (!targetField) return !isPresent(value);

    // If target field matches the condition, field is allowed
    return data[targetField] === targetValue || !isPresent(value);
  },
  message: 'The {field} field is prohibited unless {0} is {1}.',
  priority: 1,
};

export const whenRule: Rule = {
  name: 'when',
  validate: async (
    value: any,
    parameters: any[],
    field: string,
    data: Record<string, any>
  ): Promise<boolean> => {
    const [targetField, conditions] = parameters;
    const targetValue = data[targetField];

    // Lazy initialization of shared RuleEngine
    if (!sharedRuleEngine) {
      sharedRuleEngine = new RuleEngine();
    }

    // Check conditions
    for (const [conditionKey, conditionValue] of Object.entries(conditions)) {
      if (conditionKey === 'then' || conditionKey === 'otherwise') continue;

      if (typeof conditionValue === 'object') {
        // Handle operators like { gte: 5 }
        for (const [operator, operatorValue] of Object.entries(
          conditionValue as Record<string, unknown>
        )) {
          const conditionMet = evaluateCondition(
            targetValue,
            operator,
            operatorValue
          );
          if (conditionMet && conditions.then) {
            // Apply 'then' rules
            return await validateAgainstRule(
              value,
              conditions.then,
              field,
              data
            );
          } else if (!conditionMet && conditions.otherwise) {
            // Apply 'otherwise' rules
            return await validateAgainstRule(
              value,
              conditions.otherwise,
              field,
              data
            );
          }
        }
      }
    }

    return true; // No conditions matched
  },
  message: 'The {field} field validation failed based on conditional rules.',
  async: true,
};

/**
 * Helper function to validate a value against a rule definition
 */
async function validateAgainstRule(
  value: any,
  ruleDefinition: RuleDefinition,
  field: string,
  data: Record<string, any>
): Promise<boolean> {
  try {
    const context: ValidationContext = {
      field,
      data,
      path: field,
    };

    const result = await sharedRuleEngine!.validateValue(
      value,
      ruleDefinition,
      context
    );
    return result.passed;
  } catch (error) {
    return false;
  }
}

function evaluateCondition(
  value: any,
  operator: string,
  expected: any
): boolean {
  switch (operator) {
    case 'gte':
      return Array.isArray(value)
        ? value.length >= expected
        : value >= expected;
    case 'gt':
      return Array.isArray(value) ? value.length > expected : value > expected;
    case 'lte':
      return Array.isArray(value)
        ? value.length <= expected
        : value <= expected;
    case 'lt':
      return Array.isArray(value) ? value.length < expected : value < expected;
    case 'eq':
      return Array.isArray(value)
        ? value.length === expected
        : value === expected;
    case 'length':
      return Array.isArray(value) ? value.length === expected : false;
    default:
      return false;
  }
}
