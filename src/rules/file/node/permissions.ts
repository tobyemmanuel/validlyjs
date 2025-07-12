import { Rule } from '../../../types';
import fs from 'fs/promises';

/**
 * File permissions validation
 */
export const filePermissionsRule: Rule = {
  name: 'file.permissions',
  validate: async (value: any, parameters: any[]): Promise<boolean> => {
    if (typeof value !== 'string') return false;
    const [permission] = parameters;
    try {
      const stats = await fs.stat(value);
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