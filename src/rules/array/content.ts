import { Rule } from '../../types/rules';

/**
 * Array unique validation - ensures all items are unique
 */
export const arrayUniqueRule: Rule = {
  name: 'array.unique',
  validate: (value: any): boolean => {
    if (!Array.isArray(value)) return false;
    const seen = new Set();
    for (const item of value) {
      const key = typeof item === 'object' ? JSON.stringify(item) : item;
      if (seen.has(key)) return false;
      seen.add(key);
    }
    return true;
  },
  message: 'The {field} must contain unique items.',
  priority: 2,
};

/**
 * Array contains validation - checks if array contains a specific value
 */
export const arrayContainsRule: Rule = {
  name: 'array.contains',
  validate: (value: any, parameters: any[]): boolean => {
    if (!Array.isArray(value)) return false;
    const [searchValue] = parameters;
    return value.includes(searchValue);
  },
  message: 'The {field} must contain {0}.',
  priority: 2,
};

/**
 * Array not contains validation - checks if array does not contain a specific value
 */
export const arrayNotContainsRule: Rule = {
  name: 'array.notContains',
  validate: (value: any, parameters: any[]): boolean => {
    if (!Array.isArray(value)) return false;
    const [searchValue] = parameters;
    return !value.includes(searchValue);
  },
  message: 'The {field} must not contain {0}.',
  priority: 2,
};

/**
 * Array distinct validation - alias for unique
 */
export const arrayDistinctRule: Rule = {
  name: 'array.distinct',
  validate: (value: any): boolean => {
    if (!Array.isArray(value)) return false;
    const seen = new Set();
    for (const item of value) {
      const key = typeof item === 'object' ? JSON.stringify(item) : item;
      if (seen.has(key)) return false;
      seen.add(key);
    }
    return true;
  },
  message: 'The {field} must contain unique items.',
  priority: 2,
};