import { describe, it, expect } from '@jest/globals';
import { inRule, notInRule } from '../../../rules';

describe('String Rules - List', () => {
  let data = { user: { profile: { name: null } } };

  describe('inRule', () => {
    it('passes when value is in parameters', () => {
      expect(inRule.validate('apple', ['apple', 'banana', 'orange'], 'name', data)).toBe(true);
    });

    it('fails when value is not in parameters', () => {
      expect(inRule.validate('grape', ['apple', 'banana', 'orange'], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(inRule.validate(123, ['apple', 'banana'], 'name', data)).toBe(false);
      expect(inRule.validate(null, ['apple', 'banana'], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(inRule.message).toBe('The {field} must be one of the following values: {0}.');
    });
  });

  describe('notInRule', () => {
    it('passes when value is not in parameters', () => {
      expect(notInRule.validate('grape', ['apple', 'banana', 'orange'], 'name', data)).toBe(true);
    });

    it('fails when value is in parameters', () => {
      expect(notInRule.validate('apple', ['apple', 'banana', 'orange'], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(notInRule.validate(123, ['apple', 'banana'], 'name', data)).toBe(false);
      expect(notInRule.validate(null, ['apple', 'banana'], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(notInRule.message).toBe('The {field} must not be one of the following values: {0}.');
    });
  });
});