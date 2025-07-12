import { Rule } from '../../types';

/**
 * Object strict validation - no additional properties allowed
 */
export const objectStrictRule: Rule = {
  name: 'object.strict',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }
    
    const [allowedKeys] = parameters;
    if (!Array.isArray(allowedKeys)) {
      return true; // No strict validation if no allowed keys provided
    }
    
    const objectKeys = Object.keys(value);
    return objectKeys.every(key => allowedKeys.includes(key)) && 
           objectKeys.length <= allowedKeys.length;
  },
  message: 'The {field} contains unexpected properties.',
  priority: 2,
};

/**
 * Object not empty validation
 */
export const objectNotEmptyRule: Rule = {
  name: 'object.notEmpty',
  validate: (value: any): boolean => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }
    
    return Object.keys(value).length > 0;
  },
  message: 'The {field} must not be empty.',
  priority: 2,
};