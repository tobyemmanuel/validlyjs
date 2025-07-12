import { describe, it, expect, beforeEach } from '@jest/globals';
import { Validator } from '../../../core/validator';
import { ValidationSchema } from '../../../types';

describe('Core Validator - Object Rules', () => {
  let validator: Validator;

  describe('Basic Object Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        profile: 'object',
        'profile.name': 'string|required',
        'profile.age': 'number|min:18',
        'profile.email': 'string|email'
      };
      validator = new Validator(schema);
    });

    it('validates object structure', async () => {
      const data = {
        profile: {
          name: 'John Doe',
          age: 25,
          email: 'john@example.com'
        }
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid object structure', async () => {
      const data = {
        profile: 'not-an-object'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      // expect(result.errors.profile).toBeDefined();
    });
  });

  describe('Nested Object Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        'user.profile.personal.name': 'string|required',
        'user.profile.personal.age': 'number|min:18',
        'user.profile.contact.email': 'string|email',
        'user.profile.contact.phone': 'string|optional',
        'user.settings.theme': 'string|in:light,dark',
        'user.settings.notifications': 'boolean'
      };
      validator = new Validator(schema);
    });

    it('validates deeply nested objects', async () => {
      const data = {
        user: {
          profile: {
            personal: {
              name: 'John Doe',
              age: 25
            },
            contact: {
              email: 'john@example.com',
              phone: '+1234567890'
            }
          },
          settings: {
            theme: 'dark',
            notifications: true
          }
        }
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid nested values', async () => {
      const data = {
        user: {
          profile: {
            personal: {
              age: 16 // too young
            },
            contact: {
              email: 'invalid-email'
            }
          },
          settings: {
            theme: 'blue', // not in allowed list
            notifications: 'yes' // not boolean
          }
        }
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });

  describe('Object with Array Properties', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        'company.employees.*.name': 'string|required',
        'company.employees.*.position': 'string|required',
        'company.employees.*.salary': 'number|min:0',
        'company.departments': 'array|min:1',
        'company.departments.*': 'string'
      };
      validator = new Validator(schema);
    });

    it('validates objects with array properties', async () => {
      const data = {
        company: {
          employees: [
            { name: 'John', position: 'Developer', salary: 50000 },
            { name: 'Jane', position: 'Designer', salary: 45000 }
          ],
          departments: ['Engineering', 'Design', 'Marketing']
        }
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid array elements in objects', async () => {
      const data = {
        company: {
          employees: [
            { name: 'John', salary: -1000 }, // missing position, negative salary
            { position: 'Designer', salary: 45000 } // missing name
          ],
          departments: [] // empty array
        }
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });
});