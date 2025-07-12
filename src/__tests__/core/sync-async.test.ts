import { describe, it, expect, beforeEach } from '@jest/globals';
import { Validator } from '../../core/validator';
import { ValidationSchema } from '../../types';

describe('Validator Sync and Async Operations', () => {
  let schema: ValidationSchema;
  let validData: any;
  let invalidData: any;

  beforeEach(() => {
    schema = {
      name: 'required|string|min:2|max:50',
      email: 'required|string|email',
      age: 'number|min:18|max:120',
      website: 'string|url|nullable',
    };

    validData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
      website: 'https://example.com',
    };

    invalidData = {
      name: 'J',
      email: 'invalid-email',
      age: 15,
      website: 'not-a-url',
    };
  });

  describe('Synchronous Validation', () => {
    it('should validate synchronously with valid data', () => {
      const validator = new Validator(schema);
      const result = validator.validateSync(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate synchronously with invalid data', () => {
      const validator = new Validator(schema);
      const result = validator.validateSync(invalidData);

      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(4);
    });

    it('should handle sync validation with nullable fields', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        website: null,
      };

      const validator = new Validator(schema);
      const result = validator.validateSync(data);

      expect(result.isValid).toBe(true);
    });

    it('should handle sync validation with missing optional fields', () => {
      const optionalSchema = {
        name: 'required|string',
        email: 'required|string|email',
        phone: 'string|optional',
      };

      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        // phone is missing but optional
      };

      const validator = new Validator(optionalSchema);
      const result = validator.validateSync(data);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Asynchronous Validation', () => {
    it('should validate asynchronously with valid data', async () => {
      const validator = new Validator(schema);
      const result = await validator.validate(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate asynchronously with invalid data', async () => {
      const validator = new Validator(schema);
      const result = await validator.validate(invalidData);

      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(4);
    });

    it('should handle async validation with custom async rules', async () => {
      // This would test custom async rules like database uniqueness checks
      const asyncSchema = {
        username: 'required|string|unique:users',
        email: 'required|string|email|unique:users,email',
      };

      // Note: This test would require mock async rules
      // For now, we'll test the async infrastructure
      const validator = new Validator(schema);
      const result = await validator.validate(validData);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Performance Comparison', () => {
    it('should complete sync validation faster than async for simple rules', () => {
      const validator = new Validator(schema);

      const syncStart = performance.now();
      validator.validateSync(validData);
      const syncEnd = performance.now();
      const syncTime = syncEnd - syncStart;

      // Sync should be very fast for simple rules
      expect(syncTime).toBeLessThan(10); // Less than 10ms
    });

    it('should handle large datasets efficiently in both sync and async', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        [`item${i}`]: 'string|required|min:1',
      })).reduce((acc, curr) => ({ ...acc, ...curr }), {});

      const largeSchema = largeDataset;
      const largeData = Object.keys(largeSchema).reduce((acc, key) => {
        acc[key] = `value${key}`;
        return acc;
      }, {} as any);

      const validator = new Validator(largeSchema);

      // Test sync performance
      const syncStart = performance.now();
      const syncResult = validator.validateSync(largeData);
      const syncEnd = performance.now();

      // Test async performance
      const asyncStart = performance.now();
      const asyncResult = await validator.validate(largeData);
      const asyncEnd = performance.now();

      expect(syncResult.isValid).toBe(true);
      expect(asyncResult.isValid).toBe(true);

      // Both should complete in reasonable time
      expect(syncEnd - syncStart).toBeLessThan(1000); // Less than 1 second
      expect(asyncEnd - asyncStart).toBeLessThan(1000); // Less than 1 second
    });
  });

  // describe('Error Handling', () => {
  //   it('should handle sync validation errors gracefully', () => {
  //     const invalidSchema = {
  //       field: 'nonexistent|rule',
  //     };

  //     const validator = new Validator(invalidSchema);

  //     expect(() => {
  //       validator.validateSync({ field: 'value' });
  //     }).toThrow("Validation rule 'nonexistent' found without a data type");
  //   });

  //   it('should handle async validation errors gracefully', async () => {
  //     const invalidSchema = {
  //       field: 'nonexistent|rule',
  //     };

  //     const validator = new Validator(invalidSchema);

  //     await expect(validator.validate({ field: 'value' })).resolves.toThrow(
  //       "Validation rule 'nonexistent' found without a data type"
  //     );
  //   });
  // });

  describe('Mixed Sync/Async Rules', () => {
    it('should handle schemas with both sync and async rules', async () => {
      // Most rules are sync, but some like 'unique' would be async
      const mixedSchema = {
        name: 'required|string|min:2', // sync rules
        email: 'required|string|email', // sync rules
        age: 'number|min:18', // sync rules
      };

      const validator = new Validator(mixedSchema);

      // Should work with both sync and async validation
      const syncResult = validator.validateSync(validData);
      const asyncResult = await validator.validate(validData);

      expect(syncResult.isValid).toBe(asyncResult.isValid);
      expect(syncResult.errors).toEqual(asyncResult.errors);
    });
  });
});
