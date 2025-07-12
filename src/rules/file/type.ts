import { Rule, FileInfo } from '../../types';

/**
 * File MIME types validation
 */
export const fileMimeTypesRule: Rule = {
  name: 'file.mimes',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value && typeof value === 'object' && 'type' in value)) return false;
    const file = value as FileInfo;

    return parameters.includes(file.type);
  },
  message: 'The {field} must have one of the following MIME types: {0}.',
  priority: 2,
};

/**
 * File extensions validation
 */
export const fileExtensionsRule: Rule = {
  name: 'file.extensions',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value && typeof value === 'object' && 'name' in value)) return false;
    const file = value as FileInfo;
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    return parameters.map((ext: string) => ext.toLowerCase()).includes(extension);
  },
  message: 'The {field} must have one of the following extensions: {0}.',
  priority: 2,
};