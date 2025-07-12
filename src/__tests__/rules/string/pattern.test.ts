import { describe, it, expect } from '@jest/globals';
import {
  regexRule,
  alphaRule,
  alphaNumericRule,
  alphaDashRule,
  alphaSpaceRule,
} from '../../../rules';

describe('String Rules - Pattern', () => {
  let data = {};
  describe('regexRule', () => {
    it('passes for valid regex match', () => {
      expect(regexRule.validate('hello', ['^h.*o$', 'i'], 'name', data)).toBe(
        true
      );
    });

    it('fails for invalid regex match', () => {
      expect(regexRule.validate('hello', ['^x.*y$', 'i'], 'name', data)).toBe(
        false
      );
    });

    it('fails for non-string input', () => {
      expect(regexRule.validate(123, ['^h.*o$', 'i'], 'name', data)).toBe(
        false
      );
      expect(regexRule.validate(null, ['^h.*o$', 'i'], 'name', data)).toBe(
        false
      );
    });

    it('fails for invalid regex pattern', () => {
      expect(regexRule.validate('hello', ['[a-z', 'i'], 'name', data)).toBe(
        false
      );
    });

    it('has correct message', () => {
      expect(regexRule.message).toBe('The {field} format is invalid.');
    });
  });

  describe('alphaRule', () => {
    it('passes for letters only', () => {
      expect(alphaRule.validate('hello', [], 'name', data)).toBe(true);
    });

    it('fails for non-letters', () => {
      expect(alphaRule.validate('hello123', [], 'name', data)).toBe(false);
      expect(alphaRule.validate('hello!', [], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(alphaRule.validate(123, [], 'name', data)).toBe(false);
      expect(alphaRule.validate(null, [], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(alphaRule.message).toBe('The {field} may only contain letters.');
    });
  });

  describe('alphaNumericRule', () => {
    it('passes for letters and numbers', () => {
      expect(alphaNumericRule.validate('hello123', [], 'name', data)).toBe(
        true
      );
    });

    it('fails for non-alphanumeric characters', () => {
      expect(alphaNumericRule.validate('hello!', [], 'name', data)).toBe(false);
      expect(alphaNumericRule.validate('hello world', [], 'name', data)).toBe(
        false
      );
    });

    it('fails for non-string input', () => {
      expect(alphaNumericRule.validate(123, [], 'name', data)).toBe(false);
      expect(alphaNumericRule.validate(null, [], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(alphaNumericRule.message).toBe(
        'The {field} may only contain letters and numbers.'
      );
    });
  });

  describe('alphaDashRule', () => {
    it('passes for letters, numbers, dashes, and underscores', () => {
      expect(alphaDashRule.validate('hello-123_', [], 'name', data)).toBe(true);
    });

    it('fails for other characters', () => {
      expect(alphaDashRule.validate('hello!', [], 'name', data)).toBe(false);
      expect(alphaDashRule.validate('hello world', [], 'name', data)).toBe(
        false
      );
    });

    it('fails for non-string input', () => {
      expect(alphaDashRule.validate(123, [], 'name', data)).toBe(false);
      expect(alphaDashRule.validate(null, [], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(alphaDashRule.message).toBe(
        'The {field} may only contain letters, numbers, dashes, and underscores.'
      );
    });
  });

  describe('alphaSpaceRule', () => {
    it('passes for letters, numbers, spaces, and underscores', () => {
      expect(alphaSpaceRule.validate('hello world_123', [], 'name', data)).toBe(
        true
      );
    });

    it('fails for other characters', () => {
      expect(alphaSpaceRule.validate('hello!', [], 'name', data)).toBe(false);
      expect(alphaSpaceRule.validate('hello-world', [], 'name', data)).toBe(
        false
      );
    });

    it('fails for non-string input', () => {
      expect(alphaSpaceRule.validate(123, [], 'name', data)).toBe(false);
      expect(alphaSpaceRule.validate(null, [], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(alphaSpaceRule.message).toBe(
        'The {field} may only contain letters, numbers, spaces, and underscores.'
      );
    });
  });
});
