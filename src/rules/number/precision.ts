import { Rule } from '../../types/rules';

/**
 * Number decimal validation
 */
export const numberDecimalRule: Rule = {
  name: 'number.decimal',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'number' || isNaN(value)) return false;
    if (!parameters.length) return !Number.isInteger(value);
    const [places] = parameters;
    const decimals = parseInt(places, 10);
    const decimalStr = value.toString().split('.')[1] || '';
    return decimalStr.length === decimals;
  },
  message: 'The {field} must have exactly {0} decimal places.',
  priority: 2,
};

export const numberNumericRule: Rule = {
  name: 'number.numeric',
  validate: (value: any): boolean => {
    if (typeof value === 'number') {
      return !isNaN(value) && isFinite(value); // Exclude NaN and Infinity
    }
    if (typeof value === 'string') {
      // Check if string is a valid number (integer or float)
      return (
        /^-?\d*\.?\d+$/.test(value) &&
        !isNaN(parseFloat(value)) &&
        isFinite(parseFloat(value))
      );
    }
    return false;
  },
  message: 'The {field} must be a valid number.',
  priority: 2,
};

export const numberSizeRule: Rule = {
  name: 'size',
  validate: (value: any, parameters: string[]): boolean => {
    // Ensure value is a number or numeric string
    let num: number;
    const [target] = parameters;
    if (typeof value !== 'number') return false;
    if (isNaN(value) || !isFinite(value)) return false;

    num = value;

    const targetNum = parseFloat(target as string);
    if (isNaN(targetNum) || !isFinite(targetNum)) return false;

    return num === targetNum;
  },
  message: 'The {field} must equal {0}.',
  priority: 2,
};
