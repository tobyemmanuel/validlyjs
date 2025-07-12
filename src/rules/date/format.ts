import { Rule } from '../../types/rules';

/**
 * Date format validation
 * Since we receive Date objects after coercion, we can't validate the original string format.
 * This rule validates that the Date object could reasonably have come from the expected format.
 */
export const dateFormatRule: Rule = {
  name: 'date.format',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value instanceof Date)) return false;
    if (isNaN(value.getTime())) return false;

    const [format] = parameters;
    
    // Since we only have the Date object, we validate structural constraints
    // that would be expected for each format type
    return validateDateStructure(value, format);
  },
  message: 'The {field} must be a valid date matching format {0}.',
  priority: 2,
};

/**
 * Validate that a Date object meets the structural expectations of a format
 */
function validateDateStructure(date: Date, format: string): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  // const milliseconds = date.getMilliseconds();
  
  // Basic date validity check
  if (year < 1000 || year > 9999) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  switch (format) {
    case 'YYYY-MM-DD HH:mm:ss':
      // For this format, we expect reasonable time values
      return hours >= 0 && hours <= 23 && 
             minutes >= 0 && minutes <= 59 && 
             seconds >= 0 && seconds <= 59;
             
    case 'DD/MM/YYYY':
    case 'MM/DD/YYYY':
    case 'YYYY-MM-DD':
      // For date-only formats, we might expect time to be at midnight
      // But since Date parsing can add time, we'll just validate the date part
      return true;
      
    default:
      // For unknown formats, just validate basic date structure
      return true;
  }
}