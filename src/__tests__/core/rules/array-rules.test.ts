import { describe, it, expect, beforeEach } from '@jest/globals';
import { Validator } from '../../../core/validator';
import { ValidationSchema } from '../../../types';

describe('Core Validator - Array Rules', () => {
  let validator: Validator;

  describe('Basic Array Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        tags: 'array',
        numbers: 'array|min:2',
        items: 'array|max:5',
        exactItems: 'array|length:3',
        rangeItems: 'array|between:2,6'
      };
      validator = new Validator(schema);
    });

    it('validates array constraints', async () => {
      const data = {
        tags: ['tag1', 'tag2'],
        numbers: [1, 2, 3],
        items: ['a', 'b', 'c'],
        exactItems: ['x', 'y', 'z'],
        rangeItems: ['1', '2', '3', '4']
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid array constraints', async () => {
      const data = {
        tags: 'not-an-array',
        numbers: [1], // too few
        items: [1, 2, 3, 4, 5, 6], // too many
        exactItems: ['x', 'y'], // wrong length
        rangeItems: ['1'] // outside range
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(5);
    });
  });

  describe('Array Content Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        'stringArray.*': 'string',
        'numberArray.*': 'number|min:0',
        'emailArray.*': 'string|email',
        'nestedArray.*.name': 'string|required',
        'nestedArray.*.age': 'number|min:18'
      };
      validator = new Validator(schema);
    });

    it('validates array element types', async () => {
      const data = {
        stringArray: ['hello', 'world'],
        numberArray: [1, 2, 3],
        emailArray: ['test@example.com', 'user@domain.com'],
        nestedArray: [
          { name: 'John', age: 25 },
          { name: 'Jane', age: 30 }
        ]
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid array element types', async () => {
      const data = {
        stringArray: ['hello', 123],
        numberArray: [1, -2, 3],
        emailArray: ['test@example.com', 'invalid-email'],
        nestedArray: [
          { name: 'John', age: 16 }, // age too low
          { age: 30 } // missing name
        ]
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });

  describe('Array Uniqueness', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        uniqueStrings: 'array|distinct',
        uniqueNumbers: 'array|distinct'
      };
      validator = new Validator(schema);
    });

    it('validates unique array elements', async () => {
      const data = {
        uniqueStrings: ['a', 'b', 'c'],
        uniqueNumbers: [1, 2, 3]
      };

      const result = await validator.validate(data);

      expect(result.isValid).toBe(true);
    });

    it('fails on duplicate array elements', async () => {
      const data = {
        uniqueStrings: ['a', 'b', 'a'],
        uniqueNumbers: [1, 2, 2]
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(2);
    });
  });
});