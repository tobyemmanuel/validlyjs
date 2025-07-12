import { jest } from '@jest/globals';
import { NestedFormatter } from '../../response/nested-formatter';
import { ValidationError } from '../../types';

describe('NestedFormatter', () => {
  let formatter: NestedFormatter;
  let mockErrors: ValidationError[];

  beforeEach(() => {
    formatter = new NestedFormatter();
    mockErrors = [
      {
        field: 'name',
        rule: 'required',
        message: 'The name field is required',
        value: null,
        parameters: []
      },
      {
        field: 'email',
        rule: 'email',
        message: 'The email field must be a valid email address',
        value: 'invalid-email',
        parameters: []
      },
      {
        field: 'user.profile.age',
        rule: 'min',
        message: 'The user profile age field must be at least 18',
        value: 16,
        parameters: [18]
      },
      {
        field: 'items.0.price',
        rule: 'min',
        message: 'The items 1 price field must be at least 10',
        value: 5,
        parameters: [10]
      }
    ];
  });

  it('should have the correct format type', () => {
    expect(formatter.formatType).toBe('nested');
  });

  it('should format errors into a nested object structure', () => {
    const result = formatter.format(mockErrors);

    expect(result).toEqual({
      name: {
        required: 'The name field is required'
      },
      email: {
        email: 'The email field must be a valid email address'
      },
      user: {
        profile: {
          age: {
            min: 'The user profile age field must be at least 18'
          }
        }
      },
      items: {
        '0': {
          price: {
            min: 'The items 1 price field must be at least 10'
          }
        }
      }
    });
  });

  it('should return an empty object when there are no errors', () => {
    const result = formatter.format([]);
    expect(result).toEqual({});
  });

  it('should handle multiple errors for the same field with different rules', () => {
    const multiErrors: ValidationError[] = [
      {
        field: 'password',
        rule: 'required',
        message: 'The password field is required',
        value: null,
        parameters: []
      },
      {
        field: 'password',
        rule: 'min',
        message: 'The password field must be at least 8 characters',
        value: '123',
        parameters: [8]
      },
      {
        field: 'password',
        rule: 'regex',
        message: 'The password field must contain at least one uppercase letter',
        value: 'password123',
        parameters: [/[A-Z]/]
      }
    ];

    const result = formatter.format(multiErrors);

    expect(result).toEqual({
      password: {
        required: 'The password field is required',
        min: 'The password field must be at least 8 characters',
        regex: 'The password field must contain at least one uppercase letter'
      }
    });
  });

  it('should handle deeply nested fields correctly', () => {
    const deeplyNestedErrors: ValidationError[] = [
      {
        field: 'user.address.shipping.street',
        rule: 'required',
        message: 'The user address shipping street field is required',
        value: null,
        parameters: []
      },
      {
        field: 'user.address.shipping.zipcode',
        rule: 'regex',
        message: 'The user address shipping zipcode field format is invalid',
        value: '123',
        parameters: [/^\d{5}(-\d{4})?$/]
      }
    ];

    const result = formatter.format(deeplyNestedErrors);

    expect(result).toEqual({
      user: {
        address: {
          shipping: {
            street: {
              required: 'The user address shipping street field is required'
            },
            zipcode: {
              regex: 'The user address shipping zipcode field format is invalid'
            }
          }
        }
      }
    });
  });

  // Add this test case to the existing describe block
  
  it('should handle union rule errors in nested format', () => {
    const unionErrors: ValidationError[] = [
      {
        field: 'user.identifier',
        rule: 'union',
        message: 'The user identifier field must be a valid email address OR at least 8 characters',
        value: 'x',
        parameters: []
      },
      {
        field: 'settings.theme',
        rule: 'union',
        message: 'The settings theme field must be light OR dark OR auto',
        value: 'invalid-theme',
        parameters: []
      }
    ];
  
    const result = formatter.format(unionErrors);
  
    expect(result).toEqual({
      user: {
        identifier: {
          union: 'The user identifier field must be a valid email address OR at least 8 characters'
        }
      },
      settings: {
        theme: {
          union: 'The settings theme field must be light OR dark OR auto'
        }
      }
    });
  });
});