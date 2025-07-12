import { jest } from '@jest/globals';
import { LaravelFormatter } from '../../response/laravel-formatter';
import { ValidationError } from '../../types';

describe('LaravelFormatter', () => {
  let formatter: LaravelFormatter;
  let mockErrors: ValidationError[];

  beforeEach(() => {
    formatter = new LaravelFormatter();
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
        field: 'email',
        rule: 'required',
        message: 'The email field is required',
        value: null,
        parameters: []
      },
      {
        field: 'age',
        rule: 'min',
        message: 'The age field must be at least 18',
        value: 16,
        parameters: [18]
      }
    ];
  });

  it('should have the correct format type', () => {
    expect(formatter.formatType).toBe('laravel');
  });

  it('should format errors into a Laravel-style response with arrays of messages per field', () => {
    const result = formatter.format(mockErrors);

    expect(result).toEqual({
      name: ['The name field is required'],
      email: [
        'The email field must be a valid email address',
        'The email field is required'
      ],
      age: ['The age field must be at least 18']
    });
  });

  it('should return an empty object when there are no errors', () => {
    const result = formatter.format([]);
    expect(result).toEqual({});
  });

  it('should handle nested field names correctly', () => {
    const nestedErrors: ValidationError[] = [
      {
        field: 'user.profile.name',
        rule: 'required',
        message: 'The user profile name field is required',
        value: null,
        parameters: []
      },
      {
        field: 'items.0.price',
        rule: 'min',
        message: 'The items 1 price field must be at least 10',
        value: 5,
        parameters: [10]
      },
      {
        field: 'items.0.price',
        rule: 'required',
        message: 'The items 1 price field is required',
        value: null,
        parameters: []
      }
    ];

    const result = formatter.format(nestedErrors);

    expect(result).toEqual({
      'user.profile.name': ['The user profile name field is required'],
      'items.0.price': [
        'The items 1 price field must be at least 10',
        'The items 1 price field is required'
      ]
    });
  });

  // Add this test case to the existing describe block
  
  it('should handle union rule errors in Laravel format', () => {
    const unionErrors: ValidationError[] = [
      {
        field: 'identifier',
        rule: 'union',
        message: 'The identifier field must be a valid email address OR at least 8 characters',
        value: 'x',
        parameters: []
      },
      {
        field: 'identifier',
        rule: 'required',
        message: 'The identifier field is required',
        value: null,
        parameters: []
      }
    ];
  
    const result = formatter.format(unionErrors);
  
    expect(result).toEqual({
      identifier: [
        'The identifier field must be a valid email address OR at least 8 characters',
        'The identifier field is required'
      ]
    });
  });
});