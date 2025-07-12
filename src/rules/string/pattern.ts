import { Rule } from '../../types/rules';
// Pre-compiled regexes for maximum performance
const alphaRegex = /^[a-zA-Z]+$/;
const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
const alphaDashRegex = /^[a-zA-Z0-9_-]+$/;
const alphaSpaceRegex = /^[a-zA-Z0-9\s_]+$/;

/**
 * Regular expression validation
 */
export const regexRule: Rule = {
  name: 'string.regex',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'string') return false;

    const pattern = parameters[0];
    if (!pattern) return false;

    try {
      // Cache regex if same pattern is used repeatedly
      const flags = parameters[1];
      const regex = new RegExp(pattern, flags);
      return regex.test(value);
    } catch {
      return false;
    }
  },
  message: 'The {field} format is invalid.',
  priority: 2,
};

/**
 * Alpha validation (letters only)
 */
export const alphaRule: Rule = {
  name: 'string.alpha',
  validate: (value: any): boolean => {
    return typeof value === 'string' && alphaRegex.test(value);
  },
  message: 'The {field} may only contain letters.',
  priority: 2,
};

/**
 * Alpha numeric validation (letters and numbers only)
 */
export const alphaNumericRule: Rule = {
  name: 'string.alpha_num',
  validate: (value: any): boolean => {
    return typeof value === 'string' && alphaNumericRegex.test(value);
  },
  message: 'The {field} may only contain letters and numbers.',
  priority: 2,
};

/**
 * Alpha dash validation (letters, numbers, dashes, and underscores only)
 */
export const alphaDashRule: Rule = {
  name: 'string.alpha_dash',
  validate: (value: any): boolean => {
    return typeof value === 'string' && alphaDashRegex.test(value);
  },
  message:
    'The {field} may only contain letters, numbers, dashes, and underscores.',
  priority: 2,
};

/**
 * Alpha space validation (letters, numbers, spaces, and underscores only)
 */
export const alphaSpaceRule: Rule = {
  name: 'string.alpha_space',
  validate: (value: any): boolean => {
    return typeof value === 'string' && alphaSpaceRegex.test(value);
  },
  message:
    'The {field} may only contain letters, numbers, spaces, and underscores.',
  priority: 2,
};
