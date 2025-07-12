import { describe, it, expect } from '@jest/globals';
import {
  stringMinRule,
  stringMaxRule,
  stringLengthRule,
  stringSizeRule,
  stringBetweenRule,
} from '../../../rules';

describe('String Rules - Basic', () => {
  let data = { user: { profile: { name: null } } };

  describe('stringMinRule', () => {
    it('passes when string length is >= min', () => {
      expect(stringMinRule.validate('hello', ['3'], 'name', data)).toBe(true);
      expect(stringMinRule.validate('hello', ['5'], 'name', data)).toBe(true);
    });

    it('fails when string length is < min', () => {
      expect(stringMinRule.validate('hi', ['3'], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(stringMinRule.validate(123, ['3'], 'name', data)).toBe(false);
      expect(stringMinRule.validate(null, ['3'], 'name', data)).toBe(false);
    });

    it('fails for invalid min parameter', () => {
      expect(stringMinRule.validate('hello', ['abc'], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(stringMinRule.message).toBe(
        'The {field} must be at least {0} characters.'
      );
    });
  });

  describe('stringMaxRule', () => {
    it('passes when string length is <= max', () => {
      expect(stringMaxRule.validate('hi', ['3'], 'name', data)).toBe(true);
      expect(stringMaxRule.validate('hello', ['5'], 'name', data)).toBe(true);
    });

    it('fails when string length is > max', () => {
      expect(stringMaxRule.validate('hello', ['3'], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(stringMaxRule.validate(123, ['3'], 'name', data)).toBe(false);
      expect(stringMaxRule.validate(null, ['3'], 'name', data)).toBe(false);
    });

    it('fails for invalid max parameter', () => {
      expect(stringMaxRule.validate('hello', ['abc'], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(stringMaxRule.message).toBe(
        'The {field} may not be greater than {0} characters.'
      );
    });
  });

  describe('stringLengthRule', () => {
    it('passes when string length equals exact length', () => {
      expect(stringLengthRule.validate('hello', ['5'], 'name', data)).toBe(true);
    });

    it('fails when string length does not equal exact length', () => {
      expect(stringLengthRule.validate('hi', ['5'], 'name', data)).toBe(false);
      expect(stringLengthRule.validate('hello', ['3'], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(stringLengthRule.validate(123, ['5'], 'name', data)).toBe(false);
      expect(stringLengthRule.validate(null, ['5'], 'name', data)).toBe(false);
    });

    it('fails for invalid length parameter', () => {
      expect(stringLengthRule.validate('hello', ['abc'], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(stringLengthRule.message).toBe(
        'The {field} must be exactly {0} characters.'
      );
    });
  });

  describe('stringSizeRule', () => {
    it('passes when string length equals size', () => {
      expect(stringSizeRule.validate('hello', ['5'], 'name', data)).toBe(true);
    });

    it('fails when string length does not equal size', () => {
      expect(stringSizeRule.validate('hi', ['5'], 'name', data)).toBe(false);
      expect(stringSizeRule.validate('hello', ['3'], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(stringSizeRule.validate(123, ['5'], 'name', data)).toBe(false);
      expect(stringSizeRule.validate(null, ['5'], 'name', data)).toBe(false);
    });

    it('fails for invalid size parameter', () => {
      expect(stringSizeRule.validate('hello', ['abc'], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(stringSizeRule.message).toBe(
        'The {field} must be {0} characters.'
      );
    });
  });

  describe('stringBetweenRule', () => {
    it('passes when string length is within range', () => {
      expect(stringBetweenRule.validate('hello', ['3', '7'], 'name', data)).toBe(true);
      expect(stringBetweenRule.validate('hi', ['2', '5'], 'name', data)).toBe(true);
    });

    it('fails when string length is outside range', () => {
      expect(stringBetweenRule.validate('h', ['2', '5'], 'name', data)).toBe(false);
      expect(stringBetweenRule.validate('hello', ['1', '3'], 'name', data)).toBe(false);
    });

    it('fails for non-string input', () => {
      expect(stringBetweenRule.validate(123, ['2', '5'], 'name', data)).toBe(false);
      expect(stringBetweenRule.validate(null, ['2', '5'], 'name', data)).toBe(false);
    });

    it('fails for invalid parameters', () => {
      expect(stringBetweenRule.validate('hello', ['abc', '5'], 'name', data)).toBe(false);
      expect(stringBetweenRule.validate('hello', ['2', 'abc'], 'name', data)).toBe(false);
    });

    it('has correct message', () => {
      expect(stringBetweenRule.message).toBe(
        'The {field} must be between {0} and {1} characters.'
      );
    });
  });
});
