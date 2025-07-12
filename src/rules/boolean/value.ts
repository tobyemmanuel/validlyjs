import { Rule } from '../../types/rules';

/**
 * Boolean true validation
 */
export const booleanTrueRule: Rule = {
  name: 'boolean.true',
  validate: (value: any): boolean => {
    return value === true;
  },
  message: 'The {field} must be true.',
  priority: 2,
};

/**
 * Boolean accepted validation
 */
export const booleanAcceptedRule: Rule = {
  name: 'boolean.accepted',
  validate: (value: any): boolean => {
    return value === true;
  },
  message: 'The {field} must be accepted.',
  priority: 2,
};


/**
 * Boolean false validation
 */
export const booleanFalseRule: Rule = {
  name: 'boolean.false',
  validate: (value: any): boolean => {
    return value === false;
  },
  message: 'The {field} must be false.',
  priority: 2,
};