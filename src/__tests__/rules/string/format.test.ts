import { describe, it, expect } from '@jest/globals';
import { emailRule, urlRule, uuidRule, jsonRule, ipv4Rule, ipv6Rule, ipRule, macAddressRule, hexColorRule, creditCardRule } from '../../../rules';

describe('String Rules - Format', () => {
  let data = { user: { profile: { name: null } } };

  describe('emailRule', () => {
    it('passes for valid email', () => {
      expect(emailRule.validate('test@example.com', [], 'name', data)).toBe(true);
      expect(emailRule.validate('user.name+tag@sub.domain.com', [], 'name', data)).toBe(true);
    });

    it('fails for invalid email', () => {
      expect(emailRule.validate('invalid.email', [], 'name', data)).toBe(false);
      expect(emailRule.validate('test@', [], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(emailRule.validate(123, [], 'name', data)).toBe(false);
      expect(emailRule.validate(null, [], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(emailRule.message).toBe('The {field} must be a valid email address.');
    });
  });

  describe('urlRule', () => {
    it('passes for valid URL', () => {
      expect(urlRule.validate('https://example.com', [], 'name', data)).toBe(true);
      expect(urlRule.validate('http://sub.domain.com/path', [], 'name', data)).toBe(true);
    });

    it('fails for invalid URL', () => {
      expect(urlRule.validate('not-a-url', [], 'name', data)).toBe(false);
      expect(urlRule.validate('ftp://invalid', [], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(urlRule.validate(123, [], 'name', data)).toBe(false);
      expect(urlRule.validate(null, [], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(urlRule.message).toBe('The {field} format is invalid.');
    });
  });

  describe('uuidRule', () => {
    it('passes for valid UUID', () => {
      expect(uuidRule.validate('123e4567-e89b-12d3-a456-426614174000', [], 'name', data)).toBe(true);
    });

    it('fails for invalid UUID', () => {
      expect(uuidRule.validate('invalid-uuid', [], 'name', data)).toBe(false);
      expect(uuidRule.validate('123e4567-e89b-12d3-a456-42661417400', [], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(uuidRule.validate(123, [], 'name', data)).toBe(false);
      expect(uuidRule.validate(null, [], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(uuidRule.message).toBe('The {field} must be a valid UUID.');
    });
  });

  describe('jsonRule', () => {
    it('passes for valid JSON', () => {
      expect(jsonRule.validate('{"key":"value"}', [], 'name', data)).toBe(true);
      expect(jsonRule.validate('[1,2,3]', [], 'name', data)).toBe(true);
    });

    it('fails for invalid JSON', () => {
      expect(jsonRule.validate('{key: value}', [], 'name', data)).toBe(false);
      expect(jsonRule.validate('invalid', [], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(jsonRule.validate({ key: 'value' }, [], 'name', data)).toBe(false);
      expect(jsonRule.validate(null, [], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(jsonRule.message).toBe('The {field} must be a valid JSON string.');
    });
  });

  describe('ipv4Rule', () => {
    it('passes for valid IPv4', () => {
      expect(ipv4Rule.validate('192.168.1.1', [], 'name', data)).toBe(true);
    });

    it('fails for invalid IPv4', () => {
      expect(ipv4Rule.validate('256.256.256.256', [], 'name', data)).toBe(false);
      expect(ipv4Rule.validate('192.168.1', [], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(ipv4Rule.validate(123, [], 'name', data)).toBe(false);
      expect(ipv4Rule.validate(null, [], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(ipv4Rule.message).toBe('The {field} must be a valid IPv4 address.');
    });
  });

  describe('ipv6Rule', () => {
    it('passes for valid IPv6', () => {
      expect(ipv6Rule.validate('2001:0db8:85a3:0000:0000:8a2e:0370:7334', [], 'name', data)).toBe(true);
      expect(ipv6Rule.validate('::1', [], 'name', data)).toBe(true);
    });

    it('fails for invalid IPv6', () => {
      expect(ipv6Rule.validate('invalid-ipv6', [], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(ipv6Rule.validate(123, [], 'name', data)).toBe(false);
      expect(ipv6Rule.validate(null, [], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(ipv6Rule.message).toBe('The {field} must be a valid IPv6 address.');
    });
  });

  describe('ipRule', () => {
    it('has correct message', () => {
      expect(ipRule.message).toBe('The {field} must be a valid IP address.');
    });
    // TODO: Add tests once ipRule logic is implemented
  });

  describe('macAddressRule', () => {
    it('passes for valid MAC address', () => {
      expect(macAddressRule.validate('00:1A:2B:3C:4D:5E', [], 'name', data)).toBe(true);
      expect(macAddressRule.validate('001A.2B3C.4D5E', [], 'name', data)).toBe(true);
    });

    it('fails for invalid MAC address', () => {
      expect(macAddressRule.validate('00:1A:2B:3C:4D', [], 'name', data)).toBe(false);
      expect(macAddressRule.validate('invalid', [], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(macAddressRule.validate(123, [], 'name', data)).toBe(false);
      expect(macAddressRule.validate(null, [], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(macAddressRule.message).toBe('The {field} must be a valid MAC address.');
    });
  });

  describe('hexColorRule', () => {
    it('passes for valid hex color', () => {
      expect(hexColorRule.validate('#FF0000', [], 'name', data)).toBe(true);
      expect(hexColorRule.validate('#F00', [], 'name', data)).toBe(true);
    });

    it('fails for invalid hex color', () => {
      expect(hexColorRule.validate('#GG0000', [], 'name', data)).toBe(false);
      expect(hexColorRule.validate('FF0000', [], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(hexColorRule.validate(123, [], 'name', data)).toBe(false);
      expect(hexColorRule.validate(null, [], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(hexColorRule.message).toBe('The {field} must be a valid hex color.');
    });
  });

  describe('creditCardRule', () => {
    it('passes for valid credit card number', () => {
      expect(creditCardRule.validate('4532015112830366', [], 'name', data)).toBe(true); // Valid Visa
    });

    it('fails for invalid credit card number', () => {
      expect(creditCardRule.validate('4532015112830367', [], 'name', data)).toBe(false);
      expect(creditCardRule.validate('123', [], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(creditCardRule.validate(4532015112830366, [], 'name', data)).toBe(false);
      expect(creditCardRule.validate(null, [], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(creditCardRule.message).toBe('The {field} must be a valid credit card number.');
    });
  });
});