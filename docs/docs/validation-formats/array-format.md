# Array Format

The array format provides a structured way to define validation rules using arrays of pipe-separated strings, combining the flexibility of arrays with the familiar Laravel-style syntax.

## Overview

The array format is ideal for scenarios where you need:

* **Dynamic Rules:** Generate rules programmatically
* **Multiple Rules per Field:** Apply multiple validation rules in a structured way
* **Consistency with String Format:** Use familiar Laravel-style syntax in an array structure
* **Programmatic Manipulation:** Easily modify rules in code

**Note:** The array format is particularly useful for dynamically generating validation schemas or when working with configuration-driven systems.

## Basic Syntax

```javascript
import { Validator } from 'validlyjs';

const validator = new Validator({
  name: ["required", "string", "min:3", "max:50"],
  email: ["required", "string", "email"],
  age: ["required", "number", "min:18", "max:120"],
  isActive: ["required", "boolean"]
});

const result = await validator.validate({
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
  isActive: true
});
```

## String Rules

```javascript
const validator = new Validator({
  username: ["required", "string", "min:3", "max:20", "alpha_num"],
  email: ["required", "string", "email"],
  website: ["required", "string", "url"],
  uuid: ["required", "string", "uuid"],
  phone: ["required", "string", "regex:/^\\+?[1-9]\\d{1,14}$/"],
  slug: ["required", "string", "alpha_dash"],
  title: ["required", "string", "alpha"],
  filename: ["required", "string", "starts_with:IMG_"],
  extension: ["required", "string", "ends_with:.jpg"],
  description: ["required", "string", "contains:important"],
  status: ["required", "string", "in:active,inactive,pending"],
  role: ["required", "string", "not_in:admin,super_admin"]
});
```

## Number Rules

```javascript
const validator = new Validator({
  age: ["required", "number", "min:18", "max:65"],
  score: ["required", "number", "between:0,100"],
  count: ["required", "number", "integer"],
  rating: ["required", "number", "positive"],
  debt: ["optional", "number", "negative"],
  quantity: ["required", "number", "multiple_of:5"],
  priority: ["required", "number", "in:1,2,3,4,5"],
  forbidden: ["required", "number", "not_in:13,666"]
});
```

## Date Rules

```javascript
const validator = new Validator({
  startDate: ["required", "date", "after:today"],
  endDate: ["required", "date", "before:2025-12-31"],
  birthDate: ["required", "date", "min_age:18", "max_age:65"],
  dateString: ["required", "date", "format:YYYY-MM-DD"],
  endDateComparison: ["required", "date", "after:startDate"]
});
```

## Array Rules

```javascript
const validator = new Validator({
  tags: ["required", "array", "min:1", "max:10"],
  emails: ["required", "array", "min:1", "max:5"],
  "emails.*": ["required", "string", "email"],
  scores: ["required", "array"],
  "scores.*": ["required", "number", "between:0,100"],
  categories: ["required", "array", "unique"],
  requiredTags: ["required", "array", "contains:important"]
});
```

## File Rules

```javascript
const validator = new Validator({
  document: ["required", "file", "max_size:5120"], // 5MB in KB
  avatar: ["required", "file", "image", "max_size:2048", "max_dimensions:1920,1080"],
  upload: ["required", "file", "mime_types:image/jpeg,image/png,application/pdf"],
  attachment: ["required", "file", "extensions:jpg,png,pdf,doc,docx"]
});
```

## Conditional Rules

```javascript
const validator = new Validator({
  type: ["required", "string", "in:individual,company"],
  firstName: ["required_if:type,individual", "string", "min:2"],
  lastName: ["required_if:type,individual", "string", "min:2"],
  companyName: ["required_if:type,company", "string", "min:2"],
  password: ["required", "string", "min:8"],
  passwordConfirmation: ["required_with:password", "string", "same:password"],
  phone: ["required_unless:email,null", "string"],
  personalInfo: ["prohibited_if:type,company", "string"]
});
```

## Union Types

```javascript
const validator = new Validator({
  value: ["required", "union:string|min:3,number|positive"],
  contact: ["required", "union:string|email,string|regex:/^\\+\\d+$/,string|url"]
});
```

## Custom Rules

```javascript
Validator.extend('customUsername', {
  validate: (value, parameters, field, data) => {
    const minLength = parameters[0] || 2;
    return value.length >= minLength && !/\s/.test(value) && /^[a-zA-Z0-9_]+$/.test(value);
  },
  message: 'The {field} must be at least {0} characters, contain no spaces, and only alphanumeric characters and underscores'
});

const validator = new Validator({
  username: ["required", "string", "customUsername:5"]
});
```

**Tip:** Custom rules in the array format use the same syntax as the string format, making it easy to extend validation logic.

## Dynamic Rule Building

```javascript
function createUserValidator(isAdmin = false) {
  const rules = {
    name: ["required", "string", "min:2", "max:50"],
    email: ["required", "string", "email"]
  };
  
  if (isAdmin) {
    rules.permissions = ["required", "array", "min:1"];
    rules["permissions.*"] = ["required", "string", "in:read,write,delete"];
  }
  
  return new Validator(rules);
}

// Use with configuration
const minAge = 18;
const maxAge = 65;
const validator = new Validator({
  age: ["required", "number", `min:${minAge}`, `max:${maxAge}`]
});
```

## Performance Considerations

### Optimization Strategies

* **Rule Order:** Place faster rules (e.g., "required") before slower ones (e.g., "regex")
* **Early Exit:** Validation stops at the first failed rule
* **Rule Parsing:** Rules are parsed once when the validator is created
* **Caching:** Parsed rules are cached for better performance

## When to Use Array Format

| Use Array Format When | Use Other Formats When |
| --- | --- |
| Building rules dynamically | Rules are static and simple |
| Programmatic rule generation | Hand-written validation schemas |
| Working with arrays of rules | Single string rules are sufficient |
| Need structured rule application | Fluent API's type safety is preferred |
