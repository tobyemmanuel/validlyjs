import { Rule, FileInfo } from '../../types';
import { sniffFile } from '../../utils/mime';

/**
 * File image validation
 *
 * Validates the REAL content of the file via magic-byte sniffing. Client-supplied `file.type`
 * is attacker-controlled and is only used as a non-authoritative fallback.
 */
export const fileImageRule: Rule = {
  name: 'file.image',
  async: true,
  validate: async (value: any): Promise<boolean> => {
    if (!(value && typeof value === 'object')) return false;
    const detected = await sniffFile(value);
    if (detected) {
      return detected.startsWith('image/');
    }
    // Fallback: no readable content available, trust the client-reported type (non-authoritative).
    if ('type' in value && typeof value.type === 'string') {
      return value.type.startsWith('image/');
    }
    return false;
  },
  message: 'The {field} must be an image.',
  priority: 2,
};