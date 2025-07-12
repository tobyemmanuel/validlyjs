import { describe, it, expect, beforeEach } from '@jest/globals';
import { Validator } from '../../../core/validator';
import { ValidationSchema } from '../../../types';

describe('Core Validator - Boolean Rules', () => {
  let validator: Validator;

  describe('Basic Boolean Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        active: 'boolean',
        verified: 'boolean|required',
        subscribed: 'boolean|nullable',
        optional: 'boolean|optional'
      };
      validator = new Validator(schema);
    });

    it('validates boolean values', async () => {
      const data = {
        active: true,
        verified: false,
        subscribed: true
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on non-boolean values', async () => {
      const data = {
        active: 'yes',
        verified: 1,
        subscribed: 'true'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(3);
    });

    it('allows null for nullable boolean', async () => {
      const data = {
        active: true,
        verified: false,
        subscribed: null
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('allows missing optional boolean', async () => {
      const data = {
        active: true,
        verified: false,
        subscribed: true
        // optional is missing
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Boolean Coercion', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        flag: 'boolean'
      };
      validator = new Validator(schema, {
        coercion: { enabled: true, booleans: true }
      });
    });

    it('coerces truthy values to true', async () => {
      const testCases = [
        { flag: 'true' },
        { flag: '1' },
        { flag: 1 },
        { flag: 'yes' },
        { flag: 'on' }
      ];

      for (const data of testCases) {
        const result = await validator.validate(data);
        expect(result.isValid).toBe(true);
      }
    });

    it('coerces falsy values to false', async () => {
      const testCases = [
        { flag: 'false' },
        { flag: '0' },
        { flag: 0 },
        { flag: 'no' },
        { flag: 'off' }
      ];

      for (const data of testCases) {
        const result = await validator.validate(data);
        expect(result.isValid).toBe(true);
      }
    });
  });
});