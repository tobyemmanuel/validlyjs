import { jest } from '@jest/globals';
import { MessageFormatter } from '../../messages/formatter';
import { MessageContext } from '../../types';

describe('MessageFormatter', () => {
  let formatter: MessageFormatter;
  let context: MessageContext;

  beforeEach(() => {
    formatter = new MessageFormatter();
    context = {
      field: 'user.profile.name',
      rule: 'required',
      value: null,
      parameters: [5, 10],
      data: { user: { profile: { name: null } } }
    };
  });

  describe('format', () => {
    it('should format basic placeholders correctly', () => {
      const template = 'The {field} is required';
      const result = formatter.format(template, context);
      expect(result).toBe('The user profile name is required');
    });

    it('should format rule placeholders correctly', () => {
      const template = 'Failed validation rule: {rule}';
      const result = formatter.format(template, context);
      expect(result).toBe('Failed validation rule: required');
    });

    it('should format value placeholders correctly', () => {
      context.value = 'test';
      const template = 'The value is {value}';
      const result = formatter.format(template, context);
      expect(result).toBe('The value is test');
    });

    it('should format numeric parameter placeholders correctly', () => {
      const template = 'Must be between {0} and {1}';
      const result = formatter.format(template, context);
      expect(result).toBe('Must be between 5 and 10');
    });

    it('should format named parameter placeholders correctly', () => {
      context.rule = 'between';
      const template = 'Must be between {min} and {max}';
      const result = formatter.format(template, context);
      expect(result).toBe('Must be between 5 and 10');
    });

    it('should handle templates without placeholders', () => {
      const template = 'This field is invalid';
      const result = formatter.format(template, context);
      expect(result).toBe('This field is invalid');
    });

    it('should handle missing parameters gracefully', () => {
      const template = 'Parameter {2} is not available';
      const result = formatter.format(template, context);
      expect(result).toBe('Parameter  is not available');
    });

    it('should cache compiled templates for performance', () => {
      // Spy on the private compileTemplate method
      const compileSpy = jest.spyOn(formatter as any, 'compileTemplate');

      // First call should compile
      formatter.format('The {field} is required', context);
      expect(compileSpy).toHaveBeenCalledTimes(1);

      // Second call with same template should use cache
      formatter.format('The {field} is required', context);
      expect(compileSpy).toHaveBeenCalledTimes(1);

      // Different template should compile again
      formatter.format('The {field} must be {0}', context);
      expect(compileSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('formatFieldName', () => {
    it('should format dot notation field names correctly', () => {
      expect(formatter.formatFieldName('user.profile.name')).toBe('user profile name');
    });

    it('should format camelCase field names correctly', () => {
      expect(formatter.formatFieldName('firstName')).toBe('first name');
    });

    it('should format snake_case field names correctly', () => {
      expect(formatter.formatFieldName('first_name')).toBe('first name');
    });

    it('should format array indices correctly', () => {
      expect(formatter.formatFieldName('items.0.name')).toBe('items item 1 name');
    });

    it('should handle wildcard segments correctly', () => {
      expect(formatter.formatFieldName('items.*.name')).toBe('items item name');
    });

    it('should cache formatted field names for performance', () => {
      // Access private cache
      const cache = (formatter as any).fieldNameCache;
      
      // Clear cache to start fresh
      cache.clear();
      
      // We need to use format() with a field placeholder to trigger the caching
      // because formatFieldName() doesn't use the cache directly
      const template = 'The {field} is required';
      const testContext = {
        field: 'user.profile.name',
        rule: 'required',
        value: null,
        parameters: [],
        data: {}
      };
      
      formatter.format(template, testContext);
      
      // Check that it's in the cache
      expect(cache.has('user.profile.name')).toBe(true);
      expect(cache.get('user.profile.name')).toBe('user profile name');
    });
  });

  describe('custom placeholders', () => {
    it('should allow adding custom placeholder formatters', () => {
      formatter.addPlaceholder('uppercase', (value) => String(value).toUpperCase());
      
      const template = 'The value in uppercase: {uppercase}';
      context.value = 'test';
      
      const result = formatter.format(template, context);
      expect(result).toBe('The value in uppercase: TEST');
    });

    it('should use built-in placeholder formatters', () => {
      const dateContext = { ...context, value: new Date('2023-01-01') };
      const template = 'The date is: {date}';
      
      const result = formatter.format(template, dateContext);
      expect(result).toContain('2023'); // Exact format may vary by locale
    });

    it('should format arrays correctly with the array placeholder', () => {
      const arrayContext = { ...context, value: [1, 2, 3] };
      const template = 'The array is: {array}';
      
      const result = formatter.format(template, arrayContext);
      expect(result).toBe('The array is: 1, 2, 3');
    });

    it('should format file sizes correctly', () => {
      const sizeContext = { ...context, value: 1536 };
      const template = 'The file size is: {file_size}';
      
      const result = formatter.format(template, sizeContext);
      expect(result).toBe('The file size is: 1.5KB');
    });
  });

  describe('formatValue', () => {
    it('should format string values with quotes', () => {
      const stringContext = { ...context, value: 'test' };
      const template = 'Value: {value}';
      
      const result = formatter.format(template, stringContext);
      expect(result).toBe('Value: test');
    });

    it('should format number values without quotes', () => {
      const numberContext = { ...context, value: 42 };
      const template = 'Value: {value}';
      
      const result = formatter.format(template, numberContext);
      expect(result).toBe('Value: 42');
    });

    it('should format boolean values correctly', () => {
      const boolContext = { ...context, value: true };
      const template = 'Value: {value}';
      
      const result = formatter.format(template, boolContext);
      expect(result).toBe('Value: true');
    });

    it('should format null and undefined correctly', () => {
      const nullContext = { ...context, value: null };
      const undefinedContext = { ...context, value: undefined };
      const template = 'Value: {value}';
      
      expect(formatter.format(template, nullContext)).toBe('Value: null');
      expect(formatter.format(template, undefinedContext)).toBe('Value: undefined');
    });

    it('should format objects using JSON.stringify', () => {
      const objectContext = { ...context, value: { a: 1, b: 2 } };
      const template = 'Value: {value}';
      
      const result = formatter.format(template, objectContext);
      expect(result).toBe('Value: {"a":1,"b":2}');
    });
  });

  describe('cache management', () => {
    it('should clear caches when requested', () => {
      // Fill caches
      formatter.format('The {field} is required', context);
      formatter.formatFieldName('user.profile.name');
      
      // Access private caches
      const templateCache = (formatter as any).templateCache;
      const fieldNameCache = (formatter as any).fieldNameCache;
      
      // Verify caches are populated
      expect(templateCache.size).toBeGreaterThan(0);
      expect(fieldNameCache.size).toBeGreaterThan(0);
      
      // Clear caches
      formatter.clearCaches();
      
      // Verify caches are empty
      expect(templateCache.size).toBe(0);
      expect(fieldNameCache.size).toBe(0);
    });
  });
  describe('Union Rule Formatting', () => {
  it('should format union rule messages with format descriptions', () => {
    // Set up global formats as the union rule would
    (global as any).lastUnionFormats = ['a valid email address', 'at least 8 characters'];
    
    const unionContext = {
      field: 'identifier',
      rule: 'union',
      value: 'invalid-value',
      parameters: [],
      data: { identifier: 'invalid-value' }
    };
    
    const template = 'The {field} must match one of these formats: {formats}';
    const result = formatter.format(template, unionContext);
    
    expect(result).toBe('The identifier must match one of these formats: a valid email address OR at least 8 characters');
    
    // Clean up
    delete (global as any).lastUnionFormats;
  });

  it('should handle union formatting with single format', () => {
    (global as any).lastUnionFormats = ['a valid UUID'];
    
    const unionContext = {
      field: 'id',
      rule: 'union',
      value: 'invalid-id',
      parameters: [],
      data: { id: 'invalid-id' }
    };
    
    const template = 'The {field} must be {formats}';
    const result = formatter.format(template, unionContext);
    
    expect(result).toBe('The id must be a valid UUID');
    
    delete (global as any).lastUnionFormats;
  });

  it('should handle union formatting with no formats available', () => {
    const unionContext = {
      field: 'value',
      rule: 'union',
      value: 'test',
      parameters: [],
      data: { value: 'test' }
    };
    
    const template = 'The {field} must match one of these formats: {formats}';
    const result = formatter.format(template, unionContext);
    
    expect(result).toBe('The value must match one of these formats: {formats}');
  });

  it('should format complex union descriptions correctly', () => {
    (global as any).lastUnionFormats = [
      'a valid email address',
      'at least 8 characters and contain uppercase letters',
      'a valid UUID format'
    ];
    
    const unionContext = {
      field: 'credential',
      rule: 'union',
      value: 'invalid',
      parameters: [],
      data: { credential: 'invalid' }
    };
    
    const template = 'The {field} field must be {formats}';
    const result = formatter.format(template, unionContext);
    
    expect(result).toBe('The credential field must be a valid email address OR at least 8 characters and contain uppercase letters OR a valid UUID format');
    
    delete (global as any).lastUnionFormats;
  });
});
});
