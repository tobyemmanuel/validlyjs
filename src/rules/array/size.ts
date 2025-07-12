import { Rule } from '../../types/rules';

/**
 * Array minimum length validation
 */
export const arrayMinRule: Rule = {
  name: 'array.min',
  validate: (value: any, parameters: any[]): boolean => {
    if (!Array.isArray(value)) return false;
    const [minLength] = parameters;
    const min = parseInt(minLength, 10);
    return value.length >= min;
  },
  message: 'The {field} must have at least {0} items.',
  priority: 2,
};

/**
 * Array maximum length validation
 */
export const arrayMaxRule: Rule = {
  name: 'array.max',
  validate: (value: any, parameters: any[]): boolean => {
    if (!Array.isArray(value)) return false;
    const [maxLength] = parameters;
    const max = parseInt(maxLength, 10);
    return value.length <= max;
  },
  message: 'The {field} may not have more than {0} items.',
  priority: 2,
};

/**
 * Array exact length validation
 */
export const arrayLengthRule: Rule = {
  name: 'array.length',
  validate: (value: any, parameters: any[]): boolean => {
    if (!Array.isArray(value)) return false;
    const [exactLength] = parameters;
    const length = parseInt(exactLength, 10);
    return value.length === length;
  },
  message: 'The {field} must have exactly {0} items.',
  priority: 2,
};

/**
 * Array between length validation
 */
export const arrayBetweenRule: Rule = {
  name: 'array.between',
  validate: (value: any, parameters: any[]): boolean => {
    if (!Array.isArray(value)) return false;
    const [minLength, maxLength] = parameters;
    const min = parseInt(minLength, 10);
    const max = parseInt(maxLength, 10);
    return value.length >= min && value.length <= max;
  },
  message: 'The {field} must have between {0} and {1} items.',
  priority: 2,
};