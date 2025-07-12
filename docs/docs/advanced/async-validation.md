# Async Validation

Handle asynchronous validation scenarios like database checks, API calls, and file processing with ValidlyJS's robust async validation system.

## Overview

Async validation is essential for scenarios where validation requires external resources like databases, APIs, or file system operations. ValidlyJS provides comprehensive support for asynchronous validation with performance optimizations and error handling.

## Basic Async Validation

Use the `validate()` method for asynchronous validation:

```javascript
import { Validator } from 'validlyjs';

const validator = new Validator({
  email: 'required|email|unique:users',
  username: 'required|string|min:3|unique:users'
});

// Async validation
const result = await validator.validate({
  email: 'user@example.com',
  username: 'johndoe'
});

if (result.isValid) {
  console.log('Validation passed!');
} else {
  console.log('Validation errors:', result.errors);
}
```

### Sync vs Async Methods

```javascript
// Synchronous validation (faster, but limited)
const syncResult = validator.validateSync(data);

// Asynchronous validation (supports all rules)
const asyncResult = await validator.validate(data);

// Check if schema has async rules
const hasAsyncRules = validator.hasAsyncRules();
console.log('Schema contains async rules:', hasAsyncRules);
```

## Built-in Async Rules

ValidlyJS includes several built-in async rules for common scenarios:

### Database Uniqueness

```javascript
// Check if email is unique in database
const validator = new Validator({
  email: 'required|email|unique:users,email',
  username: 'required|string|unique:users,username,id,123' // Exclude record with id=123
});

// Configure database connection
const result = await validator.validate(data, {
  database: {
    connection: dbConnection,
    // Custom query builder
    uniqueQuery: async (table, column, value, excludeColumn, excludeValue) => {
      let query = `SELECT COUNT(*) as count FROM ${table} WHERE ${column} = ?`;
      const params = [value];
      
      if (excludeColumn && excludeValue) {
        query += ` AND ${excludeColumn} != ?`;
        params.push(excludeValue);
      }
      
      const result = await dbConnection.query(query, params);
      return result[0].count === 0;
    }
  }
});
```

### File Validation

```javascript
// Async file validation
const validator = new Validator({
  avatar: 'required|file|image|max_size:5MB|dimensions:min_width,100,min_height,100',
  document: 'required|file|mimes:pdf,doc,docx|max_size:10MB'
});

const result = await validator.validate({
  avatar: fileInput.files[0],
  document: documentInput.files[0]
});
```

### API Validation

```javascript
// Custom async rule for API validation
const apiKeyRule = {
  validate: async (value, parameters, field, data) => {
    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: value })
      });
      
      return response.ok;
    } catch (error) {
      console.error('API validation failed:', error);
      return false;
    }
  },
  message: 'The {field} is not a valid API key.',
  async: true
};

const validator = new Validator({
  apiKey: 'required|string|valid_api_key'
}, {
  customRules: {
    valid_api_key: apiKeyRule
  }
});
```

## Real-World Examples

### User Registration with Async Validation

```javascript
// Complete user registration validation
const registrationValidator = new Validator({
  // Basic validation
  firstName: 'required|string|min:2|max:50',
  lastName: 'required|string|min:2|max:50',
  
  // Async uniqueness checks
  email: 'required|email|unique:users,email',
  username: 'required|string|min:3|max:20|alpha_num|unique:users,username',
  
  // Password validation
  password: 'required|string|min:8|strong_password',
  confirmPassword: 'required|string|same:password',
  
  // Profile image
  avatar: 'nullable|file|image|max_size:2MB|dimensions:min_width,100,min_height,100',
  
  // Terms acceptance
  terms: 'required|boolean|accepted'
}, {
  customRules: {
    strong_password: {
      validate: (value) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
      },
      message: 'Password must contain uppercase, lowercase, number, and special character.'
    }
  }
});

// Registration handler
async function handleRegistration(formData) {
  try {
    showLoadingSpinner();
    
    const result = await registrationValidator.validate(formData);
    
    if (result.isValid) {
      // Proceed with registration
      await createUser(result.data);
      showSuccessMessage('Registration successful!');
    } else {
      // Show validation errors
      displayValidationErrors(result.errors);
    }
  } catch (error) {
    console.error('Registration validation failed:', error);
    showErrorMessage('Registration failed. Please try again.');
  } finally {
    hideLoadingSpinner();
  }
}
```

## Performance Optimization

### 🚀 Async Performance Tips

* **Set Timeouts:** Prevent hanging validations with appropriate timeouts
* **Handle Errors Gracefully:** Implement proper error handling and fallbacks
