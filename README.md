# ValidlyJS

![ValidlyJS](http://tobyemmanuel.github.io/validlyjs/assets/images/validlyjs.png)

A high-performance Laravel-inspired validation library for TypeScript/JavaScript

  [![npm version](https://badge.fury.io/js/validlyjs.svg)](https://badge.fury.io/js/validlyjs)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
  [![Build Status](https://github.com/tobyemmanuel/validlyjs/workflows/CI/badge.svg)](https://github.com/tobyemmanuel/validlyjs/actions)

## ✨ Features

- **🚀 Laravel-Style Validation**: Define rules using a fluent API or Laravel-style strings
- **🔒 Type-Safe**: Built with TypeScript for robust type checking and inference
- **🌐 Frontend-Focused**: Designed for browser environments with support for file validation
- **🎨 Customizable**: Add custom rules, error messages, and localization
- **⚡ Framework-Agnostic**: Works with vanilla JavaScript, React, Vue, Node.js, and more
- **🔄 Async Support**: Validate data asynchronously for complex use cases
- **📱 Cross-Platform**: Browser, Node.js, and mobile app support
- **🎯 High Performance**: Optimized for speed with minimal bundle size

## 📦 Installation

Install ValidlyJS via npm:

```bash
npm install validlyjs
```

Or via yarn:

```bash
yarn add validlyjs
```

## 🚀 Quick Start

### Basic Validation

```typescript
import { Validator, string, number } from 'validlyjs';

const validator = new Validator({
  name: string().required().min(3),
  age: number().min(18).max(120),
  email: string().email().required()
});

const data = {
  name: "John",
  age: 25,
  email: "john@example.com"
};

const result = await validator.validate(data);

if (!result.isValid) {
  console.log("Validation Errors:", result.errors);
} else {
  console.log("Data is valid!");
}
```

### Laravel-Style String Validation

```typescript
import { Validator } from 'validlyjs';

const validator = new Validator({
  username: "required|min:3|max:20|alpha",
  email: "required|email",
  password: "required|min:8|confirmed"
});

const result = await validator.validate({
  username: "john_doe",
  email: "john@example.com",
  password: "secretpassword",
  password_confirmation: "secretpassword"
});
```

### Array Format Validation

```typescript
const validator = new Validator({
  password: ["required", "min:8", "max:20"],
  tags: ["array", "min:1", "max:5"]
});
```

## 📚 Validation Types

### String Validation

```typescript
import { string } from 'validlyjs';

const schema = {
  username: string()
    .required()
    .min(3)
    .max(20)
    .alpha()
    .lowercase(),
  
  email: string()
    .required()
    .email()
    .max(255),
    
  url: string()
    .url()
    .nullable(),
    
  phone: string()
    .regex(/^\+?[1-9]\d{1,14}$/)
};
```

### Number Validation

```typescript
import { number } from 'validlyjs';

const schema = {
  age: number()
    .required()
    .min(18)
    .max(120)
    .integer(),
    
  price: number()
    .required()
    .min(0)
    .decimal(2),
    
  rating: number()
    .between(1, 5)
};
```

### Array & Object Validation

```typescript
import { array, object, string, number } from 'validlyjs';

const schema = {
  tags: array()
    .required()
    .min(1)
    .max(5)
    .unique(),
    
  user: object()
    .required()
    .shape({
      name: string().required(),
      age: number().min(18),
      preferences: object().shape({
        theme: string().in(['light', 'dark']),
        notifications: boolean()
      })
    })
};
```

### Date Validation

```typescript
import { date } from 'validlyjs';

const schema = {
  birthDate: date()
    .required()
    .before('today')
    .after('1900-01-01'),
    
  appointmentDate: date()
    .required()
    .after('today')
    .format('YYYY-MM-DD')
};
```

### File Validation

```typescript
import { file } from 'validlyjs';

const schema = {
  avatar: file()
    .required()
    .maxSize('2MB')
    .mimes(['jpg', 'png', 'gif'])
    .dimensions('min_width=100,min_height=100'),
    
  document: file()
    .mimes(['pdf', 'doc', 'docx'])
    .maxSize('10MB')
};
```

## 🔄 Async Validation

```typescript
const validator = new Validator({
  username: string()
    .required()
    .min(3)
    .async(async (value) => {
      const isAvailable = await checkUsernameAvailability(value);
      return isAvailable ? true : "Username is already taken";
    }),
    
  email: string()
    .required()
    .email()
    .async(async (value) => {
      const exists = await checkEmailExists(value);
      return !exists ? true : "Email is already registered";
    })
});

const result = await validator.validateAsync({
  username: "john_doe",
  email: "john@example.com"
});
```

## 🎯 Conditional Validation

```typescript
const validator = new Validator({
  // Required if another field has a specific value
  phone: string().requiredIf('contact_method', 'phone'),
  
  // Required unless another field has a specific value
  email: string().requiredUnless('contact_method', 'phone'),
  
  // Required with other fields
  city: string().requiredWith(['state', 'country']),
  
  // Prohibited if another field has a specific value
  discount: number().prohibitedIf('user_type', 'premium'),
  
  // Conditional validation with when()
  items: array().required().min(1),
  'items.*': string().when('items', {
    length: { gte: 5 },
    then: string().min(10),
    otherwise: string().min(3)
  })
});
```

## 🎨 Framework Integration

### React Integration

```jsx
import { useValidator, string, number } from 'validlyjs/react';

function UserForm() {
  const { validate, errors, isValid } = useValidator({
    name: string().required().min(2),
    email: string().required().email(),
    age: number().required().min(18)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await validate(data);
    if (result.isValid) {
      // Submit form
      console.log('Form is valid!', data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" />
      {errors.name && <div className="error">{errors.name[0]}</div>}

      <input name="email" type="email" placeholder="Email" />
      {errors.email && <div className="error">{errors.email[0]}</div>}

      <input name="age" type="number" placeholder="Age" />
      {errors.age && <div className="error">{errors.age[0]}</div>}

      <button type="submit" disabled={!isValid}>Submit</button>
    </form>
  );
}
```

### Vue Integration

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.name" placeholder="Name" />
    <span v-if="errors.name" class="error">{{ errors.name[0] }}</span>

    <input v-model="form.email" type="email" placeholder="Email" />
    <span v-if="errors.email" class="error">{{ errors.email[0] }}</span>

    <button type="submit" :disabled="!isValid">Submit</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useValidator, string } from 'validlyjs/vue';

const form = ref({
  name: '',
  email: '',
});

const { validate, errors, isValid } = useValidator({
  name: string().required().min(2),
  email: string().required().email(),
}, form);

const handleSubmit = async () => {
  const result = await validate(form.value);
  if (result.isValid) {
    console.log('Form is valid!', form.value);
  }
};
</script>
```

### Node.js/Express Integration

```typescript
import express from 'express';
import { Validator, string, number } from 'validlyjs/node';

const app = express();

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

  // Process valid data
  res.json({ message: 'User created successfully' });
});
```

## 🛠️ Customization

### Custom Rules

```typescript
import { Validator, string, extend } from 'validlyjs';

// Define a custom rule
extend(
  "strong_password",
  (value) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value);
  },
  "The :attribute must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
);

// Use the custom rule
const validator = new Validator({
  password: string().required().custom("strong_password")
});
```

### Custom Messages

```typescript
import { configure } from 'validlyjs';

configure({
  messages: {
    required: 'The :attribute field is required',
    email: 'Please enter a valid email address',
    min: {
      string: 'The :attribute must be at least :min characters',
      numeric: 'The :attribute must be at least :min'
    }
  }
});
```

### Localization

```typescript
import { configure } from 'validlyjs';

configure({
  locale: 'es',
  messages: {
    required: 'El campo :attribute es obligatorio',
    email: 'El campo :attribute debe ser un email válido',
    min: {
      string: 'El campo :attribute debe tener al menos :min caracteres'
    }
  }
});
```

## 📊 Performance

ValidlyJS is optimized for performance:

- **Tree-shakable**: Import only what you need
- **Fast validation**: Optimized validation algorithms
- **Memory efficient**: Minimal memory footprint
- **Async-friendly**: Non-blocking validation

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run integration tests:

```bash
npm run test:integrations
```

## 📖 Documentation

For comprehensive documentation, examples, and API reference, visit:

**[📚 ValidlyJS Documentation](https://tobyemmanuel.github.io/validlyjs)**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/tobyemmanuel/validlyjs.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature`
5. Make your changes and add tests
6. Run tests: `npm test`
7. Commit your changes: `git commit -m 'Add some feature'`
8. Push to the branch: `git push origin feature/your-feature`
9. Open a pull request

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes.

## 📄 License

ValidlyJS is open-source software licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by [Laravel's validation system](https://laravel.com/docs/validation)
- Built with ❤️ for the JavaScript/TypeScript community

## 📞 Support

- 🐛 [Report bugs](https://github.com/tobyemmanuel/validlyjs/issues)
- 💡 [Request features](https://github.com/tobyemmanuel/validlyjs/issues)

[⭐ Star us on GitHub](https://github.com/tobyemmanuel/validlyjs) • [🌐 Visit our website](https://tobyemmanuel.github.io/validlyjs)
