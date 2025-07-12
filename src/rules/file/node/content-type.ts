import { Rule } from '../../../types';
const fileType = require('file-type');

/**
 * File content type validation
 */
export const fileContentTypeRule: Rule = {
  name: 'file.contentType',
  validate: async (value: any, parameters: any[]): Promise<boolean> => {
    if (typeof value !== 'string') return false;
    try {
      const type = await fileType.fromFile(value);
      return type ? parameters.includes(type.mime) : false;
    } catch {
      return false;
    }
  },
  message: 'The {field} must have one of the following content types: {0}.',
  async: true,
  priority: 2,
};