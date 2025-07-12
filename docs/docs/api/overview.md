# API Reference Overview

Complete reference for all ValidlyJS classes, methods, interfaces, and types.

## Overview

This reference covers all public APIs available in ValidlyJS, including the main Validator class, fluent builders, utility functions, and TypeScript interfaces.

## Validator Class

The main validation class that handles schema-based validation.

**Note:** The Validator class is the core of ValidlyJS, providing methods for synchronous and asynchronous validation, custom rule extension, and configuration.

### Constructor

```typescript
constructor(schema: ValidationSchema, options?: ValidatorOptions)
```

Creates a new validator instance with the specified schema and options.

#### Parameters

* `schema` - Validation schema defining rules for each field
* `options` - Optional configuration options

```javascript
import { Validator } from 'validlyjs';

const validator = new Validator({
  name: 'required|string|min:2',
  email: 'required|email',
  age: 'required|integer|min:18'
}, {
  responseType: 'laravel',
  language: 'en',
  stopOnFirstError: false
});
```

### validate(data)

```typescript
async validate(data: Record): Promise
```

Validates data asynchronously against the schema. Supports both sync and async rules.

#### Parameters

* `data` - Object containing data to validate

#### Returns

`Promise` - Validation result with errors and validity status

```javascript
const result = await validator.validate({
  name: 'John Doe',
  email: 'john@example.com',
  age: 25
});

console.log(result.isValid); // true
console.log(result.errors);  // {}
console.log(result.data);    // Original data
```

### validateSync(data)

```typescript
validateSync(data: Record): ValidationResult
```

Validates data synchronously. Only executes synchronous rules.

#### Parameters

* `data` - Object containing data to validate

#### Returns

`ValidationResult` - Validation result (sync only)

```javascript
const result = validator.validateSync({
  name: 'John',
  email: 'invalid-email',
  age: 17
});

console.log(result.isValid); // false
console.log(result.errors);  // { email: [...], age: [...] }
```

### extend(name, rule)

```typescript
extend(name: string, rule: CustomRuleDefinition): void
```

Adds a custom validation rule to this validator instance.

#### Parameters

* `name` - Name of the custom rule
* `rule` - Rule definition object

```javascript
validator.extend('strongPassword', {
  validate: (value) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
  },
  message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character.'
});
```

### setLanguage(language)

```typescript
setLanguage(language: string): void
```

Changes the language for error messages.

#### Parameters

* `language` - Language code (e.g., 'en', 'es', 'fr')

```javascript
validator.setLanguage('es'); // Switch to Spanish
```

### setMessages(messages)

```typescript
setMessages(messages: Record): void
```

Sets custom error messages for validation rules.

#### Parameters

* `messages` - Object mapping rule names to custom messages

```javascript
validator.setMessages({
  'required': 'This field is mandatory.',
  'email': 'Please provide a valid email address.'
});
```

### refresh()

```typescript
refresh(): void
```

Clears internal caches and recompiles rules. Useful after adding custom rules.

```javascript
validator.extend('customRule', ruleDefinition);
validator.refresh(); // Clear caches to use new rule
```

## Static Methods

Global methods available on the Validator class.

### Validator.extend(name, rule)

```typescript
static extend(name: string, rule: CustomRuleDefinition): void
```

Registers a custom rule globally for all validator instances.

```javascript
Validator.extend('phoneNumber', {
  validate: (value) => /^\+?[\d\s\-\(\)]+$/.test(value),
  message: 'Please provide a valid phone number.'
});
```

### Validator.configure(config)

```typescript
static configure(config: Partial): void
```

Sets global configuration that applies to all new validator instances.

```javascript
Validator.configure({
  responseType: 'flat',
  language: 'en',
  stopOnFirstError: true
});
```

### Validator.usePreset(preset)

```typescript
static usePreset(preset: string): void
```

Applies a predefined configuration preset globally.

```javascript
Validator.usePreset('laravel'); // Use Laravel-style configuration
```

### Validator.createPreset(name, config)

```typescript
static createPreset(name: string, config: Partial): void
```

Creates a new configuration preset for reuse.

```javascript
Validator.createPreset('myApi', {
  responseType: 'flat',
  stopOnFirstError: true,
  performance: { cacheRules: true }
});
```

## Fluent Builders

Type-specific fluent API builders for creating validation rules.

**Tip:** Fluent builders provide a chainable API for defining validation rules, making it easy to create complex schemas with type safety.

### string()

```typescript
function string(): StringFluentRule
```

Creates a string validation rule builder.

```javascript
import { string } from 'validlyjs';

const nameRule = string().required().min(2).max(50);
const emailRule = string().required().email();
const urlRule = string().optional().url();
```

#### Available Methods

* `min(length)` - Minimum string length
* `max(length)` - Maximum string length
* `length(length)` - Exact string length
* `email()` - Valid email format
* `url()` - Valid URL format
* `regex(pattern)` - Custom regex pattern
* `alpha()` - Alphabetic characters only
* `alphaNum()` - Alphanumeric characters only
* `uuid()` - Valid UUID format
* `json()` - Valid JSON string
* `in(values)` - Value must be in array
* `notIn(values)` - Value must not be in array

### number()

```typescript
function number(): NumberFluentRule
```

Creates a number validation rule builder.

```javascript
import { number } from 'validlyjs';

const ageRule = number().required().min(18).max(120);
const priceRule = number().required().positive().decimal(2);
const scoreRule = number().required().between(0, 100);
```

#### Available Methods

* `min(value)` - Minimum numeric value
* `max(value)` - Maximum numeric value
* `between(min, max)` - Value between range
* `positive()` - Positive numbers only
* `negative()` - Negative numbers only
* `integer()` - Integer numbers only
* `decimal(places)` - Decimal with specific places
* `multipleOf(value)` - Multiple of specified value

### boolean()

```typescript
function boolean(): BooleanFluentRule
```

Creates a boolean validation rule builder.

```javascript
import { boolean } from 'validlyjs';

const activeRule = boolean().required();
const acceptedRule = boolean().required().true();
const disabledRule = boolean().optional().false();
```

#### Available Methods

* `true()` & `accepted` - Must be true
* `false()` - Must be false

### date()

```typescript
function date(): DateFluentRule
```

Creates a date validation rule builder.

```javascript
import { date } from 'validlyjs';

const birthdateRule = date().required().before(new Date());
const appointmentRule = date().required().after('2024-01-01');
const eventRule = date().required().format('YYYY-MM-DD');
```

#### Available Methods

* `after(date)` - After specified date
* `before(date)` - Before specified date
* `afterOrEqual(date)` - After or equal to date
* `beforeOrEqual(date)` - Before or equal to date
* `format(format)` - Specific date format
* `timezone(timezone)` - Specific timezone
* `weekday()` - Weekday only
* `weekend()` - Weekend only

### file()

```typescript
function file(): FileFluentRule
```

Creates a file validation rule builder.

```javascript
import { file } from 'validlyjs';

const avatarRule = file().required().image().size().max('2MB');
const documentRule = file().required().mimeTypes(['application/pdf']);
const photoRule = file().required().image().dimensions().minWidth(800);
```

#### Available Methods

* `mimeTypes(types)` - Allowed MIME types
* `extensions(extensions)` - Allowed file extensions
* `size()` - File size validation
* `image()` - Image file validation
* `dimensions()` - Image dimensions validation

### array()

```typescript
function array(): ArrayFluentRule
```

Creates an array validation rule builder.

```javascript
import { array, string } from 'validlyjs';

const tagsRule = array().required().min(1).each(string().min(2));
const numbersRule = array().required().unique();
const itemsRule = array().required().contains('required-item');
```

#### Available Methods

* `min(length)` - Minimum array length
* `max(length)` - Maximum array length
* `length(length)` - Exact array length
* `each(rule)` - Validate each element
* `unique()` - All elements must be unique
* `contains(value)` - Must contain specific value

### object()

```typescript
function object(): ObjectFluentRule
```

Creates an object validation rule builder.

```javascript
import { object, string, number } from 'validlyjs';

const userRule = object().required().shape({
  name: string().required(),
  age: number().required().min(18)
});

const configRule = object().required().keys(['host', 'port']).strict();
```

#### Available Methods

* `shape(schema)` - Define object schema
* `keys(keys)` - Required object keys
* `strict()` - No additional properties allowed

## Conditional Validation

ValidlyJS provides comprehensive conditional validation rules that make fields required or prohibited based on the values of other fields.

**Note:** Conditional validation is essential for dynamic forms where field requirements change based on user input.

### required()

Makes a field required.

```typescript
required()): this
```

### requiredIf(field, value)

Makes a field required when another field has a specific value.

```typescript
requiredIf(field: string, value: any | ((value: any) => boolean)): this
```

### requiredUnless(field, value)

Makes a field required unless another field has a specific value.

```typescript
requiredUnless(field: string, value: any | ((value: any) => boolean)): this
```

### requiredWith(field, ...fields)

Makes a field required when another field or fields have values.

```typescript
requiredWith(field: string, ...fields: string[]): this
```

### requiredWithout(field, ...fields)

Makes a field required when another field or fields do not have values.

```typescript
requiredWithout(field: string, ...fields: string[]): this
```

### requiredWithAll(field, ...fields)

Makes a field required when all specified fields have values.

```typescript
requiredWithAll(field: string, ...fields: string[]): this
```

### requiredWithoutAll(field, ...fields)

Makes a field required when none of the specified fields have values.

```typescript
requiredWithoutAll(field: string, ...fields: string[]): this
```

### prohibited()

Makes a field prohibited (must not be present or must be null/empty).

```typescript
  prohibited(): this
```

### prohibitedIf(field, value)

Makes a field prohibited when another field has a specific value.

```typescript
  prohibitedIf(field: string, value: any): this
```

### prohibitedUnless(field, value)

Makes a field prohibited unless another field has a specific value.

```typescript
  prohibitedUnless(field: string, value: any): this
```

## TypeScript Interfaces

Type definitions for TypeScript users.

**Tip:** Use these interfaces to ensure type safety when working with ValidlyJS in TypeScript projects.

### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: LaravelResponse | FlatResponse | GroupedResponse | NestedResponse;
  data: Record;
  debug?: {
    performance?: ValidationPerformanceReport;
    ruleExecutionTimes?: Record;
    fieldDependencies?: FieldDependency[];
    cacheHitRate?: number;
  };
}
```

### ValidatorOptions

```typescript
interface ValidatorOptions {
  responseType?: ResponseType;
  language?: string;
  messages?: Record;
  fieldMessages?: Record;
  stopOnFirstError?: boolean;
  coercion?: CoercionOptions;
  performance?: PerformanceOptions;
  debug?: boolean;
}
```

### CoercionOptions

```typescript
interface CoercionOptions {
  enabled?: boolean;
  strings?: boolean;
  numbers?: boolean;
  booleans?: boolean;
  dates?: boolean;
}
```

### PerformanceOptions

```typescript
interface PerformanceOptions {
  cacheRules?: boolean;
  optimizeUnions?: boolean;
  parallelValidation?: boolean;
  compileRules?: boolean;
}
```

### CustomRuleDefinition

```typescript
interface CustomRuleDefinition {
  validate: (value: any, parameters: any[], field: string, data: Record) => boolean | Promise;
  message?: string;
  priority?: number;
  async?: boolean;
}
```

### ValidationSchema

```typescript
type ValidationSchema = Record;

type RuleDefinition = 
  | string 
  | string[] 
  | FluentRule 
  | UnionRule 
  | Array<{ rule: string; parameters?: any[] }>;
```

## Response Types

Different error response formats available.

**Note:** Choose a response type that best fits your application’s error handling needs.

### Laravel Response

```typescript
interface LaravelResponse {
  [field: string]: string[];
}

// Example:
{
  "name": ["The name field is required."],
  "email": ["The email must be a valid email address."]
}
```

### Flat Response

```typescript
interface FlatResponse {
  [field: string]: string;
}

// Example:
{
  "name": "The name field is required.",
  "email": "The email must be a valid email address."
}
```

### Grouped Response

```typescript
interface GroupedResponse {
  [group: string]: {
    [field: string]: string[];
  };
}

// Example:
{
  "user": {
    "name": ["The name field is required."]
  },
  "profile": {
    "bio": ["The bio field is required."]
  }
}
```

### Nested Response

```typescript
interface NestedResponse {
  [field: string]: {
    [rule: string]: string;
  } | NestedResponse;
}

// Example:
{
  "name": {
    "required": "The name field is required."
  },
  "email": {
    "email": "The email must be a valid email address."
  }
}
```

## Utility Functions

Helper functions for common validation tasks.

### validateConfig(config)

```typescript
function validateConfig(config: any): ValidationResult
```

Validates a ValidlyJS configuration object.

```javascript
import { validateConfig } from 'validlyjs';

const config = {
  responseType: 'laravel',
  language: 'en',
  performance: { cacheRules: true }
};

const result = validateConfig(config);
if (!result.isValid) {
  console.error('Invalid config:', result.errors);
}
```

### union(...rules)

```typescript
function union(...rules: RuleDefinition[]): UnionRule
```

Creates a union rule that validates against multiple rule sets.

```javascript
import { union, string, number } from 'validlyjs';

const idRule = union(
  string().uuid(),
  number().integer().positive()
);
```

### createValidator(schema, options)

```typescript
function createValidator(schema: ValidationSchema, options?: ValidatorOptions): Validator
```

Factory function to create a validator instance.

```javascript
import { createValidator } from 'validlyjs';

const validator = createValidator({
  name: 'required|string',
  email: 'required|email'
}, {
  responseType: 'flat'
});
```

## Error Handling

Error types and handling mechanisms.

**Tip:** Use try-catch blocks for system errors and check `result.isValid` for validation errors.

### ValidationError

```typescript
interface ValidationError {
  field: string;
  rule: string;
  message: string;
  value: any;
  parameters: any[];
}
```

### Error Handling Example

```javascript
try {
  const result = await validator.validate(data);
  
  if (!result.isValid) {
    // Handle validation errors
    console.log('Validation failed:', result.errors);
  }
} catch (error) {
  // Handle system errors (invalid schema, etc.)
  console.error('Validation system error:', error.message);
}
```

## Migration Guide

Guide for migrating from other validation libraries.

**Note:** ValidlyJS provides a Laravel-inspired syntax and fluent API, making migration from other libraries straightforward.

### From Joi

```javascript
// Joi
const schema = Joi.object({
  name: Joi.string().required().min(2),
  email: Joi.string().email().required()
});

// ValidlyJS
import { object, string } from 'validlyjs';

const schema = object().shape({
  name: string().required().min(2),
  email: string().required().email()
});
```

### From Yup

```javascript
// Yup
const schema = yup.object({
  name: yup.string().required().min(2),
  age: yup.number().required().min(18)
});

// ValidlyJS
import { object, string, number } from 'validlyjs';

const schema = object().shape({
  name: string().required().min(2),
  age: number().required().min(18)
});
```

### Similar to Laravel Validation

```php
// Laravel
$rules = [
    'name' => 'required|string|min:2',
    'email' => 'required|email|unique:users'
];

// ValidlyJS
const rules = {
  name: 'required|string|min:2',
  email: 'required|email|unique:users'
};
```
