# Custom Rules

Extend ValidlyJS with custom validation rules to handle specialized validation logic for your application.

## Overview

Custom rules allow you to define specialized validation logic that can be used across different validation formats (Fluent, String, and Array). You can register rules globally or at the instance level.

**Note:** Custom rules are ideal for encapsulating complex or application-specific validation requirements, such as API-based checks or custom patterns.

## Global Registration

Register custom rules globally using `Validator.extend` to make them available to all validator instances.

```javascript
// Register a custom rule globally (before instance creation)
// with the global rules
import { extend } from 'validlyjs';

extend('even', {
  validate: (value: any) => {
    return typeof value === 'number' && value % 2 === 0;
  },
  message: 'The :field must be an even number'
});

// or statically
import { Validator } from 'validlyjs';

Validator.extend('phone', {
  validate: (value, parameters, field, data) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(value);
  },
  message: 'The {field} field must be a valid phone number'
});

// Before the instance
const validator = new Validator(schema);

// Register with parameter support
Validator.extend('strongPassword', {
  validate: (value, parameters, field, data) => {
    const minLength = parameters[0] || 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    return value.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  },
  message: 'The {field} field must be at least {0} characters and contain uppercase, lowercase, number, and special character'
});

// Register async custom rule
Validator.extend('uniqueEmail', {
  async validate(value, parameters, field, data) {
    const response = await fetch(`/api/check-unique-email?email=${value}`);
    const result = await response.json();
    return result.isUnique;
  },
  message: 'The {field} has already been taken'
});
```

**Tip:** Use global registration for rules that will be reused across multiple validators.

## Instance-Level Registration

Register custom rules for a specific validator instance using the `extend` method.

```javascript
const validator = new Validator({
  username: "required|string|customUsername:3"
});

// Add custom rule to specific validator instance
validator.extend('customUsername', {
  validate: (value, parameters, field, data) => {
    const minLength = parameters[0] || 2;
    return value.length >= minLength && !/\s/.test(value) && /^[a-zA-Z0-9_]+$/.test(value);
  },
  message: 'The {field} must be at least {0} characters, contain no spaces, and only alphanumeric characters and underscores'
});

// you may need to refresh the instance whenever you register another custom rule globally
Validator.extend('custom_even', customRule);
validator.refresh(); // Clear caches to pick up new rule
```

**Note:** Instance-level custom rules are only available for that specific validator instance. Also, you may need to refresh the instance whenever you register another custom rule globally.

## Custom Rules in Different Formats

### String Format

```javascript
const validator = new Validator({
  phone: "required|phone",
  password: "required|strongPassword:12",
  email: "required|email|uniqueEmail",
  username: "required|customUsername:5"
});
```

### Array Format

```javascript
const validator = new Validator({
  phone: ["required", "phone"],
  password: ["required", "strongPassword:12"],
  email: ["required", "email", "uniqueEmail"],
  username: ["required", "customUsername:5"]
});
```

### Fluent Format

```javascript
const validator = new Validator({
  phone: string().required().custom('phone'),
  password: string().required().custom('strongPassword', [12]),
  email: string().required().email().custom('uniqueEmail'),
  username: string().required().custom('customUsername', [5])
});
```

## Advanced Custom Rules

### Rule with Multiple Parameters

```javascript
Validator.extend('between', {
  validate: (value, parameters, field, data) => {
    const min = parseFloat(parameters[0]);
    const max = parseFloat(parameters[1]);
    const numValue = parseFloat(value);
    return numValue >= min && numValue <= max;
  },
  message: 'The {field} must be between {0} and {1}'
});

// Usage
const validator = new Validator({
  score: "number|between:0,100",
  rating: ["number", "between:1,5"],
  percentage: number().custom('between', [0, 100])
});
```

### Rule with Field Dependencies

```javascript
Validator.extend('matchField', {
  validate: (value, parameters, field, data) => {
    const targetField = parameters[0];
    return value === data[targetField];
  },
  message: 'The {field} must match {0}'
});

// Usage
const validator = new Validator({
  password: "required|string|min:8",
  password_confirmation: "required|matchField:password"
});
```

### Rule with Complex Logic

```javascript
Validator.extend('conditionalRequired', {
  validate: (value, parameters, field, data) => {
    const conditionField = parameters[0];
    const conditionValue = parameters[1];
    
    // If condition is met, field is required
    if (data[conditionField] === conditionValue) {
      return value !== null && value !== undefined && value !== '';
    }
    
    // Otherwise, field is optional
    return true;
  },
  message: 'The {field} field is required when {0} is {1}'
});

// Usage
const validator = new Validator({
  country: "string",
  state: "conditionalRequired:country,USA"
});
```

## Custom Rules with Union Types

```javascript
Validator.extend('flexibleId', {
  validate: (value, parameters, field, data) => {
    // Accept either UUID or positive integer
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
    const isPositiveInt = Number.isInteger(Number(value)) && Number(value) > 0;
    return isUuid || isPositiveInt;
  },
  message: 'The {field} must be a valid UUID or positive integer'
});

// Usage in union
const validator = new Validator({
  id: union([
    string().uuid(),
    number().positive().integer(),
    string().custom('flexibleId')
  ])
});
```

**Tip:** Custom rules in union types allow for flexible validation of fields that can accept multiple data types or formats.
