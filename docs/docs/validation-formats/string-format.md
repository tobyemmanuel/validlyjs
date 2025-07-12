# String Format (Laravel-Style)

The string format provides a familiar Laravel-inspired syntax for defining validation rules using pipe-separated strings.

## Overview

The string format is perfect for developers familiar with Laravel's validation syntax. It offers:

* **Familiar Syntax:** Laravel-inspired pipe-separated rules
* **Compact:** Concise rule definitions
* **Easy Migration:** Simple to migrate from Laravel validation
* **Dynamic:** Rules can be built dynamically from strings

**Note:** The string format is ideal for quick setup and developers transitioning from Laravel or similar frameworks.

## Basic Syntax

```javascript
import { Validator } from 'validlyjs';

const validator = new Validator({
  name: 'required|string|min:3|max:50',
  email: 'required|string|email',
  age: 'required|number|min:18|max:120',
  isActive: 'required|boolean'
});

const result = await validator.validate({
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
  isActive: true
});
```

## Data Types

Specify the data type first, followed by type-specific rules:

```javascript
const validator = new Validator({
  // String validation
  username: 'required|string|min:3|max:20|alpha_num',
  email: 'required|string|email',
  
  // Number validation
  age: 'required|number|min:18|max:120',
  score: 'required|number|between:0,100',
  
  // Boolean validation
  isActive: 'required|boolean',
  
  // Date validation
  birthDate: 'required|date|before:today',
  
  // Array validation
  tags: 'required|array|min:1|max:5',
  
  // File validation
  avatar: 'required|file|image|max_size:2048'
});
```

## String Rules

```javascript
const validator = new Validator({
  // Length constraints
  name: 'required|string|min:2|max:50',
  code: 'required|string|length:6',
  
  // Format validation
  email: 'required|string|email',
  website: 'required|string|url',
  uuid: 'required|string|uuid',
  
  // Pattern matching
  phone: 'required|string|regex:/^\\+?[1-9]\\d{1,14}$/',
  
  // Character type validation
  username: 'required|string|alpha_num',
  slug: 'required|string|alpha_dash',
  title: 'required|string|alpha',
  
  // Content validation
  filename: 'required|string|starts_with:IMG_',
  extension: 'required|string|ends_with:.jpg',
  description: 'required|string|contains:important',
  
  // Value constraints
  status: 'required|string|in:active,inactive,pending',
  role: 'required|string|not_in:admin,super_admin'
});
```

## Number Rules

```javascript
const validator = new Validator({
  // Range validation
  age: 'required|number|min:18|max:65',
  score: 'required|number|between:0,100',
  
  // Type validation
  count: 'required|number|integer',
  rating: 'required|number|positive',
  debt: 'optional|number|negative',
  
  // Multiple validation
  quantity: 'required|number|multiple_of:5',
  
  // Value constraints
  priority: 'required|number|in:1,2,3,4,5',
  forbidden: 'required|number|not_in:13,666'
});
```

## Date Rules

```javascript
const validator = new Validator({
  // Relative dates
  startDate: 'required|date|after:today',
  endDate: 'required|date|before:2025-12-31',
  
  // Age validation
  birthDate: 'required|date|min_age:18|max_age:65',
  
  // Format validation
  dateString: 'required|date|format:YYYY-MM-DD',
  
  // Comparison with other fields
  endDate: 'required|date|after:startDate'
});
```

## Array Rules

```javascript
const validator = new Validator({
  // Size constraints
  tags: 'required|array|min:1|max:10',
  
  // Element validation (using dot notation)
  'emails.*': 'required|string|email',
  'scores.*': 'required|number|between:0,100',
  
  // Unique elements
  categories: 'required|array|unique',
  
  // Contains validation
  requiredTags: 'required|array|contains:important'
});
```

## File Rules

```javascript
const validator = new Validator({
  // Basic file validation
  document: 'required|file|max_size:5120', // 5MB in KB
  
  // Image validation
  avatar: 'required|file|image|max_size:2048|max_dimensions:1920,1080',
  
  // MIME type validation
  upload: 'required|file|mime_types:image/jpeg,image/png,application/pdf',
  
  // Extension validation
  attachment: 'required|file|extensions:jpg,png,pdf,doc,docx'
});
```

## Conditional Rules

```javascript
const validator = new Validator({
  type: 'required|string|in:individual,company',
  
  // Required conditionally
  firstName: 'required_if:type,individual|string|min:2',
  lastName: 'required_if:type,individual|string|min:2',
  companyName: 'required_if:type,company|string|min:2',
  
  // Required with other fields
  password: 'required|string|min:8',
  passwordConfirmation: 'required_with:password|string|same:password',
  
  // Required unless
  phone: 'required_unless:email,null|string',
  
  // Prohibited conditionally
  personalInfo: 'prohibited_if:type,company|string'
});
```

## Union Types

```javascript
const validator = new Validator({
  // Union type using special syntax
  value: 'required|union:string|min:3,number|positive',
  
  // More complex union
  contact: 'required|union:string|email,string|regex:/^\\+\\d+$/,string|url'
});
```

## Parameter Syntax

Rules with parameters use colon syntax:

```javascript
// Single parameter
'min:5'
'max:100'
'length:10'

// Multiple parameters (comma-separated)
'between:10,50'
'in:red,green,blue'
'max_dimensions:1920,1080'

// Complex parameters
'regex:/^[A-Z][a-z]+$/'
'format:YYYY-MM-DD HH:mm:ss'
```

## Escaping Special Characters

```javascript
// When parameters contain special characters, use quotes
const validator = new Validator({
  // Regex with pipes and colons
  pattern: 'required|string|regex:/^(option1|option2):value$/',
  
  // Values containing commas or colons
  description: 'required|string|contains:"Hello, World!"'
});
```

## Dynamic Rule Building

```javascript
// Build rules dynamically
function createUserValidator(isAdmin = false) {
  const rules = {
    name: 'required|string|min:2|max:50',
    email: 'required|string|email'
  };
  
  if (isAdmin) {
    rules.permissions = 'required|array|min:1';
    rules['permissions.*'] = 'required|string|in:read,write,delete';
  }
  
  return new Validator(rules);
}

// Use with configuration
const minAge = 18;
const maxAge = 65;
const validator = new Validator({
  age: `required|number|min:${minAge}|max:${maxAge}`
});
```

## Performance Considerations

### Optimization Strategies

* **Rule Parsing:** String rules are parsed once when the validator is created
* **Caching:** Parsed rules are cached for better performance
* **Order Matters:** Put faster rules before slower ones
* **Avoid Complex Regex:** Complex regex patterns can slow down validation
