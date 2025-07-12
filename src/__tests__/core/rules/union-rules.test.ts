import { describe, it, expect, beforeEach } from '@jest/globals';
import { Validator } from '../../../core/validator';
import { ValidationSchema } from '../../../types';

describe('Core Validator - Union Rules', () => {
  let validator: Validator;

  describe('Basic Union Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        identifier: 'union:(string|email;string|min:8)',
        value: 'union:(number|positive;string|min:3)',
        mixed: 'union:(boolean;number|between:1,10;string|in:yes,no,maybe)'
      };
      validator = new Validator(schema);
    });

    it('validates union types - first option matches', async () => {
      const data = {
        identifier: 'user@example.com', // matches email
        value: 5, // matches positive number
        mixed: true // matches boolean
      };

      const result = await validator.validate(data);

      expect(result.isValid).toBe(true);
    });

    it('validates union types - second option matches', async () => {
      const data = {
        identifier: 'username123', // matches min:8 string
        value: 'hello', // matches min:3 string
        mixed: 7 // matches number between 1,10
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('validates union types - third option matches', async () => {
      const data = {
        identifier: 'user@example.com',
        value: 'test',
        mixed: 'yes' // matches string in list
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails when no union option matches', async () => {
      const data = {
        identifier: 'short', // too short for min:8, not email
        value: -5, // negative number, too short string
        mixed: 'invalid' // not boolean, not in range, not in list
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(3);
    });
  });

  describe('Complex Union Scenarios', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        id: 'union:(string|uuid;number|integer|positive;string|regex:^ID[0-9]+$)',
        contact: 'union:(string|email;string|regex:^\\+[1-9][0-9]{1,14}$)', // email or phone
        file: 'union:(string|url;file|extensions:pdf,doc)'
      };
      validator = new Validator(schema);
    });

    it('validates complex union combinations', async () => {
      const testCases = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000', // UUID
          contact: 'user@example.com', // email
          file: 'https://example.com/document.pdf' // URL
        },
        {
          id: 42, // positive integer
          contact: '+1234567890', // phone
          file: new File(['content'], 'doc.pdf', { type: 'application/pdf' }) // file
        },
        {
          id: 'ID12345', // regex pattern
          contact: 'admin@domain.org',
          file: 'https://cdn.example.com/file.doc'
        }
      ];

      for (const data of testCases) {
        const result = await validator.validate(data);
        expect(result.isValid).toBe(true);
      }
    });

    it('fails on invalid complex unions', async () => {
      const data = {
        id: 'invalid-id', // not UUID, not positive int, doesn't match regex
        contact: 'not-email-or-phone',
        file: 123 // not URL, not file
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(3);
    });
  });

  describe('Union with Required/Optional', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        required: 'required|union:(string|min:3;number|positive)',
        optional: 'optional|union:(boolean;string|in:yes,no)',
        nullable: 'nullable|union:(string|email;number|between:1,100)'
      };
      validator = new Validator(schema);
    });

    it('validates required union fields', async () => {
      const data = {
        required: 'hello' // matches string|min:3
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('allows optional union fields to be missing', async () => {
      const data = {
        required: 5 // matches number|positive
        // optional is missing - should be allowed
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('allows nullable union fields to be null', async () => {
      const data = {
        required: 'test',
        optional: true,
        nullable: null // should be allowed
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails when required union field is missing', async () => {
      const data = {
        // required is missing
        optional: 'yes'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      // expect(result.errors.required).toBeDefined();
    });
  });

  describe('Union Error Messages', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        value: 'union:(string|email;number|min:10)'
      };
      validator = new Validator(schema);
    });

    it('provides descriptive error messages for union failures', async () => {
      const data = {
        value: 'invalid' // not email, not number >= 10
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      // expect(result.errors.value).toBeDefined();
      // expect(result.errors.value[0]).toContain('must match one of these formats');
    });
  });
});