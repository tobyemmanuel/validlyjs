# String Validation

Comprehensive string validation with length constraints, format validation, pattern matching, and content validation.

## Basic String Validation

ValidlyJS provides extensive string validation capabilities with support for length constraints, format validation, and pattern matching.

### Fluent API

```javascript
import { Validator, string } from 'validlyjs';

const validator = new Validator({
  name: string().required().min(2).max(50),
  email: string().required().email(),
  username: string().required().alphaNum().min(3).max(20)
});

const result = await validator.validate({
  name: 'John Doe',
  email: 'john@example.com',
  username: 'johndoe123'
});
```

### String Format

```javascript
const validator = new Validator({
  name: 'required|string|min:2|max:50',
  email: 'required|string|email',
  username: 'required|string|alpha_num|min:3|max:20'
});
```

### Array Format

```javascript
const validator = new Validator({
  name: ['required', 'string', 'min:2', 'max:50'],
  email: ['required', 'string', 'email'],
  username: ['required', 'string', 'alpha_num', 'min:3', 'max:20']
});
```

## Available String Rules

### min(length)

Validates that the string has at least the specified number of characters.

```javascript
string().min(3)
// String: 'string|min:3'
```

### max(length)

Validates that the string has at most the specified number of characters.

```javascript
string().max(100)
// String: 'string|max:100'
```

### length(length)

Validates that the string has exactly the specified number of characters.

```javascript
string().length(10)
// String: 'string|length:10'
```

### email()

Validates that the string is a valid email address.

```javascript
string().email()
// String: 'string|email'
```

### url()

Validates that the string is a valid URL.

```javascript
string().url()
// String: 'string|url'
```

### regex(pattern)

Validates that the string matches the specified regular expression pattern.

```javascript
string().regex('/^[A-Z][a-z]+$/')
// String: 'string|regex:/^[A-Z][a-z]+$/'
```

### alpha()

Validates that the string contains only alphabetic characters.

```javascript
string().alpha()
// String: 'string|alpha'
```

### alphaNum()

Validates that the string contains only alphanumeric characters.

```javascript
string().alphaNum()
// String: 'string|alpha_num'
```

### alphaNumDash()

Validates that the string contains only alphanumeric characters, dashes, and underscores.

```javascript
string().alphaNumDash()
// String: 'string|alpha_dash'
```

### uuid()

Validates that the string is a valid UUID.

```javascript
string().uuid()
// String: 'string|uuid'
```

### json()

Validates that the string is valid JSON.

```javascript
string().json()
// String: 'string|json'
```

### startsWith(prefix)

Validates that the string starts with the specified prefix.

```javascript
string().startsWith('IMG_')
// String: 'string|starts_with:IMG_'
```

### endsWith(suffix)

Validates that the string ends with the specified suffix.

```javascript
string().endsWith('.jpg')
// String: 'string|ends_with:.jpg'
```

### contains(substring)

Validates that the string contains the specified substring.

```javascript
string().contains('admin')
// String: 'string|contains:admin'
```

### in(values)

Validates that the string is one of the specified values.

```javascript
string().in(['red', 'green', 'blue'])
// String: 'string|in:red,green,blue'
```

### notIn(values)

Validates that the string is not one of the specified values.

```javascript
string().notIn(['admin', 'root'])
// String: 'string|not_in:admin,root'
```

## Common Use Cases

### User Registration Form

```javascript
const userValidator = new Validator({
  firstName: string().required().min(2).max(50).alpha(),
  lastName: string().required().min(2).max(50).alpha(),
  username: string().required().min(3).max(20).alphaNumDash(),
  email: string().required().email(),
  password: string().required().min(8).regex('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/'),
  bio: string().optional().max(500)
});

// Valid user data
await userValidator.validate({
  firstName: 'John',
  lastName: 'Doe',
  username: 'john_doe123',
  email: 'john@example.com',
  password: 'SecurePass123',
  bio: 'Software developer from New York'
}); // ✓

// Invalid user data
await userValidator.validate({
  firstName: 'J',           // ✗ Too short
  lastName: 'Doe123',       // ✗ Contains numbers
  username: 'jo',           // ✗ Too short
  email: 'invalid-email',   // ✗ Invalid email format
  password: 'weak',         // ✗ Doesn't meet complexity requirements
});
```

### Product Information

```javascript
const productValidator = new Validator({
  name: string().required().min(3).max(100),
  sku: string().required().regex('/^[A-Z]{2,3}-\d{4,6}$/'),
  category: string().required().in(['electronics', 'clothing', 'books', 'home']),
  description: string().optional().max(1000),
  tags: string().optional().regex('/^[a-z,\s]+$/'),
  imageUrl: string().optional().url().endsWith('.jpg', '.png', '.webp')
});

// Valid product
await productValidator.validate({
  name: 'Wireless Headphones',
  sku: 'ELC-123456',
  category: 'electronics',
  description: 'High-quality wireless headphones with noise cancellation',
  tags: 'audio, wireless, bluetooth',
  imageUrl: 'https://example.com/headphones.jpg'
}); // ✓
```

### File Upload Validation

```javascript
const fileValidator = new Validator({
  filename: string().required().min(1).max(255),
  extension: string().required().in(['.jpg', '.png', '.gif', '.pdf', '.doc']),
  mimeType: string().required().regex('/^(image|application)\//'),
  uploadPath: string().required().startsWith('/uploads/'),
  originalName: string().required().regex('/^[a-zA-Z0-9._-]+$/')
});

// Valid file data
await fileValidator.validate({
  filename: 'document_2024.pdf',
  extension: '.pdf',
  mimeType: 'application/pdf',
  uploadPath: '/uploads/documents/',
  originalName: 'my-document.pdf'
}); // ✓
```

### API Configuration

```javascript
const configValidator = new Validator({
  apiKey: string().required().length(32).alphaNum(),
  environment: string().required().in(['development', 'staging', 'production']),
  baseUrl: string().required().url(),
  version: string().required().regex('/^v\d+\.\d+\.\d+$/'),
  secretKey: string().required().min(16).regex('/^[A-Za-z0-9+/=]+$/'),
  configJson: string().optional().json()
});

// Valid configuration
await configValidator.validate({
  apiKey: 'abc123def456ghi789jkl012mno345pq',
  environment: 'production',
  baseUrl: 'https://api.example.com',
  version: 'v1.2.3',
  secretKey: 'dGVzdFNlY3JldEtleUZvckFQSQ==',
  configJson: '{"timeout": 5000, "retries": 3}'
}); // ✓
```

## Advanced Pattern Matching

Use regular expressions for complex validation patterns:

### Phone Numbers

```javascript
// US phone number
string().regex('/^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/')

// International format
string().regex('/^\+[1-9]\d{1,14}$/')

// Examples that match:
// +1-555-123-4567
// (555) 123-4567
// 555.123.4567
```

### Credit Card Numbers

```javascript
// Visa
string().regex('/^4[0-9]{12}(?:[0-9]{3})?$/')

// MasterCard
string().regex('/^5[1-5][0-9]{14}$/')

// American Express
string().regex('/^3[47][0-9]{13}$/')

// General credit card (with optional spaces/dashes)
string().regex('/^[0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4}$/')
```

### Social Security Numbers

```javascript
// US SSN format
string().regex('/^\d{3}-\d{2}-\d{4}$/')

// Examples that match:
// 123-45-6789
```

### IP Addresses

```javascript
// IPv4
string().regex('/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/')

// IPv6 (simplified)
string().regex('/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/')

// Examples that match:
// 192.168.1.1
// 2001:0db8:85a3:0000:0000:8a2e:0370:7334
```

## Error Messages

String validation provides clear, specific error messages:

```javascript
const validator = new Validator({
  username: string().required().min(3).max(20).alphaNum()
});

const result = await validator.validate({ username: 'ab' });

console.log(result.errors);
// {
//   username: ['The username must be at least 3 characters.']
// }
```

### Default Error Messages

| Rule | Default Message |
| --- | --- |
| min | The `{field}` must be at least `{min}` characters. |
| max | The `{field}` may not be greater than `{max}` characters. |
| length | The `{field}` must be `{length}` characters. |
| email | The `{field}` must be a valid email address. |
| url | The `{field}` must be a valid URL. |
| regex | The `{field}` format is invalid. |
| alpha | The `{field}` may only contain letters. |
| alphaNum | The `{field}` may only contain letters and numbers. |
| alphaNumDash | The `{field}` may only contain letters, numbers, dashes and underscores. |
| uuid | The `{field}` must be a valid UUID. |
| json | The `{field}` must be a valid JSON string. |
| startsWith | The `{field}` must start with `{prefix}`. |
| endsWith | The `{field}` must end with `{suffix}`. |
| contains | The `{field}` must contain `{substring}`. |
| in  | The selected `{field}` is invalid. |
| notIn | The selected `{field}` is invalid. |

## Performance Tips

### Use Specific Rules

Use specific rules like `email()` instead of complex regex patterns when possible.

### Optimize Regex

Keep regular expressions simple and avoid backtracking for better performance.

### Order Rules Efficiently

Place faster rules (like length checks) before slower ones (like regex).

### Reuse Patterns

Define regex patterns as constants to avoid recompilation.
