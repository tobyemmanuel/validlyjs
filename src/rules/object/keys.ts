import { Rule } from '../../types';

/**
 * Object allowed keys validation
 */
export const objectKeysRule: Rule = {
  name: 'object.keys',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }
    
    const allowedKeys = parameters;
    const objectKeys = Object.keys(value);
    
    return objectKeys.every(key => allowedKeys.includes(key));
  },
  message: 'The {field} contains invalid keys.',
  priority: 2,
};

/**
 * Object required keys validation
 */
export const objectRequiredKeysRule: Rule = {
  name: 'object.requiredKeys',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }
    
    const requiredKeys = parameters;
    const objectKeys = Object.keys(value);
    
    return requiredKeys.every(key => objectKeys.includes(key));
  },
  message: 'The {field} is missing required keys.',
  priority: 2,
};

/**
 * Object key count validation
 */
export const objectKeyCountRule: Rule = {
  name: 'object.keyCount',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }
    
    const [expectedCount] = parameters;
    const count = parseInt(expectedCount, 10);
    return Object.keys(value).length === count;
  },
  message: 'The {field} must have exactly {0} keys.',
  priority: 2,
};