import { Rule, FileInfo } from '../../types';
import { sniffFile } from '../../utils/mime';

/**
 * File MIME types validation
 *
 * Validates the REAL content of the file via magic-byte sniffing. Client-supplied
 * `file.type` is attacker-controlled and is only used as a non-authoritative fallback when
 * the file contents cannot be read (e.g. a plain object with no buffer/arrayBuffer/path).
 */
export const fileMimeTypesRule: Rule = {
  name: 'file.mimes',
  async: true,
  validate: async (value: any, parameters: any[]): Promise<boolean> => {
    if (!(value && typeof value === 'object')) return false;
    const allowed = (parameters as string[]).map((p: string) => String(p).toLowerCase());

    // An allowed entry matches if it equals the detected MIME exactly, or matches its subtype
    // (e.g. "png" matches "image/png"), so both `mimes:image/png` and `mimes:png` work.
    const matches = (mime: string): boolean => {
      const lower = mime.toLowerCase();
      return allowed.includes(lower) || allowed.some((a) => lower.endsWith('/' + a) || lower === a);
    };

    const detected = await sniffFile(value);
    if (detected) {
      return matches(detected);
    }

    // Fallback: no readable content available, trust the client-reported type (non-authoritative).
    if ('type' in value && value.type) {
      return matches(String(value.type));
    }

    return false;
  },
  message: 'The {field} must have one of the following MIME types: {0}.',
  priority: 2,
};

/**
 * File extensions validation
 *
 * Extension checks are convenience-only and NOT a security boundary: file names are trivially
 * spoofable. Prefer `file.mimes` (content-based) for security-sensitive validation.
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