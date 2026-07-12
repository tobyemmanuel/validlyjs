import { Rule } from '../../../types';
import fs from 'fs/promises';
import { resolveWithinBaseDir } from './security';

/**
 * File existence validation.
 *
 * NOTE: this performs a real filesystem lookup on the caller-supplied path. Set a base
 * directory via `setFileBaseDir()` (or pass it as the last rule parameter) to prevent
 * path-traversal / arbitrary filesystem probing.
 */
export const fileExistsRule: Rule = {
  name: 'file.exists',
  validate: async (value: any, parameters: any[]): Promise<boolean> => {
    const target = resolveWithinBaseDir(value) ??
      (typeof value === 'string' ? value : null);
    if (target === null) return false;
    try {
      await fs.access(target);
      return true;
    } catch {
      return false;
    }
  },
  message: 'The {field} file does not exist.',
  async: true,
  priority: 2,
};