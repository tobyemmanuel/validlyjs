import { Rule, FileInfo } from '../../types';
import { parseSize } from '../../utils';

/**
 * File minimum size validation
 */
export const fileMinRule: Rule = {
  name: 'file.min',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value && typeof value === 'object' && 'size' in value)) return false;
    const file = value as FileInfo;
    const [size] = parameters;
    const minSize = parseSize(size);
    return file.size >= minSize;
  },
  message: 'The {field} must be at least {0}.',
  priority: 2,
};

/**
 * File maximum size validation
 */
export const fileMaxRule: Rule = {
  name: 'file.max',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value && typeof value === 'object' && 'size' in value)) return false;
    const file = value as FileInfo;
    const [size] = parameters;
    const maxSize = parseSize(size);
    return file.size <= maxSize;
  },
  message: 'The {field} may not be greater than {0}.',
  priority: 2,
};

/**
 * File size validation
 */
export const fileSizeRule: Rule = {
  name: 'file.size',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value && typeof value === 'object' && 'size' in value)) return false;
    const file = value as FileInfo;
    const [size] = parameters;
    const allowedSize = parseSize(size);
    return file.size == allowedSize;
  },
  message: 'The {field} size must be greater than {0}.',
  priority: 2,
};

/**
 * File size validation
 */
export const fileRangeRule: Rule = {
  name: 'file.between',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value && typeof value === 'object' && 'size' in value)) return false;
    const file = value as FileInfo;
    const [min, max] = parameters;
    const allowedMinSize = parseSize(min);
    const allowedMaxSize = parseSize(max);
    return file.size >= allowedMinSize && file.size <= allowedMaxSize;
  },
  message: 'The {field} size must be between {0} and {1}.',
  priority: 2,
};
