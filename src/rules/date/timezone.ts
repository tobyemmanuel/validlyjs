import { Rule } from '../../types/rules';

/**
 * Date timezone validation
 */
export const dateTimezoneRule: Rule = {
  name: 'date.timezone',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value instanceof Date) || isNaN(value.getTime())) return false;
    const [timezone] = parameters;
    try {
      // Use Intl.DateTimeFormat to check timezone (Node.js 14+)
      const formatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone });
      formatter.format(value);
      return true;
    } catch {
      return false;
    }
  },
  message: 'The {field} must be in the {0} timezone.',
  priority: 2,
};

/**
 * Date weekday validation
 */
export const dateWeekdayRule: Rule = {
  name: 'date.weekday',
  validate: (value: any): boolean => {
    if (!(value instanceof Date) || isNaN(value.getTime())) return false;
    const day = value.getDay();
    return day >= 1 && day <= 5; // Monday to Friday
  },
  message: 'The {field} must be a weekday.',
  priority: 2,
};

/**
 * Date weekend validation
 */
export const dateWeekendRule: Rule = {
  name: 'date.weekend',
  validate: (value: any): boolean => {
    if (!(value instanceof Date) || isNaN(value.getTime())) return false;
    const day = value.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  },
  message: 'The {field} must be a weekend day.',
  priority: 2,
};