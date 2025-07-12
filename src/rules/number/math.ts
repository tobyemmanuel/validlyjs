import { Rule } from '../../types/rules';

/**
 * Number multiple of validation
 */
export const numberMultipleOfRule: Rule = {
  name: 'number.multiple_of',
  validate: (value: any, parameters: any[]): boolean => {
    if (typeof value !== 'number' || isNaN(value)) return false;
    const [divisor] = parameters;
    const div = parseFloat(divisor);
    return value % div === 0;
  },
  message: 'The {field} must be a multiple of {0}.',
  priority: 2,
};