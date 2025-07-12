import { Rule } from '../../types/rules';

/**
 * Number positive validation
 */
export const numberPositiveRule: Rule = {
  name: 'number.positive',
  validate: (value: any): boolean => {
    if (typeof value !== 'number' || isNaN(value)) return false;
    return value > 0;
  },
  message: 'The {field} must be a positive number.',
  priority: 2,
};

/**
 * Number negative validation
 */
export const numberNegativeRule: Rule = {
  name: 'number.negative',
  validate: (value: any): boolean => {
    if (typeof value !== 'number' || isNaN(value)) return false;
    return value < 0;
  },
  message: 'The {field} must be a negative number.',
  priority: 2,
};

/**
 * Number integer validation
 */
export const numberIntegerRule: Rule = {
  name: 'number.integer',
  validate: (value: any): boolean => {
    if (typeof value !== 'number' || isNaN(value)) return false;
    return Number.isInteger(value);
  },
  message: 'The {field} must be an integer.',
  priority: 2,
};