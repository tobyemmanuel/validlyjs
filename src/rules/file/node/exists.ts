import { Rule } from '../../../types';
import fs from 'fs/promises';

/**
 * File existence validation
 */
export const fileExistsRule: Rule = {
  name: 'file.exists',
  validate: async (value: any): Promise<boolean> => {
    if (typeof value !== 'string') return false;
    try {
      await fs.access(value);
      return true;
    } catch {
      return false;
    }
  },
  message: 'The {field} file does not exist.',
  async: true,
  priority: 2,
};