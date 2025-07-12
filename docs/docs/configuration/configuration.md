# Configuration

Customize ValidlyJS behavior with comprehensive configuration options for performance, error handling, localization, and more.

## Overview

ValidlyJS provides extensive configuration options to tailor validation behavior to your specific needs. Configuration can be set globally or per validator instance, giving you fine-grained control over validation behavior.

## Basic Configuration

Configure a validator instance with basic options:

```javascript
import { Validator } from 'validlyjs';

const validator = new Validator({
  name: 'required|string|min:2',
  email: 'required|email',
  age: 'required|integer|min:18'
}, {
  // Basic configuration options
  responseType: 'laravel',
  language: 'en',
  stopOnFirstError: false,
  debug: false
});

// Validate with configuration
const result = await validator.validate({
  name: 'John',
  email: 'john@example.com',
  age: 25
});
```

## Response Formats

Configure how validation errors are formatted in the response:

### Laravel Format (Default)

```javascript
const validator = new Validator(schema, {
  responseType: 'laravel'
});

// Response format:
{
  isValid: false,
  errors: {
    "name": ["The name field is required."],
    "email": ["The email must be a valid email address."]
  }
}
```

### Flat Format

```javascript
const validator = new Validator(schema, {
  responseType: 'flat'
});

// Response format:
{
  isValid: false,
  errors: {
    "name": "The name field is required.",
    "email": "The email must be a valid email address."
  }
}
```

### Grouped Format

```javascript
const validator = new Validator(schema, {
  responseType: 'grouped'
});

// Response format:
{
  isValid: false,
  errors: {
    "user": {
      "name": ["The name field is required."],
      "email": ["The email must be a valid email address."]
    },
    "profile": {
      "bio": ["The bio field is required."]
    }
  }
}
```

### Nested Format

```javascript
const validator = new Validator(schema, {
  responseType: 'nested'
});

// Response format:
{
  isValid: false,
  errors: {
    "name": {
      "required": "The name field is required."
    },
    "email": {
      "email": "The email must be a valid email address."
    }
  }
}
```

## Localization

Configure language and custom messages for internationalization:

### Language Configuration

```javascript
const validator = new Validator(schema, {
  language: 'es', // Spanish
  
  // Custom messages for specific rules
  messages: {
    'required': 'El campo {field} es obligatorio.',
    'email': 'El campo {field} debe ser un email válido.',
    'min.string': 'El campo {field} debe tener al menos {min} caracteres.'
  },
  
  // Field-specific messages
  fieldMessages: {
    'name.required': 'El nombre es obligatorio.',
    'email.email': 'Proporciona un email válido.',
    'password.min': 'La contraseña debe tener al menos 8 caracteres.'
  }
});

// Custom language pack
const customLanguagePack = {
  required: 'Le champ {field} est requis.',
  email: 'Le champ {field} doit être une adresse email valide.',
  'min.string': 'Le champ {field} doit contenir au moins {min} caractères.'
};

const frenchValidator = new Validator(schema, {
  language: 'fr',
  customLanguages: {
    fr: customLanguagePack
  }
});
```

### Dynamic Message Placeholders

```javascript
const validator = new Validator({
  username: 'required|string|min:3|max:20',
  age: 'required|integer|between:18,65'
}, {
  messages: {
    'required': 'The {field} field is mandatory.',
    'min.string': 'The {field} must be at least {min} characters long.',
    'max.string': 'The {field} cannot exceed {max} characters.',
    'between.number': 'The {field} must be between {min} and {max}.'
  }
});

// Available placeholders:
// {field} - Field name
// {value} - Field value
// {min}, {max} - Rule parameters
// {size}, {length} - Size/length parameters
```

## Performance Options

Optimize validation performance with various configuration options:

```javascript
const validator = new Validator(schema, {
  performance: {
    // Cache compiled rules for reuse
    cacheRules: true,
    
    // Optimize union rule validation
    optimizeUnions: true,
    
    // Enable parallel validation for independent fields
    parallelValidation: true,
    
    // Pre-compile rules for faster execution
    compileRules: true
  },
  
  // Stop validation on first error for better performance
  stopOnFirstError: true
});

// Advanced performance configuration
const highPerformanceValidator = new Validator(schema, {
  performance: {
    cacheRules: true,
    optimizeUnions: true,
    parallelValidation: true,
    compileRules: true,
  }
});
```

## Type Coercion

Configure automatic type conversion for input data:

```javascript
const validator = new Validator({
  age: 'required|integer|min:18',
  isActive: 'required|boolean',
  price: 'required|number|min:0',
  createdAt: 'required|date'
}, {
  coercion: {
    enabled: true,
    
    // Enable specific type coercions
    strings: true,    // Convert to strings when needed
    numbers: true,    // Convert string numbers to numbers
    booleans: true,   // Convert truthy/falsy values to booleans
    dates: true       // Convert date strings to Date objects
  }
});

// With coercion enabled, these will be automatically converted:
const result = await validator.validate({
  age: '25',           // String '25' → Number 25
  isActive: 'true',    // String 'true' → Boolean true
  price: '19.99',      // String '19.99' → Number 19.99
  createdAt: '2024-01-01' // String → Date object
});

// Custom coercion functions
const customValidator = new Validator(schema, {
  coercion: {
    enabled: true,
    customTypeCoercion: {
      // Custom coercion for specific fields
      'user.preferences': (value) => {
        return typeof value === 'string' ? JSON.parse(value) : value;
      },
      'tags': (value) => {
        return typeof value === 'string' ? value.split(',') : value;
      }
    }
  }
});
```

## Debug Mode

Enable debugging features for development and troubleshooting:

```javascript
const validator = new Validator(schema, {
  debug: true
});

// Debug mode provides additional information
const result = await validator.validate(data);
```

## Global Configuration

Set default configuration that applies to all validator instances:

```javascript
// Method 1: Using the top-level configure function (Recommended)
import { configure } from 'validlyjs';

configure({
  language: 'en',
  responseType: 'laravel',
  stopOnFirstError: false,
  messages: {
    required: 'The :field is mandatory'
  }
});

// Method 2: Using the Validator static method
import { Validator } from 'validlyjs';

Validator.configure({
  language: 'es',
  responseType: 'flat'
});

// Method 3: Direct GlobalConfig access (Advanced)
import { GlobalConfig } from 'validlyjs';

GlobalConfig.configure({
  language: 'fr',
  fieldMessages: {
    'user.email': 'Please provide a valid email address'
  }
});

// Get current configuration
const currentConfig = GlobalConfig.getConfig();
console.log('Current settings:', currentConfig);
```

## Configuration Presets

Use predefined configuration presets for common scenarios:

```javascript

import { usePreset, createPreset } from 'validlyjs';

// Use built-in presets
usePreset('laravel');  // Laravel-style responses
usePreset('api');      // API-friendly responses
usePreset('form');     // Form validation responses

// Create custom preset
createPreset('myApp', {
  language: 'en',
  responseType: 'nested',
  stopOnFirstError: true,
  messages: {
    required: ':field is required',
    email: 'Please enter a valid email'
  }
});

// Apply your custom preset
usePreset('myApp');

// Preset methods are also available on the Validator class

import { Validator } from 'validlyjs';

Validator.usePreset('laravel')
Validator.usePreset('api')
Validator.usePreset('form')
// Available presets
const presets = {
  // Laravel-style validation
  laravel: {
    responseType: 'laravel',
    stopOnFirstError: false,
    coercion: { enabled: false }
  },
  
  // Strict validation (no coercion)
  strict: {
    coercion: { enabled: false },
    stopOnFirstError: true,
    errorHandling: {
      verboseErrors: true,
      includeRuleName: true
    }
  },
  
  // API validation
  api: {
    responseType: 'flat',
    stopOnFirstError: true,
    performance: {
      cacheRules: true,
      parallelValidation: true
    }
  }
};


// Create custom preset
Validator.createPreset('myCustomPreset', {
  responseType: 'nested',
  language: 'en',
  performance: {
    cacheRules: true
  }
});

```

## Configuration Best Practices

### Best Practices

* **Performance:** Enable caching and parallel validation in production
* **Debug Mode:** Only enable debug mode in development environments
* **Localization:** Set up proper language packs for international applications
* **Type Coercion:** Be explicit about coercion settings to avoid unexpected behavior
* **Global Config:** Set sensible global defaults to reduce repetitive configuration

### Production-Ready Configuration

```javascript
// Production configuration example
const productionConfig = {
  responseType: 'laravel',
  language: 'en',
  stopOnFirstError: false,
  debug: false,
  
  performance: {
    cacheRules: true,
    parallelValidation: true,
    optimizeUnions: true,
    compileRules: true
  },
  
  coercion: {
    enabled: true,
    numbers: true,
    booleans: true,
    strings: false,
    dates: true
  },
  
  // Custom messages for better UX
  messages: {
    'required': 'This field is required.',
    'email': 'Please enter a valid email address.',
    'min.string': 'Must be at least {min} characters.',
    'max.string': 'Cannot exceed {max} characters.'
  }
};

// Set as global configuration
Validator.setGlobalConfig(productionConfig);
```
