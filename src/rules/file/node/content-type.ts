import { Rule } from '../../../types';
import { sniffFile } from '../../../utils/mime';

/**
 * File content type validation (by actual file content, not the reported extension/type).
 */
export const fileContentTypeRule: Rule = {
  name: 'file.contentType',
  async: true,
  validate: async (value: any, parameters: any[]): Promise<boolean> => {
    if (value == null) return false;
    try {
      const detected = await sniffFile(value);
      if (!detected) return false;
      const allowed = (parameters as string[]).map((p: string) => String(p).toLowerCase());
      return allowed.includes(detected.toLowerCase());
    } catch {
      return false;
    }
  },
  message: 'The {field} must have one of the following content types: {0}.',
  priority: 2,
};