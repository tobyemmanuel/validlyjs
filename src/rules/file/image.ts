import { Rule, FileInfo } from '../../types';

/**
 * File image validation
 */
export const fileImageRule: Rule = {
  name: 'file.image',
  validate: (value: any): boolean => {
    if (!(value && typeof value === 'object' && 'type' in value)) return false;
    const file = value as FileInfo;
    return file.type.startsWith('image/');
  },
  message: 'The {field} must be an image.',
  priority: 2,
};