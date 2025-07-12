import { describe, it, expect, beforeEach } from '@jest/globals';
import { Validator } from '../../../core/validator';
import { ValidationSchema } from '../../../types';
import { CustomRuleDefinition } from '../../../types/rules';

describe('Core Validator - Custom Rules', () => {
  let validator: Validator;

  describe('Custom Rule Registration', () => {
    const customRule: CustomRuleDefinition = {
      validate: (value: any) => {
        return typeof value === 'number' && value % 2 === 0;
      },
      message: 'The {field} must be an even number.'
    };

    beforeEach(() => {
      const schema: ValidationSchema = {
        evenNumber: 'number|custom_even'
      };
      validator = new Validator(schema);
      validator.extend('custom_even', customRule);
    });

    it('validates using custom rules', async () => {
      const data = {
        evenNumber: 4
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on custom rule validation', async () => {
      const data = {
        evenNumber: 3 // odd number
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(result.errors['evenNumber'][0]).toBe('The even number must be an even number.');
    });
  });

  describe('Array Parser Custom Rules', () => {
    const customEvenRule: CustomRuleDefinition = {
      validate: (value: any) => {
        return typeof value === 'number' && value % 2 === 0;
      },
      message: 'The {field} must be an even number.'
    };

    const customRangeRule: CustomRuleDefinition = {
      validate: (value: any, parameters: any[]) => {
        const min = parameters[0];
        const max = parameters[1];
        return typeof value === 'number' && value >= min && value <= max;
      },
      message: 'The {field} must be between {0} and {1}.'
    };

    beforeEach(() => {
      Validator.extend('custom_even', customEvenRule);
      Validator.extend('custom_range', customRangeRule);
    });

    it('validates using array syntax with custom rules', async () => {
      const schema: ValidationSchema = {
        evenNumber: ['number', 'custom_even'],
        rangeNumber: ['number', 'custom_range:10,20']
      };
      validator = new Validator(schema);

      const data = {
        evenNumber: 8,
        rangeNumber: 15
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails validation with array syntax custom rules', async () => {
      const schema: ValidationSchema = {
        evenNumber: ['number', 'custom_even'],
        rangeNumber: ['number', 'custom_range:10,20']
      };
      validator = new Validator(schema);

      const data = {
        evenNumber: 7, // odd number
        rangeNumber: 25 // out of range
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(result.errors['evenNumber'][0]).toBe('The even number must be an even number.');
      expect(result.errors['rangeNumber'][0]).toBe('The range number must be between 10 and 20.');
    });

    it('validates nested array fields with custom rules', async () => {
      const schema: ValidationSchema = {
        'users.*.age': ['number', 'custom_range:18,65']
      };
      validator = new Validator(schema);

      const data = {
        users: [
          { age: 25 },
          { age: 45 }
        ]
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails nested array validation with custom rules', async () => {
      const schema: ValidationSchema = {
        'users.*.age': ['number', 'custom_range:18,65']
      };
      validator = new Validator(schema);

      const data = {
        users: [
          { age: 16 }, // too young
          { age: 70 }  // too old
        ]
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(result.errors['users[0].age'][0]).toBe('The users[0] age must be between 18 and 65.');
      expect(result.errors['users[1].age'][0]).toBe('The users[1] age must be between 18 and 65.');
    });
  });

  describe('Fluent Parser Custom Rules', () => {
    const customEmailDomainRule: CustomRuleDefinition = {
      validate: (value: any, parameters: any[]) => {
        const allowedDomain = parameters[0];
        if (typeof value !== 'string') return false;
        return value.endsWith(`@${allowedDomain}`);
      },
      message: 'The {field} must be from {0} domain.'
    };

    const customPasswordStrengthRule: CustomRuleDefinition = {
      validate: (value: any) => {
        if (typeof value !== 'string') return false;
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        return hasUpper && hasLower && hasNumber && hasSpecial;
      },
      message: 'The {field} must contain uppercase, lowercase, number and special character.'
    };

    beforeEach(() => {
      Validator.extend('custom_email_domain', customEmailDomainRule);
      Validator.extend('custom_password_strength', customPasswordStrengthRule);
    });

    it('validates using fluent API with custom rules', async () => {
      const schema = {
        email: 'string|email|custom_email_domain:company.com',
        password: 'string|min:8|custom_password_strength'
      };
      validator = new Validator(schema);

      const data = {
        email: 'user@company.com',
        password: 'SecurePass123!'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails fluent API validation with custom rules', async () => {
      const schema = {
        email: 'string|email|custom_email_domain:company.com',
        password: 'string|min:8|custom_password_strength'
      };
      validator = new Validator(schema);

      const data = {
        email: 'user@gmail.com', // wrong domain
        password: 'weakpass' // weak password
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(result.errors['email'][0]).toBe('The email must be from company.com domain.');
      expect(result.errors['password'][0]).toBe('The password must contain uppercase, lowercase, number and special character.');
    });

    it('validates complex fluent chains with multiple custom rules', async () => {
      const customAgeRule: CustomRuleDefinition = {
        validate: (value: any, parameters: any[]) => {
          const minAge = parameters[0];
          return typeof value === 'number' && value >= minAge;
        },
        message: 'The {field} must be at least {0} years old.'
      };

      Validator.extend('custom_min_age', customAgeRule);

      const schema = {
        'profile.email': 'string|email|custom_email_domain:company.com',
        'profile.age': 'number|custom_min_age:21|custom_range:21,65',
        'profile.password': 'string|min:12|custom_password_strength'
      };
      validator = new Validator(schema);

      const data = {
        profile: {
          email: 'senior@company.com',
          age: 35,
          password: 'VerySecurePass123!@#'
        }
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails complex fluent validation with custom rules', async () => {
      const customAgeRule: CustomRuleDefinition = {
        validate: (value: any, parameters: any[]) => {
          const minAge = parameters[0];
          return typeof value === 'number' && value >= minAge;
        },
        message: 'The {field} must be at least {0} years old.'
      };

      Validator.extend('custom_min_age', customAgeRule);

      const schema = {
        'profile.email': 'string|email|custom_email_domain:company.com',
        'profile.age': 'number|custom_min_age:21|custom_range:21,65',
        'profile.password': 'string|min:12|custom_password_strength'
      };
      validator = new Validator(schema);

      const data = {
        profile: {
          email: 'junior@gmail.com', // wrong domain
          age: 19, // too young
          password: 'simple' // weak and short
        }
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(result.errors['profile.email'][0]).toBe('The profile email must be from company.com domain.');
      expect(result.errors['profile.age'][0]).toBe('The profile age must be at least 21 years old.');
      expect(result.errors['profile.password'][0]).toContain('The profile password field must be at least 12 characters');
    });
  });

  describe('Mixed Parser Custom Rules', () => {
    const customUniqueRule: CustomRuleDefinition = {
      validate: (value: any, parameters: any[], field: string, data: Record<string, any>) => {
        const otherFields = parameters;
        for (const otherField of otherFields) {
          if (data[otherField] === value) {
            return false;
          }
        }
        return true;
      },
      message: 'The {field} must be unique among the specified fields.'
    };

    beforeEach(() => {
      Validator.extend('custom_unique', customUniqueRule);
    });

    it('validates mixed array and string syntax with custom rules', async () => {
      const schema: ValidationSchema = {
        username: ['string', 'min:3', 'custom_unique:email,phone'],
        email: 'string|email|custom_unique:username,phone',
        phone: ['string', 'custom_unique:username,email']
      };
      validator = new Validator(schema);

      const data = {
        username: 'john_doe',
        email: 'john@example.com',
        phone: '+1234567890'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails mixed syntax validation with custom rules', async () => {
      const schema: ValidationSchema = {
        username: ['string', 'min:3', 'custom_unique:email,phone'],
        email: 'string|email|custom_unique:username,phone',
        phone: ['string', 'custom_unique:username,email']
      };
      validator = new Validator(schema);

      const data = {
        username: 'duplicate',
        email: 'duplicate', // same as username
        phone: 'duplicate'  // same as username and email
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(result.errors['email'][1]).toBe('The email must be unique among the specified fields.');
      expect(result.errors['phone'][0]).toBe('The phone must be unique among the specified fields.');
    });
  });

  describe('Async Custom Rules', () => {
    const asyncRule: CustomRuleDefinition = {
      validate: async (value: any) => {
        // Simulate async database check
        await new Promise(resolve => setTimeout(resolve, 10));
        return value !== 'taken@example.com';
      },
      message: 'The {field} is already taken.',
      async: true
    };

    beforeEach(() => {
      const schema: ValidationSchema = {
        email: 'string|email|async_unique_email'
      };

      Validator.extend('async_unique_email', asyncRule);
      validator = new Validator(schema);
    });

    it('validates using async custom rules', async () => {
      const data = {
        email: 'available@example.com'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on async custom rule validation', async () => {
      const data = {
        email: 'taken@example.com'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(result.errors['email']).toContain('The email is already taken.');
    });
  });

  describe('Custom Rules with Parameters', () => {
    const parameterizedRule: CustomRuleDefinition = {
      validate: (value: any, parameters: any[]) => {
        const divisor = parameters[0];
        return typeof value === 'number' && value % divisor === 0;
      },
      message: 'The {field} must be divisible by {0}.'
    };

    beforeEach(() => {
      const schema: ValidationSchema = {
        number: 'number|divisible_by:3'
      };
      Validator.extend('divisible_by', parameterizedRule);
      validator = new Validator(schema);
    });

    it('validates using parameterized custom rules', async () => {
      const data = {
        number: 9 // divisible by 3
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on parameterized custom rule validation', async () => {
      const data = {
        number: 10 // not divisible by 3
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(result.errors['number'][0]).toBe('The number must be divisible by 3.');
    });
  });

  describe('Custom Rules with Context', () => {
    const contextRule: CustomRuleDefinition = {
      validate: (value: any, parameters: any[], field: string, data: Record<string, any>) => {
        const otherField = parameters[0];
        return value === data[otherField];
      },
      message: 'The {field} must match {0}.'
    };

    beforeEach(() => {
      const schema: ValidationSchema = {
        password: 'string|min:8',
        confirmPassword: 'string|matches_field:password'
      };
      Validator.extend('matches_field', contextRule);
      validator = new Validator(schema);
    });

    it('validates using context-aware custom rules', async () => {
      const data = {
        password: 'secretpassword',
        confirmPassword: 'secretpassword'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on context-aware custom rule validation', async () => {
      const data = {
        password: 'secretpassword',
        confirmPassword: 'differentpassword'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(result.errors['confirmPassword'][0]).toBe('The confirm password must match password.');
    });
  });

});