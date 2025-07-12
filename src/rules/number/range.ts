import { Rule } from '../../types/rules';

/**
 * Number minimum value validation
 */
export const numberMinRule: Rule = {
  name: 'number.min',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'number' || isNaN(value)) return false;
    const [minValue] = parameters;
    const min = parseFloat(minValue);
    return value >= min;
  },
  message: 'The {field} must be at least {0}.',
  priority: 2,
};

/**
 * Number maximum value validation
 */
export const numberMaxRule: Rule = {
  name: 'number.max',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'number' || isNaN(value)) return false;
    const [maxValue] = parameters;
    const max = parseFloat(maxValue);
    return value <= max;
  },
  message: 'The {field} may not be greater than {0}.',
  priority: 2,
};

/**
 * Number between range validation
 */
export const numberBetweenRule: Rule = {
  name: 'number.between',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'number' || isNaN(value)) return false;
    const [minValue, maxValue] = parameters;
    const min = parseFloat(minValue);
    const max = parseFloat(maxValue);
    return value >= min && value <= max;
  },
  message: 'The {field} must be between {0} and {1}.',
  priority: 2,
};

export const numberInRule: Rule = {
  name: 'number.in',
  validate: (value: any, parameters: string[]): boolean => {
    // Ensure value is a number or numeric string
    let num: number;
    if (typeof value !== 'number') {
      return false;
    }
    if (isNaN(value) || !isFinite(value)) return false;
    num = value;
    // Convert parameters to numbers
    const allowedValues = parameters
      .map((param) => parseFloat(param))
      .filter((num) => !isNaN(num) && isFinite(num));
    return allowedValues.includes(num);
  },
  message: 'The {field} must be one of: {options}.',
  priority: 2,
};

export const numberNotInRule: Rule = {
  name: 'number.not_in',
  validate: (value: any, parameters: string[]): boolean => {
    // Ensure value is a number or numeric string
    let num: number;
    if (typeof value !== 'number') {
      return false;
    }
    if (isNaN(value) || !isFinite(value)) return false;
    num = value;
    // Convert parameters to numbers
    const disallowedValues = parameters
      .map((param) => parseFloat(param))
      .filter((num) => !isNaN(num) && isFinite(num));
    return !disallowedValues.includes(num);
  },
  message: 'The {field} must not be one of: {options}.',
  priority: 2,
};
