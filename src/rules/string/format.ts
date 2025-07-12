import { Rule } from '../../types/rules';

// Pre-compiled regexes for maximum performance
const urlRegex = /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
const ipv4Simple = /^(\d{1,3}\.){3}\d{1,3}$/;
const ipv6Simple = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{4}\.){2}([0-9A-Fa-f]{4})$/;
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const digitRegex = /^\d+$/;

/**
 * Email validation
 */
export const emailRule: Rule = {
  name: 'string.email',
  validate: (value: any): boolean => {
    return typeof value === 'string' && emailRegex.test(value);
  },
  message: 'The {field} must be a valid email address.',
  priority: 2,
};

/**
 * URL validation
 */
export const urlRule: Rule = {
  name: 'string.url',
  validate: (value: any): boolean => {
    return typeof value === 'string' && urlRegex.test(value);
  },
  message: 'The {field} format is invalid.',
  priority: 2,
};

/**
 * UUID validation
 */
export const uuidRule: Rule = {
  name: 'string.uuid',
  validate: (value: any): boolean => {
    return typeof value === 'string' && uuidRegex.test(value);
  },
  message: 'The {field} must be a valid UUID.',
  priority: 2,
};

/**
 * JSON validation
 */
export const jsonRule: Rule = {
  name: 'string.json',
  validate: (value: any): boolean => {
    if (typeof value !== 'string') return false;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },
  message: 'The {field} must be a valid JSON string.',
  priority: 2,
};

/**
 * IPv4 validation
 */
export const ipv4Rule: Rule = {
  name: 'string.ipv4',
  validate: (value: any): boolean => {
    return typeof value === 'string' && ipv4Regex.test(value);
  },
  message: 'The {field} must be a valid IPv4 address.',
  priority: 2,
};

/**
 * IPv6 validation
 */
export const ipv6Rule: Rule = {
  name: 'string.ipv6',
  validate: (value: any): boolean => {
    return typeof value === 'string' && ipv6Regex.test(value);
  },
  message: 'The {field} must be a valid IPv6 address.',
  priority: 2,
};

/**
 * IP address validation (IPv4 or IPv6)
 */
export const ipRule: Rule = {
  name: 'string.ip',
  validate: (value: any): boolean => {
    return typeof value === 'string' && (ipv4Simple.test(value) || ipv6Simple.test(value));
  },
  message: 'The {field} must be a valid IP address.',
  priority: 2,
};

/**
 * MAC address validation
 */
export const macAddressRule: Rule = {
  name: 'string.mac_address',
  validate: (value: any): boolean => {
    return typeof value === 'string' && macRegex.test(value);
  },
  message: 'The {field} must be a valid MAC address.',
  priority: 2,
};

/**
 * Hex color validation
 */
export const hexColorRule: Rule = {
  name: 'string.hex_color',
  validate: (value: any): boolean => {
    return typeof value === 'string' && hexColorRegex.test(value);
  },
  message: 'The {field} must be a valid hex color.',
  priority: 2,
};

/**
 * Credit card validation (Luhn algorithm) - Optimized
 */
export const creditCardRule: Rule = {
  name: 'string.credit_card',
  validate: (value: any): boolean => {
    if (typeof value !== 'string') return false;

    // Fast length check first
    const len = value.length;
    if (len < 13 || len > 23) return false; // Account for spaces/dashes

    // Remove spaces and dashes in single pass
    let cardNumber = '';
    for (let i = 0; i < len; i++) {
      const char = value[i];
      if (char !== ' ' && char !== '-') {
        cardNumber += char;
      }
    }

    const cardLen = cardNumber.length;
    if (cardLen < 13 || cardLen > 19) return false;

    // Fast digit check
    if (!digitRegex.test(cardNumber)) return false;

    // Optimized Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cardLen - 1; i >= 0; i--) {
      let digit = cardNumber.charCodeAt(i) - 48; // Convert char to number using ASCII

      if (isEven) {
        digit <<= 1; // Multiply by 2 using bitshift
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return (sum % 10) === 0;
  },
  message: 'The {field} must be a valid credit card number.',
  priority: 2,
};