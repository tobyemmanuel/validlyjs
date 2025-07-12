import { jest } from '@jest/globals';
import { FlatFormatter } from '../../response/flat-formatter';
import { ValidationError } from '../../types';

describe('FlatFormatter', () => {
  let formatter: FlatFormatter;
  let mockErrors: ValidationError[];

  beforeEach(() => {
    formatter = new FlatFormatter();
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
    expect(formatter.formatType).toBe('flat');
  });

  it('should format errors into a flat object with first error message per field', () => {
    const result = formatter.format(mockErrors);

    expect(result).toEqual({
      name: 'The name field is required',
      email: 'The email field must be a valid email address',
      age: 'The age field must be at least 18'
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
      }
    ];

    const result = formatter.format(nestedErrors);

    expect(result).toEqual({
      'user.profile.name': 'The user profile name field is required',
      'items.0.price': 'The items 1 price field must be at least 10'
    });
  });

  // Add this test case to the existing describe block
  
  it('should handle union rule errors correctly', () => {
    const unionErrors: ValidationError[] = [
      {
        field: 'identifier',
        rule: 'union',
        message: 'The identifier field must match one of these formats: a valid email address OR at least 8 characters',
        value: 'invalid',
        parameters: []
      },
      {
        field: 'credential',
        rule: 'union',
        message: 'The credential field must be either a UUID or valid phone number',
        value: 'bad-value',
        parameters: []
      }
    ];
  
    const result = formatter.format(unionErrors);
  
    expect(result).toEqual({
      identifier: 'The identifier field must match one of these formats: a valid email address OR at least 8 characters',
      credential: 'The credential field must be either a UUID or valid phone number'
    });
  });
  
  it('should handle mixed union and regular validation errors', () => {
    const mixedErrors: ValidationError[] = [
      {
        field: 'name',
        rule: 'required',
        message: 'The name field is required',
        value: null,
        parameters: []
      },
      {
        field: 'identifier',
        rule: 'union',
        message: 'The identifier field must be a valid email address OR at least 8 characters',
        value: 'x',
        parameters: []
      }
    ];
  
    const result = formatter.format(mixedErrors);
  
    expect(result).toEqual({
      name: 'The name field is required',
      identifier: 'The identifier field must be a valid email address OR at least 8 characters'
    });
  });
});