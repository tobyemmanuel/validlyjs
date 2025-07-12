import { jest } from '@jest/globals';
import { GroupedFormatter } from '../../response/grouped-formatter';
import { ValidationError } from '../../types';

describe('GroupedFormatter', () => {
  let formatter: GroupedFormatter;
  let mockErrors: ValidationError[];

  beforeEach(() => {
    formatter = new GroupedFormatter();
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
        field: 'user.profile.bio',
        rule: 'max',
        message: 'The user profile bio field must not exceed 500 characters',
        value: 'Too long bio...',
        parameters: [500]
      }
    ];
  });

  it('should have the correct format type', () => {
    expect(formatter.formatType).toBe('grouped');
  });

  it('should format errors into groups based on the first segment of the field name', () => {
    const result = formatter.format(mockErrors);

    expect(result).toEqual({
      _root: {
        name: ['The name field is required'],
        email: ['The email field must be a valid email address']
      },
      user: {
        'profile.age': ['The user profile age field must be at least 18'],
        'profile.bio': ['The user profile bio field must not exceed 500 characters']
      }
    });
  });

  it('should return an empty object when there are no errors', () => {
    const result = formatter.format([]);
    expect(result).toEqual({});
  });

  it('should group root-level fields under _root', () => {
    const rootErrors: ValidationError[] = [
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
      }
    ];

    const result = formatter.format(rootErrors);

    expect(result).toEqual({
      _root: {
        name: ['The name field is required'],
        email: ['The email field must be a valid email address']
      }
    });
  });

  it('should handle array indices in field names correctly', () => {
    const arrayErrors: ValidationError[] = [
      {
        field: 'items.0.name',
        rule: 'required',
        message: 'The items 1 name field is required',
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
        field: 'items.1.name',
        rule: 'required',
        message: 'The items 2 name field is required',
        value: null,
        parameters: []
      }
    ];

    const result = formatter.format(arrayErrors);

    expect(result).toEqual({
      items: {
        '0.name': ['The items 1 name field is required'],
        '0.price': ['The items 1 price field must be at least 10'],
        '1.name': ['The items 2 name field is required']
      }
    });
  });

  // Add this test case to the existing describe block
  
  it('should handle union rule errors in grouped format', () => {
    const unionErrors: ValidationError[] = [
      {
        field: 'identifier',
        rule: 'union',
        message: 'The identifier field must be a valid email address OR at least 8 characters',
        value: 'x',
        parameters: []
      },
      {
        field: 'user.profile.avatar',
        rule: 'union',
        message: 'The user profile avatar field must be a valid URL OR valid file path',
        value: 'invalid-path',
        parameters: []
      }
    ];
  
    const result = formatter.format(unionErrors);
  
    expect(result).toEqual({
      _root: {
        identifier: ['The identifier field must be a valid email address OR at least 8 characters']
      },
      user: {
        'profile.avatar': ['The user profile avatar field must be a valid URL OR valid file path']
      }
    });
  });
});