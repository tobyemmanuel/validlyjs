import { Rule } from '../../types/rules';

/**
 * Check if a value is considered "present"
 */
function isPresent(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'object' && Object.keys(value).length === 0) return false;
  return true;
}

/**
 * Required rule - field must be present and not empty
 */
export const requiredRule: Rule = {
  name: 'required',
  validate: (value: any): boolean => {
    return isPresent(value);
  },
  message: 'The {field} field is required.',
  priority: 1
};

/**
 * Nullable rule - field can be null/undefined but if present must pass other validations
 */
export const nullableRule: Rule = {
  name: 'nullable',
  validate: (_value: any): boolean => {
    // Nullable always passes - it's handled by the rule engine
    return true;
  },
  message: '', // No message needed
  priority: 0
};

/**
 * Optional rule - alias for nullable
 */
export const optionalRule: Rule = {
  name: 'optional',
  validate: (_value: any): boolean => {
    return true;
  },
  message: '', // No message needed
  priority: 0
};

/**
 * Present rule - field must exist in data (but can be empty)
 */
export const presentRule: Rule = {
  name: 'present',
  validate: (_value: any, _parameters: any[], field: string, data: Record<string, any>): boolean => {
    return Object.prototype.hasOwnProperty.call(data, field);
  },
  message: 'The {field} field must be present.',
  priority: 1
};

/**
 * Confirmed rule - field must match field_confirmation
 */
export const confirmedRule: Rule = {
  name: 'confirmed',
  validate: (value: any, _parameters: any[], field: string, data: Record<string, any>): boolean => {
    const confirmationField = `${field}_confirmation`;
    return data[confirmationField] === value;
  },
  message: 'The {field} confirmation does not match.',
  priority: 2
};

/**
 * Same rule - field must match another field
 */
export const sameRule: Rule = {
  name: 'same',
  validate: (value: any, parameters: any[], _field: string, data: Record<string, any>): boolean => {
    const [targetField] = parameters;
    if (!targetField) return false;
    return data[targetField] === value;
  },
  message: 'The {field} and {0} must match.',
  priority: 2
};

/**
 * Different rule - field must be different from another field
 */
export const differentRule: Rule = {
  name: 'different',
  validate: (value: any, parameters: any[], _field: string, data: Record<string, any>): boolean => {
    const [targetField] = parameters;
    if (!targetField) return true;
    return data[targetField] !== value;
  },
  message: 'The {field} and {0} must be different.',
  priority: 2
};