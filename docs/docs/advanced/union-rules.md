# Union Rules

Validate values against multiple rule sets with union types, allowing flexible validation where a value can match any of several different validation patterns.

## Overview

Union rules allow you to validate a value against multiple different rule sets, where the validation passes if the value matches **any one** of the rule sets. This is particularly useful for fields that can accept different types of data or formats.

### Key Concepts

* **Multiple Rule Sets:** Define several different validation patterns
* **First Match Wins:** Validation passes as soon as one rule set matches
* **Flexible Types:** Accept different data types for the same field
* **Performance Optimized:** Supports parallel validation and early termination

## Basic Union Validation

Create union rules using different validation formats:

### String Format

```javascript
import { Validator } from 'validlyjs_2';

const validator = new Validator({
  // Accept either email or phone number
  contact: 'union:(string|email;string|regex:^\\+[1-9][0-9]{1,14}$)',
  
  // Accept either positive number or string with minimum length
  value: 'union:(number|positive;string|min:3)',
  
  // Accept boolean, number between 1-10, or specific strings
  mixed: 'union:(boolean;number|between:1,10;string|in:yes,no,maybe)'
});

const result = await validator.validate({
  contact: 'user@example.com', // matches email rule
  value: 42,                   // matches positive number rule
  mixed: true                  // matches boolean rule
});

console.log(result.isValid); // true
```

### Fluent API

```javascript
import { Validator, union, string, number, boolean } from 'validlyjs_2';

const validator = new Validator({
  // ID can be UUID string, positive integer, or custom format
  id: union()
    .add(string().uuid())
    .add(number().integer().positive())
    .add(string().regex(/^ID[0-9]+$/)),
  
  // File can be URL string or actual file
  file: union()
    .add(string().url())
    .add(file().extensions(['pdf', 'doc', 'docx'])),
  
  // Status can be boolean or specific strings
  status: union()
    .add(boolean())
    .add(string().in(['active', 'inactive', 'pending']))
});

const result = await validator.validate({
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // UUID
  file: 'https://example.com/document.pdf',     // URL
  status: 'active'                              // String
});
```

### Array Format

```javascript
const validator = new Validator({
  identifier: [
    [
      ['string', 'email'],
      ['string', 'min:8', 'max:20'],
      ['number', 'integer', 'positive']
    ]
  ]
});
```

## Complex Union Scenarios

Handle sophisticated validation patterns with nested rules and complex combinations:

### User Identification

```javascript
// Accept username, email, or phone number for login
const loginValidator = new Validator({
  identifier: 'union:(string|min:3|max:20|regex:^[a-zA-Z0-9_]+$;string|email;string|regex:^\\+[1-9][0-9]{1,14}$)'
  // username or email or phone
  //within a union using the string format, the semicolon breaks the ruleset
});

// Valid inputs:
await loginValidator.validate({ identifier: 'john_doe123' });    // username
await loginValidator.validate({ identifier: 'john@example.com' }); // email
await loginValidator.validate({ identifier: '+1234567890' });     // phone
```

### Flexible Data Input

```javascript
// Accept different data formats for API endpoints
const apiValidator = new Validator({
  // Accept JSON string, object, or array
  data: 'union:(string|json;object;array)',
  
  // Accept timestamp as number, ISO string, or Date object
  timestamp: 'union:(number|min:0;string|date_format:ISO8601;date)',
  
  // Accept coordinates as string, array, or object
  location: 'union:(' +
    'string|regex:^-?\\d+\\.\\d+,-?\\d+\\.\\d+$;' +  // "lat,lng"
    'array|size:2|each:numeric;' +                    // [lat, lng]
    'object|shape:{lat:numeric,lng:numeric}' +        // {lat, lng}
  ')'
});

// Valid inputs:
await apiValidator.validate({
  data: '{"name": "John"}',           // JSON string
  timestamp: 1640995200000,           // Unix timestamp
  location: '40.7128,-74.0060'        // String coordinates
});

await apiValidator.validate({
  data: { name: 'John' },             // Object
  timestamp: '2022-01-01T00:00:00Z',  // ISO string
  location: [40.7128, -74.0060]       // Array coordinates
});
```

### File Upload Validation

```javascript
// Accept file as URL, base64 string, or file object
const fileValidator = new Validator({
  document: 'union:(' +
    'string|url|regex:\\.pdf$;' +                    // PDF URL
    'string|regex:^data:application/pdf;base64,;' +  // Base64 PDF
    'file|extensions:pdf|max_size:5MB' +             // File object
  ')',
  
  image: 'union:(' +
    'string|url|regex:\\.(jpg|jpeg|png|gif)$;' +     // Image URL
    'string|regex:^data:image/;' +                   // Base64 image
    'file|image|max_size:2MB' +                      // Image file
  ')'
});
```

## Conditional Union Rules

Combine union rules with conditional validation for dynamic behavior:

### Dynamic Validation Based on Type

```javascript
const dynamicValidator = new Validator({
  type: 'required|string|in:user,admin,guest',
  
  // Different validation based on user type
  identifier: 'required_if:type,user|union:(' +
    'string|email;' +           // Email for users
    'string|min:8|max:20' +     // Username for users
  ')',
  
  permissions: 'required_if:type,admin|union:(' +
    'array|each:string;' +      // Array of permission strings
    'string|in:all,read,write' + // Single permission level
  ')',
  
  // Guest users need different validation
  session: 'required_if:type,guest|union:(' +
    'string|uuid;' +            // Session UUID
    'string|min:32|max:64' +    // Session token
  ')'
});

// User with email
await dynamicValidator.validate({
  type: 'user',
  identifier: 'john@example.com'
});

// Admin with permissions array
await dynamicValidator.validate({
  type: 'admin',
  identifier: 'admin_user',
  permissions: ['read', 'write', 'delete']
});

// Guest with session token
await dynamicValidator.validate({
  type: 'guest',
  session: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
});
```

## Performance Options

Optimize union validation performance with various configuration options:

### Stop on First Pass

This is enabled by default and cannot be disabled (except in fluent api). It passes the field if the first ruleset is valid.

```javascript

// Using fluent API
const fluentValidator = new Validator({
  value: union()
    .add(string().email())
    .add(number().positive())
    .add(boolean())
    .stopOnFirstPass(true)
});
```

### Parallel Validation

```javascript
// Validate all rule sets in parallel for better performance
const validator = new Validator({
  data: 'union:(string|json;object|shape:{id:integer};array|min:1)'
}, {
  performance: {
    parallelValidation: true
  }
});

```

### Custom Union Error Messages

```javascript
const validator = new Validator({
  contact: 'union:(string|email;string|regex:^\\+[1-9][0-9]{1,14}$)'
}, {
  messages: {
    'union': 'The {field} must be either a valid email address or phone number.',
    'union.email_or_phone': 'Please provide a valid email or phone number for {field}.'
  },
  fieldMessages: {
    contact: {
      'union': 'Contact information must be an email or phone number.'
    }
  }
});
```

## Advanced Patterns

Sophisticated union validation patterns for complex use cases:

### Nested Union Rules

```javascript
// Union rules within object validation
const validator = new Validator({
  user: 'object|shape:{' +
    'id:union:(string|uuid;number|integer|positive),' +
    'contact:union:(string|email;string|regex:^\\+[1-9][0-9]{1,14}$),' +
    'profile:object|shape:{' +
      'avatar:union:(string|url;file|image),' +
      'bio:union:(string|max:500;null)' +
    '}' +
  '}'
});

await validator.validate({
  user: {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    contact: 'john@example.com',
    profile: {
      avatar: 'https://example.com/avatar.jpg',
      bio: 'Software developer and tech enthusiast.'
    }
  }
});
```

### Array with Union Elements

```javascript
// Array where each element can match different rule sets
const validator = new Validator({
  // Mixed array of different data types
  items: 'array|each:union:(string|min:1;number|positive;boolean;object|shape:{type:string,value:any})',
  
  // Array of different ID formats
  ids: 'array|each:union:(string|uuid;number|integer|positive;string|regex:^[A-Z]{2}[0-9]{6}$)',
  
  // Array of contact methods
  contacts: 'array|each:union:(string|email;string|regex:^\\+[1-9][0-9]{1,14}$;object|shape:{type:string,value:string})'
});

await validator.validate({
  items: [
    'hello',                    // string
    42,                        // number
    true,                      // boolean
    { type: 'custom', value: 'data' } // object
  ],
  ids: [
    'f47ac10b-58cc-4372-a567-0e02b2c3d479', // UUID
    12345,                                   // number
    'AB123456'                              // custom format
  ],
  contacts: [
    'john@example.com',                     // email
    '+1234567890',                         // phone
    { type: 'skype', value: 'john.doe' }   // custom contact
  ]
});
```

## Best Practices

### Union Validation Best Practices

* **Order Matters:** Place more specific rules before general ones
* **Performance:** Use `stopOnFirstPass` for better performance when order doesn't matter
* **Error Messages:** Provide clear, user-friendly error messages for union failures
* **Type Safety:** Use TypeScript interfaces to ensure type safety with union rules
* **Testing:** Test all possible union paths to ensure comprehensive coverage
* **Documentation:** Document expected union types clearly for API consumers
* **Complexity:** Avoid overly complex union rules that are hard to understand
* **Validation Strategy:** Choose the right union strategy based on your use case

### TypeScript Integration

```typescript
// Define union types for better type safety
type UserId = string | number;
type ContactMethod = string; // email or phone
type FileInput = string | File; // URL or file object

interface UserData {
  id: UserId;
  contact: ContactMethod;
  avatar?: FileInput;
}

// Create validator with proper typing
const typedValidator = new Validator({
  id: 'union:(string|uuid;number|integer|positive)',
  contact: 'union:(string|email;string|regex:^\\+[1-9][0-9]{1,14}$)',
  avatar: 'optional|union:(string|url;file|image)'
});

// Type-safe validation
const userData: UserData = {
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  contact: 'john@example.com'
};

const result = await typedValidator.validate(userData);
```
