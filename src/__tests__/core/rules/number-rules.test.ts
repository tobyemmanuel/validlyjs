import { describe, it, expect, beforeEach } from '@jest/globals';
import { Validator } from '../../../core/validator';
import { ValidationSchema } from '../../../types';

describe('Core Validator - Number Rules', () => {
  let validator: Validator;

  describe('Basic Number Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        age: 'number',
        score: 'number|integer',
        rating: 'number|numeric',
        price: 'number|decimal:2'
      };
      validator = new Validator(schema);
    });

    it('validates basic number types', async () => {
      const data = {
        age: 25,
        score: 100,
        rating: 4.5,
        price: 19.99
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid number types', async () => {
      const data = {
        age: 'twenty-five',
        score: 100.5, // should be integer
        rating: 'four point five',
        price: 'nineteen ninety-nine'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(4);
    });
  });

  describe('Number Range Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        minAge: 'number|min:18',
        maxScore: 'number|max:100',
        betweenRange: 'number|between:1,10',
        exactSize: 'number|size:5'
      };
      validator = new Validator(schema);
    });

    it('validates number ranges', async () => {
      const data = {
        minAge: 25,
        maxScore: 85,
        betweenRange: 7,
        exactSize: 5
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid ranges', async () => {
      const data = {
        minAge: 16, // below min
        maxScore: 120, // above max
        betweenRange: 15, // outside range
        exactSize: 3 // wrong size
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(4);
    });
  });

  describe('Number Sign Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        positiveNum: 'number|positive',
        negativeNum: 'number|negative',
        nonNegative: 'number|min:0',
        nonPositive: 'number|max:0'
      };
      validator = new Validator(schema);
    });

    it('validates number signs', async () => {
      const data = {
        positiveNum: 5,
        negativeNum: -3,
        nonNegative: 0,
        nonPositive: -1
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid signs', async () => {
      const data = {
        positiveNum: -5,
        negativeNum: 3,
        nonNegative: -1,
        nonPositive: 1
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(4);
    });
  });

  describe('Number List Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        inList: 'number|in:1,2,3,4,5',
        notInList: 'number|not_in:0,10,20'
      };
      validator = new Validator(schema);
    });

    it('validates number lists', async () => {
      const data = {
        inList: 3,
        notInList: 15
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid list values', async () => {
      const data = {
        inList: 7,
        notInList: 10
      };

      const result = await validator.validate(data);

      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(2);
    });
  });
});