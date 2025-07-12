import { Rule } from '../../types';
import { parseDateString } from '@/utils';

/**
 * String type validation
 */
export const stringRule: Rule = {
  name: 'string',
  validate: (value: any): boolean => {
    return typeof value === 'string';
  },
  message: 'The {field} must be a string.',
  priority: 0,
};

/**
 * Number type validation
 */
export const numberRule: Rule = {
  name: 'number',
  validate: (value: any): boolean => {
    return typeof value === 'number' && value === value && value !== Infinity && value !== -Infinity;
  },
  message: 'The {field} must be a number.',
  priority: 0,
};

/**
 * Integer type validation
 */
export const integerRule: Rule = {
  name: 'integer',
  validate: (value: any): boolean => {
    return typeof value === 'number' ? (value | 0) === value : Number.isInteger(+value);
  },
  message: 'The {field} must be an integer.',
  priority: 0,
};

/**
 * Boolean type validation
 */
export const booleanRule: Rule = {
  name: 'boolean',
  validate: (value: any): boolean => {
    return typeof value === 'boolean';
  },
  message: 'The {field} must be true or false.',
  priority: 0,
};

/**
 * Array type validation
 */
export const arrayRule: Rule = {
  name: 'array',
  validate: (value: any): boolean => {
    return value && typeof value === 'object' && typeof value.length === 'number';
  },
  message: 'The {field} must be an array.',
  priority: 0,
};

/**
 * Object type validation
 */
export const objectRule: Rule = {
  name: 'object',
  validate: (value: any): boolean => {
    return value && typeof value === 'object' && typeof value.length !== 'number';
  },
  message: 'The {field} must be an object.',
  priority: 0,
};

/**
 * Date type validation
 */
export const dateRule: Rule = {
  name: 'date',
  validate: (value: any): boolean => {
    if (value && typeof value === 'object' && value.constructor === Date) {
      return value.getTime() === value.getTime(); // NaN check
    }
    if (typeof value === 'string') {
      const parsed = parseDateString(value) as Date;
      return (parsed && parsed.getTime() === parsed.getTime()) as boolean;
    }
    return false;
  },
  message: 'The {field} must be a valid date.',
  priority: 0,
};

/**
 * File type validation (browser environment)
 */
export const fileRule: Rule = {
  name: 'file',
  validate: (value: any): boolean => {
    if (!value || typeof value !== 'object') return false;
    
    // Fast constructor check for File and FileList
    const constructor = value.constructor;
    if (constructor && (constructor.name === 'File' || constructor.name === 'FileList')) {
      return true;
    }
    
    // Check for object with file-like properties
    return 'name' in value && 'size' in value && 'type' in value;
  },
  message: 'The {field} must be a file.',
  priority: 0,
};

/**
 * Numeric string validation (string that represents a number)
 */
export const numericRule: Rule = {
  name: 'numeric',
  validate: (value: any): boolean => {
    if (typeof value === 'number') return value === value && value !== Infinity && value !== -Infinity;
    if (typeof value === 'string') {
      const num = +value; // Unary plus is faster than Number()
      return num === num && num !== Infinity && num !== -Infinity;
    }
    return false;
  },
  message: 'The {field} must be numeric.',
  priority: 0,
};

/**
 * Scalar validation (string, number, or boolean)
 */
export const scalarRule: Rule = {
  name: 'scalar',
  validate: (value: any): boolean => {
    const type = typeof value;
    return type === 'string' || type === 'number' || type === 'boolean';
  },
  message: 'The {field} must be a scalar value.',
  priority: 0,
};