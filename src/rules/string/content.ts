import { Rule } from '../../types/rules';

/**
 * Starts with validation
 */
export const startsWithRule: Rule = {
  name: 'string.starts_with',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'string') return false;
    const start = parameters[0];
    return value.startsWith(start);
  },
  message: 'The {field} must start with {0}.',
  priority: 2
}

/**
 * Ends with validation
 */
export const endsWithRule: Rule = {
  name:'string.ends_with',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value!=='string') return false;
    const end = parameters[0];
    return value.endsWith(end);
  },
  message: 'The {field} must end with {0}.',
  priority: 2
}

/** 
 * Contains validation
 */
export const containsRule: Rule = {
  name:'string.contains',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value!=='string') return false;
    const contains = parameters[0];
    return value.includes(contains);
  },
  message: 'The {field} must contain {0}.',
  priority: 2
}