import { describe, it, expect, beforeEach } from '@jest/globals';
import { Validator } from '../../core/validator';
import { ValidationSchema } from '../../types';
import { string, number, union, object } from '../../fluent';

describe('Core Validator - Parsers', () => {
  let validator: Validator;

  describe('String Parser', () => {
    it('parses string-based schemas', async () => {
      const schema: ValidationSchema = {
        name: 'string|required|min:3|max:50',
        email: 'string|email|nullable',
        age: 'number|min:18|max:120'
      };
      validator = new Validator(schema);

      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('handles complex string schemas with union types', async () => {
      const schema: ValidationSchema = {
        identifier: 'union:(string|email;string|min:8|alpha_num)'
      };
      validator = new Validator(schema);

      const validData = [
        { identifier: 'user@example.com' },
        { identifier: 'username123' }
      ];

      for (const data of validData) {
        const result = await validator.validate(data);
        expect(result.isValid).toBe(true);
      }
    });
  });

  describe('Array Parser', () => {
    it('parses array-based schemas', async () => {
      const schema: ValidationSchema = {
        name: ['string', 'required', 'min:3'],
        tags: ['array', 'min:1'],
        'tags.*': ['string', 'max:20']
      };
      validator = new Validator(schema);

      const data = {
        name: 'John',
        tags: ['javascript', 'typescript']
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('handles union types in array format', async () => {
      const schema: ValidationSchema = {
        value: [['string', 'email'], ['number', 'positive']]
      };
      validator = new Validator(schema);

      const validData = [
        { value: 'test@example.com' },
        { value: 42 }
      ];

      for (const data of validData) {
        const result = await validator.validate(data);
        expect(result.isValid).toBe(true);
      }
    });
  });

  describe('Fluent Parser', () => {
    it('parses fluent builder schemas', async () => {
      const schema: ValidationSchema = {
        name: string().required().min(3).max(50),
        age: number().min(18).max(120),
        email: string().email().nullable()
      };
      validator = new Validator(schema);

      const data = {
        name: 'John Doe',
        age: 25,
        email: 'john@example.com'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('handles fluent union types', async () => {
      const schema: ValidationSchema = {
        identifier: union()
          .add(string().email())
          .add(string().min(8).alphaNum())
      };
      validator = new Validator(schema);

      const validData = [
        { identifier: 'user@example.com' },
        { identifier: 'username123' }
      ];

      for (const data of validData) {
        const result = await validator.validate(data);
        expect(result.isValid).toBe(true);
      }
    });

    it('handles nested fluent objects', async () => {
      const schema: ValidationSchema = {
        user: object().shape({
          profile: object().shape({
            name: string().required(),
            age: number().min(18),
            contact: object().shape({
              email: string().email(),
              phone: string().optional()
            })
          })
        })
      };
      validator = new Validator(schema);

      const data = {
        user: {
          profile: {
            name: 'John Doe',
            age: 25,
            contact: {
              email: 'john@example.com',
              phone: '+1234567890'
            }
          }
        }
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('validates nested object structure with missing optional fields', async () => {
      const schema: ValidationSchema = {
        user: object().shape({
          profile: object().shape({
            name: string().required(),
            age: number().min(18),
            contact: object().shape({
              email: string().email(),
              phone: string().optional()
            })
          })
        })
      };
      validator = new Validator(schema);

      const data = {
        user: {
          profile: {
            name: 'Jane Doe',
            age: 30,
            contact: {
              email: 'jane@example.com'
              // phone is optional and missing
            }
          }
        }
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Mixed Parser Types', () => {
    it('handles mixed string and fluent schemas', async () => {
      const schema: ValidationSchema = {
        name: 'string|required|min:3',
        age: number().min(18).max(120),
        email: string().email().nullable(),
        tags: ['array', 'min:1'],
        'tags.*': 'string|max:20'
      };
      validator = new Validator(schema);

      const data = {
        name: 'John Doe',
        age: 25,
        email: 'john@example.com',
        tags: ['javascript', 'typescript']
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('handles complex mixed validation scenarios', async () => {
      const schema: ValidationSchema = {
        user: object().shape({
          name: string().required().min(2),
          preferences: object().shape({
            theme: string().in(['light', 'dark']),
            notifications: 'boolean|optional'
          })
        }),
        metadata: 'object|optional',
        'metadata.created_at': 'string|date|optional'
      };
      validator = new Validator(schema);

      const data = {
        user: {
          name: 'Alice',
          preferences: {
            theme: 'dark',
            notifications: true
          }
        },
        metadata: {
          created_at: '2023-01-01T00:00:00Z'
        }
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });
  });
});