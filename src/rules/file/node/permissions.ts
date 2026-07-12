import { Rule } from '../../../types';
import fs from 'fs/promises';
import { resolveWithinBaseDir } from './security';

/**
 * File permissions validation.
 *
 * NOTE: this performs a real filesystem stat on the caller-supplied path. Set a base
 * directory via `setFileBaseDir()` to prevent path-traversal / arbitrary filesystem probing.
 */
export const filePermissionsRule: Rule = {
  name: 'file.permissions',
  validate: async (value: any, parameters: any[]): Promise<boolean> => {
    const [permission] = parameters;
    const target = resolveWithinBaseDir(value) ??
      (typeof value === 'string' ? value : null);
    if (target === null) return false;
    try {
      const stats = await fs.stat(target);
      const mode = stats.mode & 0o777; // Get permission bits
      return mode.toString(8) === permission;
    } catch {
      return false;
    }
  },
  message: 'The {field} must have {0} permissions.',
  async: true,
  priority: 2,
};