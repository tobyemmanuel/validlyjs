import { describe, it, expect, beforeEach } from '@jest/globals';
import { Validator } from '../../core/validator';
import { ValidationSchema, ValidatorOptions } from '../../types';

describe('Validator Configuration', () => {
  let schema: ValidationSchema;

  beforeEach(() => {
    schema = {
      name: 'string|required|min:2',
      age: 'number|min:18',
      email: 'string|email'
    };
  });

  describe('Coercion Configuration', () => {
    it('should coerce string numbers when coercion is enabled', async () => {
      const config: ValidatorOptions = {
        coercion: {
          enabled: true,
          numbers: true,
          booleans: false,
          strings: false
        }
      };
      
      const validator = new Validator(schema, config);
      const data = { name: 'John', age: '25', email: 'john@example.com' };
      
      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('should not coerce when coercion is disabled', async () => {
      const config: ValidatorOptions = {
        coercion: { enabled: false }
      };
      
      const validator = new Validator(schema, config);
      const data = { name: 'John', age: '25', email: 'john@example.com' };
      
      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(result.errors['age']).toContain('The age field must be a number');
    });

    it('should coerce boolean values when enabled', async () => {
      const boolSchema = { active: 'boolean|required' };
      const config: ValidatorOptions = {
        coercion: {
          enabled: true,
          booleans: true
        }
      };
      
      const validator = new Validator(boolSchema, config);
      const data = { active: 'true' };
      
      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Stop on First Failure', () => {
    it('should stop on first failure when configured', async () => {
      const config: ValidatorOptions = {
        stopOnFirstError: true
      };
      
      const validator = new Validator(schema, config);
      const data = { name: 'J', age: 15, email: 'invalid' }; // Multiple failures
      
      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      // Should only have one error (first failure)
      const errorCount = Object.keys(result.errors).length;
      expect(errorCount).toBe(1);
    });

    it('should collect all failures when not configured to stop', async () => {
      const config: ValidatorOptions = {
        stopOnFirstError: false
      };
      
      const validator = new Validator(schema, config);
      const data = { name: 'J', age: 15, email: 'invalid' }; // Multiple failures
      
      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      // Should have multiple errors
      const errorCount = Object.keys(result.errors).length;
      expect(errorCount).toBeGreaterThan(1);
    });
  });

  describe('Language Configuration', () => {
    it('should use custom language when configured', async () => {
      const config: ValidatorOptions = {
        language: 'es' // Spanish
      };
      
      const validator = new Validator(schema, config);
      const data = { name: '', age: 15, email: 'invalid' };
      
      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      // Error messages should be in Spanish (if Spanish language pack exists)
    });
  });

  describe('Custom Messages', () => {
    it('should use custom messages when provided', async () => {
      const config: ValidatorOptions = {
        fieldMessages: {
          'name.required': 'Name is mandatory',
          'age.number.min': 'Age must be at least 18 years old'
        }
      };
      
      const validator = new Validator(schema, config);
      const data = { age: 15, email: 'john@example.com' };
      
      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(result.errors['name']).toContain('Name is mandatory');
      expect(result.errors['age']).toContain('Age must be at least 18 years old');
    });
  });

  describe('Bail Configuration', () => {
    it('should bail on first rule failure for field when configured', async () => {
      const multiRuleSchema = {
        password: 'required|string|min:8|max:20'
      };
      
      const config: ValidatorOptions = {
        stopOnFirstError: true
      };
      
      const validator = new Validator(multiRuleSchema, config);
      const data = { password: '' }; // Fails required, should not check other rules
      
      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(result.errors['password']).toHaveLength(1); // Only required error
    });
  });
});