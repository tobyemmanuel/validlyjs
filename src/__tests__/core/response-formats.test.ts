import { describe, it, expect, beforeEach } from '@jest/globals';
import { Validator } from '../../core/validator';
import { ValidationSchema, ValidatorOptions } from '../../types';

describe('Validator Response Formats', () => {
  let schema: ValidationSchema;
  let invalidData: any;

  beforeEach(() => {
    schema = {
      'name': 'required|string|min:2',
      'email': 'required|string|email',
      'user.profile.age': 'number|min:18',
      'user.profile.bio': 'string|max:500',
      'items.0.title': 'required|string',
      'items.1.price': 'number|min:0'
    };

    invalidData = {
      name: 'J', // too short
      email: 'invalid-email',
      user: {
        profile: {
          age: 15, // too young
          bio: 'A'.repeat(600) // too long
        }
      },
      items: [
        { title: '' }, // required
        { price: -10 } // negative
      ]
    };
  });

  describe('Flat Format (Default)', () => {
    it('should return flat error format by default', async () => {
      const validator = new Validator(schema);
      const result = await validator.validate(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        'name': expect.arrayContaining([expect.stringContaining('at least 2')]),
        'email': expect.arrayContaining([expect.stringContaining('valid email')]),
        'user.profile.age': expect.arrayContaining([expect.stringContaining('at least 18')]),
        'user.profile.bio': expect.arrayContaining([expect.stringContaining('500')]),
        'items.0.title': expect.arrayContaining([expect.stringContaining('required')]),
        'items.1.price': expect.arrayContaining([expect.stringContaining('at least 0')])
      });
    });
  });

  describe('Grouped Format', () => {
    it('should return grouped error format', async () => {
      const config: ValidatorOptions = {
        responseType: 'grouped'
      };
      
      const validator = new Validator(schema, config);
      const result = await validator.validate(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        '_root': {
          'name': expect.any(Array),
          'email': expect.any(Array)
        },
        'user': {
          'profile.age': expect.any(Array),
          'profile.bio': expect.any(Array)
        },
        'items': {
          '0.title': expect.any(Array),
          '1.price': expect.any(Array)
        }
      });
    });
  });

  describe('Nested Format', () => {
    it('should return nested error format', async () => {
      const config: ValidatorOptions = {
        responseType: 'nested'
      };
      
      const validator = new Validator(schema, config);
      const result = await validator.validate(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        name: expect.objectContaining({
          'string.min': expect.any(String)
        }),
        email: expect.objectContaining({
          'string.email': expect.any(String)
        }),
        user: {
          profile: {
            age: expect.objectContaining({
              'number.min': expect.any(String)
            }),
            bio: expect.objectContaining({
              'string.max': expect.any(String)
            })
          }
        },
        items: {
          0: {
            title: expect.objectContaining({
              required: expect.any(String)
            })
          },
          1: {
            price: expect.objectContaining({
              'number.min': expect.any(String)
            })
          }
        }
      });
    });
  });

  describe('Laravel Format', () => {
    it('should return Laravel-style error format', async () => {
      const config: ValidatorOptions = {
        responseType: 'laravel'
      };
      
      const validator = new Validator(schema, config);
      const result = await validator.validate(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        'name': expect.any(Array),
        'email': expect.any(Array),
        'user.profile.age': expect.any(Array),
        'user.profile.bio': expect.any(Array),
        'items.0.title': expect.any(Array),
        'items.1.price': expect.any(Array)
      });
    });
  });

  // describe('Custom Formatter', () => {
  //   it('should use custom formatter when provided', async () => {
  //     class CustomFormatter {
  //       formatType = 'custom';
        
  //       format(errors: any[]) {
  //         return {
  //           hasErrors: true,
  //           errorCount: errors.length,
  //           details: errors
  //         };
  //       }
  //     }
      
  //     const config: ValidatorOptions = {
  //       formatter: new CustomFormatter()
  //     };
      
  //     const validator = new Validator(schema, config);
  //     const result = await validator.validate(invalidData);
  //     console.log(result)
      
  //     expect(result.isValid).toBe(false);
  //     expect(result.errors).toEqual({
  //       hasErrors: true,
  //       errorCount: expect.any(Number),
  //       details: expect.any(Array)
  //     });
  //   });
  // });
});