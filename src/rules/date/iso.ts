import { Rule } from '../../types/rules';

/**
 * ISO 8601 date validation
 */
export const dateIsoRule: Rule = {
  name: 'date.iso',
  validate: (value: any): boolean => {
    if (!(value instanceof Date)) return false;
    if (isNaN(value.getTime())) return false;
    
    // For ISO validation, we check if the date can be properly serialized to ISO format
    try {
      const isoString = value.toISOString();
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(isoString);
    } catch {
      return false;
    }
  },
  message: 'The {field} field is invalid.',
  priority: 2,
};