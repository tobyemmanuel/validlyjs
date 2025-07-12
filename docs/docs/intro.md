# Introduction

Welcome to **ValidlyJS** documentation! This comprehensive guide will help you get started with our package and explore all its features.

## What is ValidlyJS?

ValidlyJS is a high-performance, Laravel-inspired validation library for TypeScript and JavaScript. It provides multiple validation formats, excellent TypeScript support, and built-in integrations for popular frameworks.

## Key Features

- **Multiple Validation Formats:** Fluent API, Laravel-style strings, and array formats
- **High Performance:** Compiled rules and optimized validation engine
- **TypeScript First:** Full TypeScript support with excellent type inference
- **Framework Ready:** Built-in React hooks, Vue composables, and Node.js middleware
- **Laravel Inspired:** Familiar syntax for Laravel developers
- **Union Types:** Advanced union validation with multiple strategies
- **Different Response Formats:** Different response formats to suit your development.
- **Internationalization:** Built-in i18n support
- **Customizable:** Easily configure and extend to fit your needs
- **Extensible:** Built-in support for custom rules, validation messages, attributes, and more

## Quick Start

Ready to dive in? Here's how to get started:

1. **Install the package**:

   ```bash
   npm install validlyjs
   ```

2. **Import and use**:

   ```javascript
   import { Validator, string, number } from 'validlyjs';

   // Laravel-style strings
   const validator2 = new Validator({
   name: 'required|string|min:3|max:50',
   email: 'required|string|email',
   age: 'required|number|min:18|max:120'
   });

   // Fluent API
   const validator = new Validator({
   name: string().required().min(3).max(50),
   email: string().required().email(),
   age: number().min(18).max(120)
   });

   // Array-style strings
   const validator2 = new Validator({
   name: ['required','string','min:3','max:50'],
   email: ['required','string','email'],
   age: ['required','number','min:18','max:120']
   });

   const result = await validator.validate({
   name: 'John Doe',
   email: 'john@example.com',
   age: 25
   });

   console.log(result.isValid); // true
   ```

3. **Explore the documentation**: Check out the [Getting Started](./getting-started/installation) section for detailed instructions.

## Need Help?

- 📚 Browse the comprehensive [API Reference](./api/overview)
- 🐛 Report issues on [GitHub](https://github.com/yourusername/your-repo-name/issues)

## What's Next?

Now that you have an overview, let's get you set up:

- [Installation Guide](./getting-started/installation) - Step-by-step installation instructions
- [API Reference](./api/overview) - Complete API documentation

Happy coding! 🚀
