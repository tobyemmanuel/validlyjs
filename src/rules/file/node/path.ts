import { Rule } from '../../../types';
import path from 'path';

/**
 * File path validation
 */
export const filePathRule: Rule = {
  name: 'file.path',
  validate: (value: any): boolean => {
    if (typeof value !== 'string') return false;
    try {
      path.normalize(value);
      return true;
    } catch {
      return false;
    }
  },
  message: 'The {field} must be a valid file path.',
  priority: 2,
};