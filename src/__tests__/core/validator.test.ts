import { describe, it, expect, beforeEach } from '@jest/globals';
import { Validator } from '../../core/validator';
import { ValidationSchema } from '../../types';

describe('Validator', () => {
  let validator: Validator;

  describe('Basic Validation Rules', () => {
    describe('String Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        name: 'string|min:2|max:50',
        email: 'string|email',
        website: 'string|url|nullable',
        description: 'string|optional',
      };
      validator = new Validator(schema);
    });

    it('validates valid string data', async () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        website: 'https://example.com'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toStrictEqual({});
    });

    it('fails on invalid string data', async () => {
      const data = {
        name: 'J', // too short
        email: 'not-an-email',
        website: 'invalid-url',
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toStrictEqual({
        name: ['The name field must be at least 2 characters'],
        email: ['The email field must be a valid email address'],
        website: ['The website field must be a valid URL'],
      });
    });

    it('allows nullable fields to be null', async () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        website: null
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('allows optional fields to be missing', async () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        website: 'https://example.com'
        // description is missing but optional
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });
    });

    describe('Number Validation', () => {
      beforeEach(() => {
        const schema: ValidationSchema = {
          age: 'number|min:18|max:120',
          score: 'number|between:0,100',
          rating: 'number|min:0|nullable',
          count: 'number|integer|optional',
        };
        validator = new Validator(schema);
      });

      it('validates valid number data', async () => {
        const data = {
          age: 25,
          score: 85,
          rating: 4.5,
        };

        const result = await validator.validate(data);

        expect(result.isValid).toBe(true);
      });

      it('fails on invalid number data', async () => {
        const data = {
          age: 15, // below min
          score: 120, // above max for between
          rating: -1, // below min
        };

        const result = await validator.validate(data);
        expect(result.isValid).toBe(false);
        expect(result.errors).toStrictEqual({
          age: ['The age field must be at least 18'],
          score: ['The score field must be between 0 and 100'],
          rating: ['The rating field must be at least 0'],
        });
      });

      it('allows nullable number fields to be null', async () => {
        const data = {
          age: 25,
          score: 85,
          rating: null,
        };

        const result = await validator.validate(data);
        expect(result.isValid).toBe(true);
      });
    });

    describe('Boolean Validation', () => {
      beforeEach(() => {
        const schema: ValidationSchema = {
          'active': 'boolean',
          'subscribed': 'boolean|nullable',
          'verified': 'boolean|optional'
        };
        validator = new Validator(schema);
      });

      it('validates valid boolean data', async () => {
        const data = {
          active: true,
          subscribed: false
        };

        const result = await validator.validate(data);
        expect(result.isValid).toBe(true);
      });

      it('fails on invalid boolean data', async () => {
        const data = {
          active: 'yes', // not a boolean
          subscribed: 1 // not a boolean
        };

        const result = await validator.validate(data);
        expect(result.isValid).toBe(false);
      });

      it('allows nullable boolean fields to be null', async () => {
        const data = {
          active: true,
          subscribed: null
        };

        const result = await validator.validate(data);
        expect(result.isValid).toBe(true);
      });
    });

    describe('Date Validation', () => {
      beforeEach(() => {
        const schema: ValidationSchema = {
          'birthdate': 'date',
          'appointment': 'date|after:2023-01-01',
          'expiry': 'date|before:2025-12-31|nullable',
          'lastLogin': 'date|optional'
        };
        validator = new Validator(schema);
      });

      it('validates valid date data', async () => {
        const data = {
          birthdate: '1990-01-01',
          appointment: '2023-06-15',
          expiry: '2024-12-31'
        };

        const result = await validator.validate(data);
        expect(result.isValid).toBe(true);
      });

      it('fails on invalid date data', async () => {
        const data = {
          birthdate: 'not-a-date',
          appointment: '2022-01-01', // before min date
          expiry: '2026-01-01' // after max date
        };

        const result = await validator.validate(data);
        expect(result.isValid).toBe(false);
      });

      it('allows nullable date fields to be null', async () => {
        const data = {
          birthdate: '1990-01-01',
          appointment: '2023-06-15',
          expiry: null
        };

        const result = await validator.validate(data);
        expect(result.isValid).toBe(true);
      });
    });

    describe('Required Fields', () => {
      beforeEach(() => {
        const schema: ValidationSchema = {
          'username': 'required|string',
          'password': 'required|string|min:8',
          'terms': 'required|boolean'
        };
        validator = new Validator(schema);
      });

      it('validates when all required fields are present', async () => {
        const data = {
          username: 'johndoe',
          password: 'password123',
          terms: true
        };

        const result = await validator.validate(data);
        expect(result.isValid).toBe(true);
      });

      it('fails when required fields are missing', async () => {
        const data = {
          username: 'johndoe',
          // password is missing
          terms: true
        };

        const result = await validator.validate(data);
        expect(result.isValid).toBe(false);
        expect(result.errors).toStrictEqual({
        password: [
          'The password field is required',
          'The password field must be a string',
          'The password field must be at least 8 characters'
        ]
      });
      });

      it('fails when required fields are null or empty', async () => {
        const data = {
          username: '',
          password: null,
          terms: false // this is valid as it's a boolean
        };

        const result = await validator.validate(data);

        expect(result.isValid).toBe(false);
        expect(result.errors).toStrictEqual({
        username: [ 'The username field is required' ],
        password: [
          'The password field is required',
          'The password field must be a string',
          'The password field must be at least 8 characters'
        ]
      });
      });
    });

    describe('Coercion Options', () => {
      it('coerces string values when enabled', async () => {
        const schema: ValidationSchema = {
          'age': 'number|min:18'
        };
        validator = new Validator(schema, {
          coercion: { enabled: true, numbers: true }
        });

        const data = {
          age: '25' // string that should be coerced to number
        };

        const result = await validator.validate(data);
        expect(result.isValid).toBe(true);
      });

      it('does not coerce values when disabled', async () => {
        const schema: ValidationSchema = {
          'age': 'number|min:18'
        };
        validator = new Validator(schema, {
          coercion: { enabled: false }
        });

        const data = {
          age: '25' // string that should not be coerced
        };

        const result = validator.validateSync(data);
        expect(result.isValid).toBe(false); // fails because '25' is not a number
      });
    });
  });
});
