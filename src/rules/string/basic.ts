import { Rule } from '../../types/rules';

/**
 * String minimum length validation
 */
export const stringMinRule: Rule = {
  name: 'string.min',
  validate: (value: any, parameters: any[]): boolean => {
    // Fast type check using typeof
    if (typeof value !== 'string') return false;
    // Direct array access + bitwise OR for fast parsing
    const min = parameters[0];
    if (min < 0) return false;
    return value.length >= min;
  },
  message: 'The {field} must be at least {0} characters.',
  priority: 2,
};

/**
 * String maximum length validation
 */
export const stringMaxRule: Rule = {
  name: 'string.max',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'string') return false;
    const max = parameters[0];
    if (max < 0) return false;
    return value.length <= max;
  },
  message: 'The {field} may not be greater than {0} characters.',
  priority: 2,
};

/**
 * String exact length validation
 */
export const stringLengthRule: Rule = {
  name: 'string.length',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'string') return false;

    const lengthParam = parameters[0];

    // Handle different parameter types efficiently
    let targetLength: number;

    if (typeof lengthParam === 'number') {
      targetLength = lengthParam;
    } else if (typeof lengthParam === 'string') {
      targetLength = parseInt(lengthParam, 10);
      // Fast NaN check - if parsing failed, return false
      if (targetLength !== targetLength) return false; // NaN !== NaN
    } else {
      return false;
    }

    // Ensure non-negative length
    if (targetLength < 0) return false;

    return value.length === targetLength;
  },
  message: 'The {field} must be exactly {0} characters.',
  priority: 2,
};

/**
 * String size validation (alias for length)
 */
export const stringSizeRule: Rule = {
  name: 'string.size',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'string') return false;

    const lengthParam = parameters[0];

    // Handle different parameter types efficiently
    let targetLength: number;

    if (typeof lengthParam === 'number') {
      targetLength = lengthParam;
    } else if (typeof lengthParam === 'string') {
      targetLength = parseInt(lengthParam, 10);
      // Fast NaN check - if parsing failed, return false
      if (targetLength !== targetLength) return false; // NaN !== NaN
    } else {
      return false;
    }

    // Ensure non-negative length
    if (targetLength < 0) return false;

    return value.length === targetLength;
  },
  message: 'The {field} must be {0} characters.',
  priority: 2,
};

/**
 * String between length validation
 */
export const stringBetweenRule: Rule = {
  name: 'string.between',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'string') return false;
    const min = parameters[0];
    const max = parameters[1];
    const len = value.length;
    if (max < 0 || min < 0) return false;
    return len >= min && len <= max;
  },
  message: 'The {field} must be between {0} and {1} characters.',
  priority: 2,
};
