import { Rule } from '../../types/rules';

/**
 * Port number validation
 */
export const portRule: Rule = {
  name: 'network.port',
  validate: (value: any): boolean => {
    if (typeof value !== 'number' && typeof value !== 'string') return false;
    const port = parseInt(value as string, 10);
    return !isNaN(port) && port >= 0 && port <= 65535;
  },
  message: 'The {field} must be a valid port number.',
  priority: 2,
};