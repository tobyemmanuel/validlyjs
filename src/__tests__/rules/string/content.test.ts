import { describe, it, expect } from '@jest/globals';
import { startsWithRule, endsWithRule, containsRule } from '../../../rules';

describe('String Rules - Content', () => {
  let data = { user: { profile: { name: null } } };

  describe('startsWithRule', () => {
    it('passes when string starts with parameter', () => {
      expect(startsWithRule.validate('hello world', ['hello'], 'name', data)).toBe(true);
    });

    it('fails when string does not start with parameter', () => {
      expect(startsWithRule.validate('world hello', ['hello'], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(startsWithRule.validate(123, ['hello'], 'name', data)).toBe(false);
      expect(startsWithRule.validate(null, ['hello'], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(startsWithRule.message).toBe('The {field} must start with {0}.');
    });
  });

  describe('endsWithRule', () => {
    it('passes when string ends with parameter', () => {
      expect(endsWithRule.validate('hello world', ['world'], 'name', data)).toBe(true);
    });

    it('fails when string does not end with parameter', () => {
      expect(endsWithRule.validate('hello world', ['hello'], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(endsWithRule.validate(123, ['world'], 'name', data)).toBe(false);
      expect(endsWithRule.validate(null, ['world'], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(endsWithRule.message).toBe('The {field} must end with {0}.');
    });
  });

  describe('containsRule', () => {
    it('passes when string contains parameter', () => {
      expect(containsRule.validate('hello world', ['lo'], 'name', data)).toBe(true);
    });

    it('fails when string does not contain parameter', () => {
      expect(containsRule.validate('hello world', ['xyz'], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(containsRule.validate(123, ['lo'], 'name', data)).toBe(false);
      expect(containsRule.validate(null, ['lo'], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(containsRule.message).toBe('The {field} must contain {0}.');
    });
  });
});