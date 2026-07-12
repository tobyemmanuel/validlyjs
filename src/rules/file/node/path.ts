import { Rule } from '../../../types';
import path from 'path';
import { resolveWithinBaseDir } from './security';

/**
 * File path validation.
 *
 * Validates that the value is a usable path string and (when a base directory is configured
 * via `setFileBaseDir()`) that it stays within that directory.
 */
export const filePathRule: Rule = {
  name: 'file.path',
  validate: (value: any): boolean => {
    if (typeof value !== 'string' || value.length === 0) return false;
    const resolved = resolveWithinBaseDir(value);
    if (resolved === null) return false;
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