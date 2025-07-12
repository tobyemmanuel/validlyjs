# Migration Guide: v1.x to v2.0

This guide will help you migrate from ValidlyJS v1.x to v2.0. Version 2.0 introduces significant improvements in architecture, API design, and developer experience.

## 🚀 Quick Migration Checklist

- [ ] Update package version to v2.0
- [ ] Update import statements
- [ ] Migrate configuration setup
- [ ] Update custom rule definitions
- [ ] Update validation schemas
- [ ] Test framework integrations
- [ ] Update TypeScript types (if using TypeScript)

## 📦 Installation

### Uninstall v1.x and Install v2.0

```bash
# Remove old version
npm uninstall validlyjs

# Install new version
npm install validlyjs@^2.0.0
```

Or with yarn:

```bash
# Remove old version
yarn remove validlyjs

# Install new version
yarn add validlyjs@^2.0.0
```

## 📥 Import Changes

### v1.x Imports

```javascript
// v1.x - Limited exports
import Validator from 'validlyjs';
import { string, number } from 'validlyjs/fluent';
```

### v2.0 Imports

```javascript
// v2.0 - Enhanced exports with multiple options
import { Validator, configure, extend, string, number } from 'validlyjs';

// Or use specific imports
import { GlobalConfig } from 'validlyjs';
import { useValidator } from 'validlyjs/react';
import { useValidator } from 'validlyjs/vue';
```

## ⚙️ Configuration Migration

### v1.x Configuration

```javascript
// v1.x - Per-instance configuration only
const validator = new Validator(rules, {
  messages: { /* custom messages */ },
  language: 'en'
});
```

### v2.0 Configuration (Multiple Options)

#### Option 1: Top-level Function (Recommended)

```javascript
import { configure } from 'validlyjs';

configure({
  responseType: 'laravel',
  language: 'en',
  stopOnFirstError: false,
  messages: {
    required: 'The {field} field is required',
    email: 'Please enter a valid email address'
  },
  performance: {
    cacheRules: true,
    optimizeUnions: true
  }
});
```

#### Option 2: Validator Static Method

```javascript
import { Validator } from 'validlyjs';

Validator.configure({
  responseType: 'flat',
  language: 'es',
  messages: {
    required: 'El campo {field} es obligatorio'
  }
});
```

#### Option 3: Direct GlobalConfig Access

```javascript
import { GlobalConfig } from 'validlyjs';

GlobalConfig.configure({
  responseType: 'nested',
  stopOnFirstError: true
});
```

## 🎯 Custom Rules Migration

### v1.x Custom Rules

```javascript
// v1.x - Limited custom rule support
const validator = new Validator({
  password: 'required|min:8|custom:strongPassword'
});

// Custom rule was defined separately
```

### v2.0 Custom Rules (Multiple Options)

#### Option 1: Top-level Function (Recommended)

```javascript
import { extend } from 'validlyjs';

extend(
  'strongPassword',
  (value) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value);
  },
  'The {field} must contain uppercase, lowercase, number, and special character.'
);
```

#### Option 2: Validator Static Method

```javascript
import { Validator } from 'validlyjs';

Validator.extend(
  'strongPassword',
  (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value),
  'Password must be strong.'
);
```

#### Option 3: Instance-level Extension

```javascript
import { Validator } from 'validlyjs';

const validator = new Validator({});
validator.extend(
  'strongPassword',
  (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value),
  'Password must be strong.'
);
```

### Advanced Custom Rules

```javascript
// v2.0 - Advanced custom rules with async support
extend(
  'uniqueEmail',
  async (value, parameters, field, data) => {
    const response = await fetch(`/api/check-email?email=${value}`);
    const data = await response.json();
    return data.isUnique;
  },
  'The {field} has already been taken.',
  { async: true }
);
```

## 📋 Validation Schema Migration

### v1.x Schema Format

```javascript
// v1.x - String-based rules
const rules = {
  name: 'required|string|min:2|max:50',
  email: 'required|email',
  age: 'required|integer|min:18'
};

const validator = new Validator(rules);
```

### v2.0 Schema Format (Enhanced Options)

#### Fluent API (Recommended)

```javascript
import { Validator, string, number } from 'validlyjs';

const validator = new Validator({
  name: string().required().min(2).max(50),
  email: string().required().email(),
  age: number().required().integer().min(18)
});
```

#### String Format (Still Supported)

```javascript
import { Validator } from 'validlyjs';

const validator = new Validator({
  name: 'required|string|min:2|max:50',
  email: 'required|email',
  age: 'required|integer|min:18'
});
```

#### Array Format (New)

```javascript
import { Validator } from 'validlyjs';

const validator = new Validator({
  name: ['required', 'string', 'min:2', 'max:50'],
  email: ['required', 'email'],
  age: ['required', 'integer', 'min:18']
});
```

## 🖼️ Framework Integration Migration

### React Migration

#### v1.x React Usage

```javascript
// v1.x - Manual integration
import { useState, useEffect } from 'react';
import Validator from 'validlyjs';

function MyForm() {
  const [errors, setErrors] = useState({});
  
  const validate = (data) => {
    const validator = new Validator(rules);
    const result = validator.validate(data);
    setErrors(result.errors);
    return result.isValid;
  };
  
  // Manual validation logic...
}
```

#### v2.0 React Usage

```javascript
// v2.0 - Built-in React integration
import { useValidator, string } from 'validlyjs/react';

function MyForm() {
  const { validate, errors, isValid, reset } = useValidator({
    name: string().required().min(2),
    email: string().required().email()
  });

  const handleSubmit = async (formData) => {
    const result = await validate(formData);
    if (result.isValid) {
      // Handle success
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with automatic error handling */}
    </form>
  );
}
```

### Vue Migration

#### v1.x Vue Usage

```javascript
// v1.x - Manual integration
import Validator from 'validlyjs';

export default {
  data() {
    return {
      errors: {},
      form: { name: '', email: '' }
    };
  },
  methods: {
    validate() {
      const validator = new Validator(rules);
      const result = validator.validate(this.form);
      this.errors = result.errors;
      return result.isValid;
    }
  }
};
```

#### v2.0 Vue Usage

```vue
<script setup>
// v2.0 - Built-in Vue integration
import { ref } from 'vue';
import { useValidator, string } from 'validlyjs/vue';

const form = ref({ name: '', email: '' });

const { validate, errors, isValid, reset } = useValidator({
  name: string().required().min(2),
  email: string().required().email()
}, form);

const handleSubmit = async () => {
  const result = await validate(form.value);
  if (result.isValid) {
    // Handle success
  }
};
</script>
```

### Node.js/Express Migration

#### v1.x Node.js Usage

```javascript
// v1.x - Basic validation
const Validator = require('validlyjs');

app.post('/users', (req, res) => {
  const validator = new Validator(rules);
  const result = validator.validate(req.body);
  
  if (!result.isValid) {
    return res.status(422).json({ errors: result.errors });
  }
  
  // Process data...
});
```

#### v2.0 Node.js Usage

```javascript
// v2.0 - Enhanced Node.js integration
const { Validator, string, number } = require('validlyjs/node');

app.post('/users', async (req, res) => {
  const validator = new Validator({
    name: string().required().min(2),
    email: string().required().email(),
    age: number().required().min(18)
  });

  const result = await validator.validate(req.body);
  
  if (!result.isValid) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: result.errors
    });
  }
  
  // Process valid data...
});
```

## 🆕 New Features in v2.0

### Union Validation

#### String Format

```javascript
import { Validator } from 'validlyjs';

const validator = new Validator({
  // Accept either email or phone number (semicolon separates rule sets)
  contact: 'union:(string|email;string|regex:^\\+[1-9][0-9]{1,14}$)',
  
  // Accept either positive number or string with minimum length
  value: 'union:(number|positive;string|min:3)'
});
```

#### Fluent API

```javascript
import { Validator, union, string, number } from 'validlyjs';

const validator = new Validator({
  identifier: union()
    .add(string().email())
    .add(string().regex(/^\+?[1-9]\d{1,14}$/)) // Phone number
});
```

### Enhanced File Validation

```javascript
import { file } from 'validlyjs';

const validator = new Validator({
  avatar: file()
    .required()
    .extensions(['jpg', 'png', 'gif'])
    .maxSize('2MB')
    .image()
});
```

### Network Validation

```javascript
import { string } from 'validlyjs';

const validator = new Validator({
  website: string().url(),
  api_endpoint: string().url()
});
```

## 📝 TypeScript Migration

### v1.x TypeScript

```typescript
// v1.x - Limited TypeScript support
import Validator from 'validlyjs';

interface UserData {
  name: string;
  email: string;
}

const validator = new Validator(rules);
const result = validator.validate(data as UserData);
```

### v2.0 TypeScript

```typescript
// v2.0 - Full TypeScript support with generics
import { Validator, string, ValidationResult } from 'validlyjs';

interface UserData {
  name: string;
  email: string;
}

const validator = new Validator({
  name: string().required().min(2),
  email: string().required().email()
});

const result: ValidationResult<UserData> = await validator.validate(data);

if (result.isValid) {
  // result.data is properly typed as UserData
  console.log(result.data.name); // TypeScript knows this is a string
}
```

## 🚀 Performance Improvements

### Caching (New in v2.0)

```javascript
import { configure } from 'validlyjs';

configure({
  performance: {
    cacheRules: true,
    optimizeUnions: true,
    parallelValidation: true
  }
});
```

### Tree Shaking

```javascript
// v2.0 - Import only what you need
import { string, number } from 'validlyjs'; // Only string and number rules are bundled
```

## 💥 Breaking Changes Summary

1. **Package Structure**: Enhanced exports with multiple import options
2. **Configuration**: Global configuration system available alongside per-instance configuration
3. **Custom Rules**: Multiple ways to define custom rules with enhanced capabilities
4. **Framework Integration**: Built-in React, Vue, and Node.js integrations
5. **TypeScript**: Full generic support with proper type inference
6. **Validation Results**: Enhanced result objects with more detailed information
7. **Performance**: Caching and optimization features

## 🔧 Troubleshooting

### Common Migration Issues

#### Issue: Import Errors

```javascript
// ❌ Old way
import Validator from 'validlyjs';

// ✅ New way
import { Validator } from 'validlyjs';
```

#### Issue: Union Rules Not Working

```javascript
// ❌ Wrong union syntax
const validator = new Validator({
  identifier: union([
    string().email(),
    string().regex(/^\+?[1-9]\d{1,14}$/)
  ])
});

// ✅ Correct union syntax - String format
const validator = new Validator({
  identifier: 'union:(string|email;string|regex:^\\+[1-9][0-9]{1,14}$)'
});

// ✅ Correct union syntax - Fluent API
const validator = new Validator({
  identifier: union()
    .add(string().email())
    .add(string().regex(/^\+?[1-9]\d{1,14}$/))
});
```

#### Issue: Custom Rule Parameters

```javascript
// ❌ Wrong custom rule definition
extend('myRule', (value, params) => {
  // params is not directly available
});

// ✅ Correct custom rule definition
extend('myRule', (value, parameters, field, data) => {
  // parameters array contains rule parameters
  // field contains the field name
  // data contains all validation data
  return someValidation(value, parameters);
});
```

### Getting Help

If you encounter issues during migration:

1. Check the [API Reference](./api/overview.md)
2. Review the [examples](https://github.com/tobyemmanuel/validlyjs/tree/main/examples)
3. [Open an issue](https://github.com/tobyemmanuel/validlyjs/issues) on GitHub

## 🎉 Migration Complete

Once you've completed the migration, you'll have access to:

- ✅ **Better Developer Experience**: Multiple API options for different preferences
- ✅ **Enhanced Performance**: Caching, tree-shaking, and optimizations
- ✅ **Framework Integration**: Built-in React, Vue, and Node.js support
- ✅ **Advanced Features**: Union validation, file validation, network validation
- ✅ **Better TypeScript**: Full generic support and type inference
- ✅ **Flexible Configuration**: Global and per-instance configuration options
- ✅ **Powerful Custom Rules**: Multiple ways to extend functionality

Welcome to ValidlyJS v2.0! 🚀
