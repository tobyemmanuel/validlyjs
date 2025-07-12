import { Rule } from '../../types/rules';

/**
 * In validation - Optimized with Set for O(1) lookup
 */
export const inRule: Rule = {
  name: 'string.in',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'string') return false;
    return parameters.includes(value);
  },
  message: 'The {field} must be one of the following values: {0}.',
  priority: 2,
};

/**
 * Not in validation
 */
export const notInRule: Rule = {
  name: 'string.not_in',
  validate: (value: any, parameters: any[]): boolean => {
    return typeof value === 'string' && !parameters.includes(value);
  },
  message: 'The {field} must not be one of the following values: {0}.',
  priority: 2,
};
