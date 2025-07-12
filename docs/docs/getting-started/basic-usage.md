# Basic Usage

This guide covers the fundamental concepts and usage patterns of ValidlyJS. You'll learn how to create validators, validate data, and handle validation results.

## Creating a Validator

ValidlyJS supports three different validation formats. You can use any format or mix them within the same schema.

### Fluent API

```javascript
import { Validator, string, number, boolean } from 'validlyjs';

const validator = new Validator({
  name: string().required().min(3).max(50),
  email: string().required().email(),
  age: number().min(18).max(120),
  isActive: boolean().required()
});
```

### Laravel-Style Strings

```javascript
const validator = new Validator({
  name: 'required|string|min:3|max:50',
  email: 'required|string|email',
  age: 'required|number|min:18|max:120',
  isActive: 'required|boolean'
});
```

### Array Format

```javascript
const validator = new Validator({
  name: ['required', 'string', 'min:3', 'max:50'],
  email: ['required', 'string', 'email'],
  age: ['required', 'number', 'min:18', 'max:120'],
  isActive: ['required', 'boolean']
});
```

## Validating Data

### Basic Validation

```javascript
const data = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
  isActive: true
};

const result = await validator.validate(data);

if (result.isValid) {
  console.log('✅ Validation passed!');
  console.log('Validated data:', result.data);
} else {
  console.log('❌ Validation failed');
  console.log('Errors:', result.errors);
}
```

### Validation Result Structure

```javascript
// Successful validation
{
  isValid: true,
  data: { /* validated and potentially coerced data */ },
  errors: {}
}

// Failed validation
{
  isValid: false,
  data: { /* original data */ },
  errors: {
    name: ['The name field is required.'],
    email: ['The email must be a valid email address.']
  }
}
```

## Handling Validation Errors

### Laravel Format (Default)

```javascript
const result = await validator.validate(invalidData);

if (!result.isValid) {
  // Errors are grouped by field
  Object.entries(result.errors).forEach(([field, messages]) => {
    console.log(`${field}: ${messages.join(', ')}`);
  });
  
  // Get first error for a specific field
  const nameError = result.errors.name?.[0];
  if (nameError) {
    console.log('Name error:', nameError);
  }
}
```

### Different Response Formats

```javascript
// Flat format - one error per field
const validator = new Validator(schema, { responseType: 'flat' });
// Result: { name: 'The name field is required.' }

// Grouped format - errors grouped by object structure
const validator = new Validator(schema, { responseType: 'grouped' });
// Result: { user: { name: ['Required'], email: ['Invalid'] } }

// Nested format - errors nested by rule type
const validator = new Validator(schema, { responseType: 'nested' });
// Result: { name: { required: 'Field is required' } }
```

## Common Validation Patterns

### User Registration Form

```javascript
const userValidator = new Validator({
  username: string().required().min(3).max(20).alphaNum(),
  email: string().required().email().max(255),
  password: string().required().min(8),
  confirmPassword: string().required(),
  age: number().min(13).max(120),
  terms: boolean().required().true()
});

// Add custom validation for password confirmation
userValidator.extend('matchField', {
  validate: (value, parameters, field, data) => {
    return value === data[parameters[0]];
  },
  message: 'The {field} must match {0}'
});

// Update schema to use custom rule
const enhancedValidator = new Validator({
  username: string().required().min(3).max(20).alphaNum(),
  email: string().required().email().max(255),
  password: string().required().min(8),
  confirmPassword: string().required().custom('matchField', ['password']),
  age: number().min(13).max(120),
  terms: boolean().required().true()
});
```

### API Request Validation

```javascript
const apiValidator = new Validator({
  // Query parameters
  page: number().min(1).optional(),
  limit: number().min(1).max(100).optional(),
  sort: string().in(['name', 'date', 'popularity']).optional(),
  
  // Request body
  title: string().required().min(5).max(200),
  content: string().required().min(10),
  tags: array().min(1).max(10).each(string().min(2).max(30)),
  published: boolean().optional(),
  
  // File upload
  image: file().optional().extensions(['jpg', 'png', 'gif']).size().max('5MB')
});
```

## Nested Object Validation

### Using Object Shape

```javascript
const profileValidator = new Validator({
  user: object().shape({
    personal: object().shape({
      firstName: string().required().min(2),
      lastName: string().required().min(2),
      birthDate: date().required().before('today')
    }),
    contact: object().shape({
      email: string().required().email(),
      phone: string().optional().regex('/^\+?[\d\s\-\(\)]+$/'),
      address: object().shape({
        street: string().required(),
        city: string().required(),
        zipCode: string().required().regex('/^\d{5}(-\d{4})?$/')
      })
    })
  })
});
```

### Using Dot Notation

```javascript
const profileValidator = new Validator({
  'user.personal.firstName': 'required|string|min:2',
  'user.personal.lastName': 'required|string|min:2',
  'user.personal.birthDate': 'required|date|before:today',
  'user.contact.email': 'required|string|email',
  'user.contact.phone': 'nullable|string|regex:/^\\+?[\\d\\s\\-\\(\\)]+$/',
  'user.contact.address.street': 'required|string',
  'user.contact.address.city': 'required|string',
  'user.contact.address.zipCode': 'required|string|regex:/^\\d{5}(-\\d{4})?$/'
});
```

## Array Validation

### Simple Arrays

```javascript
const listValidator = new Validator({
  tags: array().min(1).max(10).each(string().min(2).max(30)),
  scores: array().length(5).each(number().min(0).max(100)),
  emails: array().min(1).each(string().email()).unique()
});
```

### Array of Objects

```javascript
// Using fluent API
const ordersValidator = new Validator({
  orders: array().min(1).each(
    object().shape({
      id: string().required().uuid(),
      amount: number().required().min(0),
      items: array().min(1).each(
        object().shape({
          productId: string().required(),
          quantity: number().required().min(1),
          price: number().required().min(0)
        })
      )
    })
  )
});

// Using dot notation
const ordersValidator2 = new Validator({
  'orders.*.id': 'required|string|uuid',
  'orders.*.amount': 'required|number|min:0',
  'orders.*.items.*.productId': 'required|string',
  'orders.*.items.*.quantity': 'required|number|min:1',
  'orders.*.items.*.price': 'required|number|min:0'
});
```

## Conditional Validation

```javascript
const conditionalValidator = new Validator({
  type: string().required().in(['individual', 'business']),
  
  // Required only if type is 'individual'
  firstName: string().requiredIf('type', 'individual').min(2),
  lastName: string().requiredIf('type', 'individual').min(2),
  
  // Required only if type is 'business'
  companyName: string().requiredIf('type', 'business').min(2),
  taxId: string().requiredIf('type', 'business').regex('/^\d{2}-\d{7}$/'),
  
  // Required with other fields
  address: string().requiredWith('city', 'zipCode'),
  city: string().requiredWith('address', 'zipCode'),
  zipCode: string().requiredWith('address', 'city'),
  
  // Required unless another field has a specific value
  phone: string().requiredUnless('email', 'admin@example.com')
});
```

## Error Handling Best Practices

### Form Validation

```javascript
async function handleFormSubmit(formData) {
  try {
    const result = await validator.validate(formData);
    
    if (result.isValid) {
      // Process valid data
      await submitToAPI(result.data);
      showSuccessMessage('Form submitted successfully!');
    } else {
      // Display field-specific errors
      displayFormErrors(result.errors);
    }
  } catch (error) {
    // Handle validation system errors
    console.error('Validation error:', error);
    showErrorMessage('An unexpected error occurred');
  }
}

function displayFormErrors(errors) {
  // Clear previous errors
  clearFormErrors();
  
  // Display new errors
  Object.entries(errors).forEach(([field, messages]) => {
    const fieldElement = document.querySelector(`[name="${field}"]`);
    if (fieldElement) {
      showFieldError(fieldElement, messages[0]);
    }
  });
}
```

## Performance Tips

**Performance Best Practices:**

*   Reuse validator instances when possible
*   Enable rule caching for repeated validations
*   Use specific data types instead of generic validation
*   Consider using union types for complex scenarios

```javascript
// Good: Reuse validator instance
const validator = new Validator(schema, {
  performance: {
    cacheRules: true,
    optimizeUnions: true
  }
});

// Use the same validator for multiple validations
const result1 = await validator.validate(data1);
const result2 = await validator.validate(data2);

// Good: Specific validation
const emailValidator = new Validator({
  email: string().email() // Faster than generic string validation
});

// Avoid: Creating new validators repeatedly
// This is inefficient for repeated validations
function validateUser(data) {
  const validator = new Validator(schema); // Don't do this repeatedly
  return validator.validate(data);
}
```
