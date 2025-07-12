import { Rule } from '../../types/rules';

/**
 * Domain name validation
 */
export const domainRule: Rule = {
  name: 'network.domain',
  validate: (value: any): boolean => {
    if (typeof value !== 'string') return false;
    const domain = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return domain.test(value);
  },
  message: 'The {field} must be a valid domain name.',
  priority: 2,
};