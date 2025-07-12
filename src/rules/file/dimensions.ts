import { Rule, FileInfo } from '../../types';

/**
 * File width validation
 */
export const fileWidthRule: Rule = {
  name: 'file.width',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value && typeof value === 'object' && 'dimensions' in value)) return false;
    const file = value as FileInfo & { dimensions?: { width?: number } };
    if (!file.dimensions?.width) return false;
    const [width] = parameters;
    return file.dimensions.width === parseInt(width, 10);
  },
  message: 'The {field} must have a width of {0} pixels.',
  priority: 2,
};

/**
 * File height validation
 */
export const fileHeightRule: Rule = {
  name: 'file.height',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value && typeof value === 'object' && 'dimensions' in value)) return false;
    const file = value as FileInfo & { dimensions?: { height?: number } };
    if (!file.dimensions?.height) return false;
    const [height] = parameters;
    return file.dimensions.height === parseInt(height, 10);
  },
  message: 'The {field} must have a height of {0} pixels.',
  priority: 2,
};

/**
 * File minimum width validation
 */
export const fileMinWidthRule: Rule = {
  name: 'file.min_width',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value && typeof value === 'object' && 'dimensions' in value)) return false;
    const file = value as FileInfo & { dimensions?: { width?: number } };
    if (!file.dimensions?.width) return false;
    const [minWidth] = parameters;
    return file.dimensions.width >= parseInt(minWidth, 10);
  },
  message: 'The {field} must have a minimum width of {0} pixels.',
  priority: 2,
};

/**
 * File maximum width validation
 */
export const fileMaxWidthRule: Rule = {
  name: 'file.max_width',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value && typeof value === 'object' && 'dimensions' in value)) return false;
    const file = value as FileInfo & { dimensions?: { width?: number } };
    if (!file.dimensions?.width) return false;
    const [maxWidth] = parameters;
    return file.dimensions.width <= parseInt(maxWidth, 10);
  },
  message: 'The {field} must have a maximum width of {0} pixels.',
  priority: 2,
};

/**
 * File minimum height validation
 */
export const fileMinHeightRule: Rule = {
  name: 'file.min_height',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value && typeof value === 'object' && 'dimensions' in value)) return false;
    const file = value as FileInfo & { dimensions?: { height?: number } };
    if (!file.dimensions?.height) return false;
    const [minHeight] = parameters;
    return file.dimensions.height >= parseInt(minHeight, 10);
  },
  message: 'The {field} must have a minimum height of {0} pixels.',
  priority: 2,
};

/**
 * File maximum height validation
 */
export const fileMaxHeightRule: Rule = {
  name: 'file.max_height',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value && typeof value === 'object' && 'dimensions' in value)) return false;
    const file = value as FileInfo & { dimensions?: { height?: number } };
    if (!file.dimensions?.height) return false;
    const [maxHeight] = parameters;
    return file.dimensions.height <= parseInt(maxHeight, 10);
  },
  message: 'The {field} must have a maximum height of {0} pixels.',
  priority: 2,
};