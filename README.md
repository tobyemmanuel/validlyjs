# ValidlyJS

**ValidlyJS** is a lightweight, type-safe validation library inspired by Laravel's validation syntax. It provides a fluent API for defining validation rules and supports both synchronous and asynchronous validation. Built with TypeScript, it ensures type safety while maintaining flexibility for JavaScript (client-side) users.

---

## Features

- **Laravel-Style Validation**: Define rules using a fluent API or Laravel-style strings.
- **Type-Safe**: Built with TypeScript for robust type checking and inference.
- **Frontend-Focused**: Designed for browser environments with support for file validation.
- **Customizable**: Add custom rules, error messages, and localization.
- **Framework-Agnostic**: Works with vanilla JavaScript, React, Vue, and more.
- **Async Support**: Validate data asynchronously for complex use cases.

---

## Installation

Install ValidlyJS via npm:

```bash
npm install validlyjs
```

Or via yarn:

```bash
yarn add validlyjs
```

---

## Usage

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

const result = validator.validate(data);

if (!result.isValid) {
  console.log("Validation Errors:", result.errors);
} else {
  console.log("Data is valid!");
}
```

```typescript
import { Validator } from 'validlyjs';

const data = { username: "", email: "invalid-email" };
const rules = {
  username: "required|min:3|max:20|alpha",
  email: "required|email"
};

const validator = new Validator(rules);
const result = validator.validate(data);

if (!result.isValid) {
  console.log(result.errors);
}
```

```typescript
const data = { password: "short" };
const rules = {
  password: ["required", "min:8", "max:20"]
};

const validator = new Validator(rules);
const result = validator.validate(data);

if (!result.isValid) {
  console.log(result.errors);
}
```

### Async Validation

```typescript
const asyncValidator = new Validator({
  username: string().required().async(async (value) => {
    const isAvailable = await checkUsernameAvailability(value);
    return isAvailable ? true : "Username is already taken";
  })
});

const asyncResult = await asyncValidator.validateAsync({
  username: "john_doe"
});
```

### File Validation

```typescript
const fileValidator = new Validator({
  avatar: file()
    .maxSize('2MB')
    .mimes(['jpg', 'png'])
    .dimensions('min_width=100,min_height=100')
});

const fileResult = fileValidator.validate({
  avatar: document.querySelector('input[type="file"]').files[0]
});
```

---

## API

### Core Exports

- **`Validator`**: The main validation class.
- **`string()`**: Builder for string validation rules.
- **`number()`**: Builder for number validation rules.
- **`array()`**: Builder for array validation rules.
- **`object()`**: Builder for object validation rules.
- **`boolean()`**: Builder for boolean validation rules.
- **`date()`**: Builder for date validation rules.
- **`file()`**: Builder for file validation rules.

### Common Rules

- **`required()`**: The field is required.
- **`min(value)`**: Minimum length or value.
- **`max(value)`**: Maximum length or value.
- **`email()`**: Validates email format.
- **`confirmed()`**: Ensures field matches a confirmation field.
- **`nullable()`**: Allows `null` or empty values.
- **`async(validator)`**: Adds asynchronous validation.

---

## Customization

### Custom Messages

```typescript
import { configure } from 'validlyjs';

configure({
  messages: {
    required: 'The :attribute field is required',
    min: {
      string: 'The :attribute must be at least :min characters',
      numeric: 'The :attribute must be at least :min'
    }
  }
});
```

### Custom Rules

```typescript
import { Validator, string, extend } from 'validlyjs';

extend(
  "strong_password",
  (value) => /[A-Z]/.test(value) && /[0-9]/.test(value),
  "The :attribute must contain at least one uppercase letter and one number."
);

const validator = new Validator({
  password: string().required().custom("strong_password")
  // or any of the following
  // password: "string|required|custom:strong_password",
  // password: ["string", "required", "custom:strong_password"],
});
```

---

## Framework Integration

### React Example

```javascript
import { useValidator, string } from 'validlyjs';

function MyForm() {
  const { validate, errors } = useValidator({
    email: string().required().email(),
    password: string().required().min(8)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validate(formData);
    if (isValid) {
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" />
      {errors.email && <div className="error">{errors.email[0]}</div>}

      <input name="password" type="password" />
      {errors.password && <div className="error">{errors.password[0]}</div>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

```vue

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.email" placeholder="Email" />
    <span v-if="errors.email">{{ errors.email[0] }}</span>

    <button type="submit">Submit</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useVueValidator, string } from 'validlyjs';

const schema = {
  email: string().required().email(),
};

const form = ref({
  email: '',
});

const { validate, errors } = useValidator(schema, form.value);

const handleSubmit = async () => {
  const isValid = await validate(form.value);
  if (isValid) {
    // Submit the form
    console.log('Form is valid!', form.value);
  } else {
    console.log('Form is invalid:', errors.value);
  }
};
</script>

```

---

## GitHub Repository

For additional details, contributions, and support, visit the [ValidlyJS GitHub Repository](https://github.com/tobyemmanuel/validlyjs).

## Contributing

Contributions are welcome! Feel free to submit issues or create pull requests. Please follow the contribution guidelines.

Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

---

## License

ValidlyJS is open-source software licensed under the MIT License.

---
