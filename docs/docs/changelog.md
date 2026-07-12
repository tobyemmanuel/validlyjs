# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-07-12

### 🚀 Major Changes

- **BREAKING**: File type detection is now **content-based** (magic-byte sniffing) instead of relying on the `file-type` package. `file.mimes()` and `file.image()` now inspect the actual file bytes.
- **BREAKING**: The `file-type` dependency has been **removed entirely** (it was an optional peer dependency). File validation no longer requires it.
- **BREAKING**: `string().regex()` / `pattern` rules are now guarded against catastrophic backtracking (ReDoS); overly complex patterns are handled safely instead of executed blindly.

### ✨ New Features (Security)

- **NEW**: Built-in magic-byte MIME sniffer (`src/utils/mime.ts`) — zero external dependencies for file type detection.
- **NEW**: ReDoS protection via a bounded regex LRU cache plus a fail-closed `safeRegexTest` (`src/utils/safe-regex.ts`).
- **NEW**: Prototype-pollution guards in object `shape` resolution and the field resolver — `__proto__` / `constructor.prototype` are excluded from path traversal.
- **NEW**: Node file rules (`content-type`, `exists`, `path`, `permissions`) now resolve paths within a configurable base directory (path-traversal protection).

### 🔧 Improvements (Performance & Memory)

- **IMPROVED**: O(1) LRU rule-compilation cache; cache keys now skip object/array values to avoid redundant work.
- **IMPROVED**: Bounded path-segment cache.
- **IMPROVED**: Per-`Validator` memoization in the Express and Fastify integrations (`WeakMap`) — rules are no longer recompiled on every request.
- **IMPROVED**: `npm audit` on **production** dependencies reports **0 vulnerabilities**.

### 🔄 Migration Guide

#### **From v2.0 to v3.0**

##### **File Validation (Behavior Change)**

```javascript
// v2.0 - relied on the `file-type` package / extension heuristics
import { file } from 'validlyjs';
const schema = { avatar: file().mimes(['jpg', 'png']) };

// v3.0 - same API, but detection is now content-based (magic bytes)
// No `file-type` install required; mismatched extension vs. content is caught.
const schema = { avatar: file().mimes(['jpg', 'png']) };
```

##### **Custom Regex (Safety Change)**

```javascript
// v3.0 - patterns are analyzed for catastrophic backtracking and
// rejected/handled safely instead of risking a ReDoS.
string().regex(/^(a+)+$/); // complex patterns are now guarded
```

### 📦 Dependencies

#### **Removed**

- `file-type` (previously an optional peer dependency).

#### **Updated (Dev Tooling)**

- `semantic-release` **15 → 24** — eliminates the ~500-package vulnerable `npm`/`libnpm*`/`pacote` tree that v15 dragged in.

### 📚 Documentation

- **NEW**: Benchmark suite — `npm run benchmark`, plus cross-library (Zod/Joi) and rule-mode (string/array/fluent) comparisons.
- **NEW**: Security and performance benchmark test suites.

### 🐛 Bug Fixes

- Hardened file-validation edge cases (extension/content mismatches) via content sniffing.
- Fixed module case-sensitivity resolution (`Validator.ts` → `validator.ts`).

### 🧪 Testing

- **NEW**: Security test suite (12 tests) and per-data-type performance benchmark suite (14 tests).
- Full test suite: **403 tests passing**.

### 🎯 Key Benefits of v3.0

1. **Secure by Default**: Content-based file detection, ReDoS-safe regex, and prototype-pollution guards.
2. **Smaller Install**: `file-type` dependency removed.
3. **Auditable**: Zero vulnerabilities in production dependencies.
4. **Faster**: Memoized rule compilation in Node integrations and an O(1) compilation cache.

### 🔮 What's Next

- Continued benchmarking and tuning against Zod/Joi.
- Additional framework integrations and interactive docs examples.

## [2.0.0] - 2024-01-XX

### 🚀 Major Changes

#### **Complete Architecture Rewrite**

- **BREAKING**: Complete rewrite of the validation engine for better performance and maintainability
- **BREAKING**: New modular architecture with separate builders for each data type
- **BREAKING**: Updated import paths and API structure

#### **Enhanced Export Structure**

- **NEW**: Added top-level convenience functions (`configure`, `extend`, `usePreset`, `createPreset`)
- **NEW**: Direct `GlobalConfig` export for advanced configuration access
- **IMPROVED**: Maintained backward compatibility with `Validator` static methods
- **IMPROVED**: Multiple API styles - choose between top-level functions or class-based methods

### ✨ New Features

#### **Improved Developer Experience**

```javascript
// Multiple ways to configure - choose your preferred style:

// Option 1: Top-level functions (Recommended)
import { configure, extend, usePreset } from 'validlyjs';
configure({ language: 'en' });
extend('custom_rule', { validate: ..., message: ... });
usePreset('laravel');

// Option 2: Validator static methods
import { Validator } from 'validlyjs';
Validator.configure({ language: 'en' });
Validator.extend('custom_rule', { validate: ..., message: ... });

// Option 3: Direct GlobalConfig access (Advanced)
import { GlobalConfig } from 'validlyjs';
GlobalConfig.configure({ language: 'en' });
```

#### **Enhanced Type System**

- Added comprehensive TypeScript interfaces for all validation types
- New `RuleDefinition`, `ValidatorOptions`, and `ValidationError` types
- Better type inference for fluent API methods

#### **Union Validation**

- **NEW**: `union()` builder for validating values against multiple rule sets
- Support for "either/or" validation scenarios
- Configurable stop-on-first-pass behavior

#### **Advanced Framework Integration**

##### **React Integration**

- New `useValidation` hook with reactive validation
- Support for form validation with real-time feedback
- Integration with React form libraries

##### **Vue Integration**

- New `useValidation` composable for Vue 3
- Vue directives: `v-validate`, `v-validate-on`, `v-error-display`
- Reactive validation with Vue's reactivity system

##### **Node.js Integration**

- **NEW**: CJS and ESM support for Node
- **NEW**: Express.js middleware with `ExpressValidator`
- **NEW**: Fastify plugin with `FastifyValidator`
- Support for validating request body, query, params, and headers
- Configurable error handling and response formats

#### **Enhanced Configuration System**

- **NEW**: `GlobalConfig` class for centralized configuration
- **NEW**: Top-level configuration functions for better DX
- Support for configuration presets (Laravel, API, Form)
- Environment-specific configurations
- Advanced validation options with hooks and custom type coercion

#### **Flexible Custom Rules System**

- **NEW**: Multiple ways to register custom rules:
  - Global rules: `extend('ruleName', definition)` or `Validator.extend()`
  - Instance rules: `validator.extend('ruleName', definition)`
- **NEW**: Enhanced `CustomRuleDefinition` interface
- **NEW**: Better parameter handling and async support

#### **Performance Improvements**

- **EXPERIMENTAL**: Performance monitoring and optimization features
- Caching system for compiled rules
- Optimized validation algorithms
- Memory leak prevention

#### **Advanced Validation Features**

- **NEW**: Conditional validation with `when()` method. This is still experimental.
- Enhanced file validation with dimension checking
- Network validation rules (IP, URL, etc.)
- Better async validation support

### 🔧 Improvements

#### **Enhanced Fluent API**

- More intuitive method chaining
- Better parameter validation
- Improved error messages

#### **Better Error Handling**

- Multiple error response formats (Laravel, flat, grouped, nested)
- Customizable error messages per field
- Multi-language support with language packs

#### **Development Experience**

- Better TypeScript support with strict typing
- Comprehensive test suite with integration tests
- Performance benchmarking tools
- Memory leak detection

### 🔄 Migration Guide

#### **From v1.x to v2.0**

##### **Configuration (Multiple Options)**

```javascript
// v1.x
import { configure } from 'validlyjs';
configure({ language: 'en' });

// v2.0 - Option 1: Top-level function (Recommended)
import { configure } from 'validlyjs';
configure({ language: 'en' });

// v2.0 - Option 2: Validator static method
import { Validator } from 'validlyjs';
Validator.configure({ language: 'en' });

// v2.0 - Option 3: Direct GlobalConfig (Advanced)
import { GlobalConfig } from 'validlyjs';
GlobalConfig.configure({ language: 'en' });
```

##### **Custom Rules (Multiple Options)**

```javascript
// v1.x
import { extend } from 'validlyjs';
extend('custom_rule', validator, message);

// v2.0 - Option 1: Top-level function (Recommended)
import { extend } from 'validlyjs';
extend('custom_rule', {
  validate: (value, params) => { /* validation logic */ },
  message: 'Custom validation message'
});

// v2.0 - Option 2: Validator static method
import { Validator } from 'validlyjs';
Validator.extend('custom_rule', {
  validate: (value, params) => { /* validation logic */ },
  message: 'Custom validation message'
});

// v2.0 - Option 3: Instance method (for specific validators)
const validator = new Validator({}, {});
validator.extend('custom_rule', {
  validate: (value, params) => { /* validation logic */ },
  message: 'Custom validation message'
});
```

##### **Basic Validation**

```javascript
// v1.x
import { Validator } from 'validlyjs';
const validator = new Validator(data, {
  email: 'required|email',
  age: 'required|numeric|min:18'
});

// v2.0
import { Validator, string, number } from 'validlyjs';
const validator = new Validator(data, {
  email: string().required().email(),
  age: number().required().min(18)
});
```

##### **Framework Integration**

```javascript
// v1.x
import { useValidator } from 'validlyjs';

// v2.0 - React
import { useValidation } from 'validlyjs/react';

// v2.0 - Vue
import { useValidation } from 'validlyjs/vue';
```

### 📦 Dependencies

#### **Updated**

- Upgraded to support Node.js 16+
- Better tree-shaking support
- Reduced bundle size through modular architecture

#### **New Peer Dependencies**

- `react` ^19.1.0 (optional, for React integration)
- `vue` ^3.5.17 (optional, for Vue integration)
- `fastify-plugin` ^5.0.1 (optional, for Fastify integration)

### 📚 Documentation

- **NEW**: Comprehensive documentation site
- **NEW**: API reference with TypeScript signatures
- **NEW**: Framework integration guides
- **NEW**: Performance optimization guide
- **NEW**: Migration guide from v1.x

### 🐛 Bug Fixes

- Fixed memory leaks in validation caching
- Improved error message formatting
- Better handling of edge cases in date validation
- Fixed issues with nested object validation

### 🧪 Testing

- **NEW**: Comprehensive test suite with 95%+ coverage
- **NEW**: Integration tests for all framework integrations
- **NEW**: Performance benchmarking tests
- **NEW**: Memory leak detection tests

### 🎯 Key Benefits of v2.0

1. **Flexible API**: Choose between top-level functions, static methods, or direct class access
2. **Better DX**: More intuitive imports and usage patterns
3. **Backward Compatibility**: Existing `Validator` methods still work
4. **Enhanced Performance**: Optimized validation engine with caching
5. **Framework Ready**: Built-in integrations for React, Vue, Express, and Fastify
6. **Type Safe**: Full TypeScript support with intelligent type inference

### 🔮 What's Next

- Enhanced documentation with interactive examples
- Additional framework integrations (Angular, Svelte)
- Performance optimizations for large datasets
- Advanced validation patterns and utilities

For detailed migration instructions and examples, see our [Migration Guide](./migration.md).
