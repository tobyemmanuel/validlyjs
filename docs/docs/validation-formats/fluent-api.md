# Fluent API

The Fluent API provides a chainable, type-safe way to define validation rules with excellent IDE support and autocompletion.

## Overview

The Fluent API is the most powerful and developer-friendly way to define validation schemas in ValidlyJS. It provides:

* **Type Safety:** Full TypeScript support with compile-time type checking
* **IDE Support:** Excellent autocompletion and IntelliSense
* **Chainable Methods:** Intuitive method chaining for building complex rules
* **Performance:** Optimized for runtime performance

**Note:** The Fluent API is ideal for TypeScript projects and developers who prefer a programmatic, chainable interface for building validation schemas.

## Basic Usage

```javascript
import { Validator, string, number, boolean } from 'validlyjs';

const validator = new Validator({
  name: string().required().min(3).max(50),
  email: string().required().email(),
  age: number().required().min(18).max(120),
  isActive: boolean().required()
});

const result = await validator.validate({
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
  isActive: true
});
```

## Available Builders

### String Builder

```javascript
import { string } from 'validlyjs';

// Basic string validation
string().required().min(3).max(100)

// Email validation
string().required().email()

// URL validation
string().required().url()

// Pattern matching
string().required().regex('/^[A-Z][a-z]+$/')

// Character type validation
string().required().alpha()        // Only letters
string().required().alphaNum()     // Letters and numbers
string().required().alphaNumDash() // Letters, numbers, dashes, underscores

// Content validation
string().required().startsWith('prefix')
string().required().endsWith('suffix')
string().required().contains('substring')

// Value constraints
string().required().in(['option1', 'option2', 'option3'])
string().required().notIn(['banned1', 'banned2'])

// Format validation
string().required().uuid()
string().required().json()
```

### Number Builder

```javascript
import { number } from 'validlyjs';

// Basic number validation
number().required().min(0).max(100)

// Integer validation
number().required().integer()

// Positive/negative validation
number().required().positive()
number().required().negative()

// Multiple validation
number().required().multipleOf(5)

// Range validation
number().required().between(10, 50)

// Value constraints
number().required().in([1, 2, 3, 5, 8])
number().required().notIn([13, 666])
```

### Date Builder

```javascript
import { date } from 'validlyjs';

// Basic date validation
date().required().after(new Date('2023-01-01'))
date().required().before(new Date('2024-12-31'))

// Format validation
date().required().format('YYYY-MM-DD')
```

### Array Builder

```javascript
import { array, string, number } from 'validlyjs';

// Basic array validation
array().required().min(1).max(10)

// Array of specific type
array(string().required().email()).required().min(1)
array(number().required().positive()).required().max(5)

// Unique elements
array(string()).required().unique()

// Contains validation
array(string()).required().contains('required-item')
```

### Object Builder

```javascript
import { object, string, number } from 'validlyjs';

// Nested object validation
const userSchema = object({
  profile: object({
    firstName: string().required().min(2),
    lastName: string().required().min(2),
    age: number().required().min(18)
  }).required(),
  preferences: object({
    theme: string().required().in(['light', 'dark sm']).required(),
    notifications: boolean().required()
  }).optional()
}).required();
```

### File Builder

```javascript
import { file } from 'validlyjs';

// File validation
file().required()
  .maxSize(5 * 1024 * 1024) // 5MB
  .mimeTypes(['image/jpeg', 'image/png', 'image/gif'])
  .extensions(['jpg', 'jpeg', 'png', 'gif'])

// Image-specific validation
file().required()
  .image()
  .maxDimensions(1920, 1080)
  .minDimensions(100, 100)
```

## Conditional Validation

```javascript
import { Validator, string, number } from 'validlyjs';

const validator = new Validator({
  type: string().required().in(['individual', 'company']),
  
  // Required only if type is 'individual'
  firstName: string().requiredIf('type', 'individual').min(2),
  lastName: string().requiredIf('type', 'individual').min(2),
  
  // Required only if type is 'company'
  companyName: string().requiredIf('type', 'company').min(2),
  
  // Required with other fields
  password: string().required().min(8),
  passwordConfirmation: string().requiredWith('password').same('password')
});
```

## Union Types

```javascript
import { union, string, number } from 'validlyjs';

// Value can be either string or number
const validator = new Validator({
  value: union(
    add(string().min(3))
    .add(number().positive())
  ).required()
});

// More complex union
const validator2 = new Validator({
  contact: union(
    add(string().email())           // Email address
    .add(string().regex('/^\+\d+$/')),  // Phone number
    .add(string().url())              // Website URL
  ).required()
});
```

## Custom Rules

```javascript
import { string } from 'validlyjs';

// Using custom rules with fluent API
const validator = new Validator({
  username: string()
    .required()
    .min(3)
    .max(20)
    .custom('unique_username', async (value) => {
      const exists = await checkUsernameExists(value);
      return !exists;
    }, 'Username is already taken')
});
```

## Method Chaining Rules

When using the fluent API, the order of method calls generally doesn't matter, but there are some best practices:

```javascript
// Recommended order: type → required/optional → constraints → format
string()
  .required()        // 1. Required/optional first
  .min(3)           // 2. Size constraints
  .max(50)          // 3. More constraints
  .email()          // 4. Format validation last

// All of these are equivalent:
string().required().min(3).email()
string().email().required().min(3)
string().min(3).email().required()
```

**Tip:** Following a consistent order improves readability and maintainability.

## Performance Tips

### Optimization Strategies

* **Reuse Validators:** Create validator instances once and reuse them
* **Order Rules:** Put faster rules (like required) before slower ones (like async custom rules)
* **Use Specific Types:** Use the most specific builder type for better performance
* **Avoid Deep Nesting:** Very deep object nesting can impact performance
