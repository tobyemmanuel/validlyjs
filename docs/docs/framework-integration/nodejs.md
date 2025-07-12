
# Node.js Integration

Integrate ValidlyJS with popular Node.js frameworks like Express and Fastify for server-side validation.

## Installation

Install ValidlyJS for use with Node.js frameworks:

```bash
npm install validlyjs
```

**Note:** Ensure you have Express or Fastify installed for the respective integrations.

## Express Integration

Use ValidlyJS as Express middleware to validate request data from body, query, params, and headers.

### Basic Setup for Express

```javascript
import express from 'express';
import { ExpressValidator } from 'validlyjs/node';

const app = express();
app.use(express.json());

// Create validator instance
const validator = new ExpressValidator({
  errorStatus: 422,
  errorFormat: 'laravel'
});

// Validate request body
app.post('/users', 
  validator.body({
    name: 'required|string|min:2|max:50',
    email: 'required|email|unique:users',
    age: 'required|integer|min:18|max:120',
    password: 'required|string|min:8'
  }),
  (req, res) => {
    // Access validated data
    const { name, email, age, password } = req.validatedData;
    
    // Create user logic here
    res.json({ message: 'User created successfully' });
  }
);

app.listen(3000);
```

### Validation Sources

```javascript
// Validate request body
app.post('/users', 
  validator.body({
    name: 'required|string',
    email: 'required|email'
  }),
  handler
);

// Validate query parameters
app.get('/users', 
  validator.query({
    page: 'integer|min:1',
    limit: 'integer|min:1|max:100',
    search: 'string|max:255'
  }),
  handler
);

// Validate route parameters
app.get('/users/:id', 
  validator.params({
    id: 'required|integer|min:1'
  }),
  handler
);

// Validate multiple sources
app.put('/users/:id',
  validator.validate({
    // From params
    id: 'required|integer|min:1',
    // From body
    name: 'required|string|min:2',
    email: 'required|email'
  }, {
    sources: ['params', 'body']
  }),
  handler
);
```

### Express Options

```javascript
const validator = new ExpressValidator({
  // Data sources to validate
  sources: ['body', 'query', 'params', 'headers'],
  
  // HTTP status code for validation errors
  errorStatus: 422,
  
  // Error response format
  errorFormat: 'laravel', // 'laravel' | 'flat' | 'grouped' | 'nested'
  
  // Custom error handler
  onError: (errors, req, res) => {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }
});
```

### Custom Error Handling

```javascript
// Global error handler
const validator = new ExpressValidator({
  onError: (errors, req, res) => {
    // Log validation errors
    console.error('Validation failed:', errors);
    
    // Send custom response
    res.status(400).json({
      success: false,
      message: 'Invalid request data',
      errors: errors,
      timestamp: new Date().toISOString()
    });
  }
});

// Per-route error handling
app.post('/users',
  validator.body({
    email: 'required|email'
  }, {
    onError: (errors, req, res) => {
      res.status(422).json({
        message: 'Email validation failed',
        errors: errors
      });
    }
  }),
  handler
);
```

## Fastify Integration

ValidlyJS integrates seamlessly with Fastify using hooks and decorators:

### Basic Setup for Fastify

```javascript
import Fastify from 'fastify';
import { FastifyValidator } from 'validlyjs/node';

const fastify = Fastify({ logger: true });

// Register ValidlyJS plugin
await fastify.register(FastifyValidator, {
  errorStatus: 400,
  errorFormat: 'laravel'
});

// Route with validation
fastify.post('/users', {
  preValidation: fastify.validate({
    body: {
      name: 'required|string|min:2|max:50',
      email: 'required|email',
      age: 'required|integer|min:18'
    }
  })
}, async (request, reply) => {
  const { name, email, age } = request.validatedData;
  
  // User creation logic
  return { message: 'User created successfully' };
});

await fastify.listen({ port: 3000 });
```

### Schema-based Validation

```javascript
// Define reusable schemas
const userSchema = {
  name: 'required|string|min:2|max:50',
  email: 'required|email',
  age: 'required|integer|min:18|max:120'
};

const updateUserSchema = {
  name: 'string|min:2|max:50',
  email: 'email',
  age: 'integer|min:18|max:120'
};

// Use schemas in routes
fastify.post('/users', {
  preValidation: fastify.validate({ body: userSchema })
}, createUserHandler);

fastify.put('/users/:id', {
  preValidation: fastify.validate({
    params: { id: 'required|integer|min:1' },
    body: updateUserSchema
  })
}, updateUserHandler);
```

## Advanced Middleware Examples

### Authentication Validation

```javascript
// Validate authentication headers
const authValidator = new ExpressValidator({
  sources: ['headers'],
  errorStatus: 401
});

app.use('/api/protected', 
  authValidator.validate({
    authorization: 'required|string|regex:^Bearer [A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_.+/=]*$'
  }),
  (req, res, next) => {
    // Extract and verify JWT token
    const token = req.headers.authorization.split(' ')[1];
    // Token verification logic...
    next();
  }
);
```

### File Upload Validation

```javascript
import multer from 'multer';
import { Validator } from 'validlyjs';

const upload = multer({ dest: 'uploads/' });

// Register custom file validation rule
Validator.extend('fileValidation', {
  validate: (value, parameters, field, data, req) => {
    if (!req.file) {
      return false;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return false;
    }
    if (req.file.size > 5 * 1024 * 1024) { // 5MB
      return false;
    }
    return true;
  },
  message: 'The {field} must be a valid file (JPEG, PNG, or PDF) under 5MB'
});

app.post('/upload',
  upload.single('file'),
  validator.validate({
    title: 'required|string|max:255',
    description: 'string|max:1000',
    category: 'required|string|in:image,document,video',
    file: 'required|fileValidation'
  }, {
    sources: ['body', 'file']
  }),
  async (req, res) => {
    const { title, description, category } = req.validatedData;
    const file = req.file;
    // File processing logic
    res.json({ message: 'File uploaded successfully' });
  }
);
```

### Nested Object Validation

```javascript
app.post('/api/orders',
  validator.body({
    // Customer information
    'customer.name': 'required|string|max:100',
    'customer.email': 'required|email',
    'customer.phone': 'required|string|regex:/^\\+?[\\d\\s-()]+$/',
    
    // Shipping address
    'shipping.street': 'required|string|max:255',
    'shipping.city': 'required|string|max:100',
    'shipping.zipCode': 'required|string|regex:/^\\d{5}(-\\d{4})?$/',
    'shipping.country': 'required|string|size:2',
    
    // Order items
    'items': 'required|array|min:1',
    'items.*.productId': 'required|integer|exists:products,id',
    'items.*.quantity': 'required|integer|min:1|max:10',
    'items.*.price': 'required|numeric|min:0',
    
    // Payment
    'payment.method': 'required|string|in:credit_card,paypal,bank_transfer',
    'payment.amount': 'required|numeric|min:0'
  }),
  async (req, res) => {
    const orderData = req.validatedData;
    // Order processing logic
    res.json({ message: 'Order created successfully' });
  }
);
```

## Error Response Formats

### Laravel Format (Default)

```json
{
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required."],
    "email": ["The email must be a valid email address."],
    "age": ["The age must be at least 18."]
  }
}
```

### Flat Format

```json
{
  "message": "Validation failed",
  "errors": [
    "The name field is required.",
    "The email must be a valid email address.",
    "The age must be at least 18."
  ]
}
```

### Grouped Format

```json
{
  "message": "Validation failed",
  "errors": {
    "name": "The name field is required.",
    "email": "The email must be a valid email address.",
    "age": "The age must be at least 18."
  }
}
```

### Nested Format

```json
{
  "message": "Validation failed",
  "errors": {
    "customer": {
      "name": "The name field is required.",
      "email": "The email must be a valid email address."
    },
    "items": {
      "0": {
        "quantity": "The quantity must be at least 1."
      }
    }
  }
}
```

## TypeScript Support

ValidlyJS provides full TypeScript support for Node.js integrations:

```typescript
import { Request, Response } from 'express';
import { ExpressValidator, ExpressValidationOptions } from 'validlyjs/node';

interface UserCreateRequest {
  name: string;
  email: string;
  age: number;
}

const validator = new ExpressValidator({
  errorStatus: 422,
  errorFormat: 'laravel'
} as ExpressValidationOptions);

app.post('/users',
  validator.body({
    name: 'required|string|min:2|max:50',
    email: 'required|email',
    age: 'required|integer|min:18'
  }),
  (req: Request, res: Response) => {
    // req.validatedData is automatically typed
    const userData: UserCreateRequest = req.validatedData;
    
    res.json({ success: true });
  }
);
```

## Performance Tips

### Optimization Strategies

* **Reuse Validator Instances:** Create validator instances once and reuse them across routes.
* **Validate Early:** Place validation middleware early in your middleware stack.
* **Limit Sources:** Only validate the request sources you actually need.
* **Cache Rules:** For complex validation rules, consider caching the compiled rules.
* **Async Rules:** Use async validation sparingly and only when necessary.
* **Error Handling:** Implement efficient error handling to avoid unnecessary processing.

```javascript
// Efficient validator setup
const userValidator = new ExpressValidator({
  sources: ['body'], // Only validate body
  errorFormat: 'flat' // Simpler error format
});

// Reuse across multiple routes
const userValidationRules = {
  name: 'required|string|min:2|max:50',
  email: 'required|email'
};

app.post('/users', userValidator.body(userValidationRules), handler);
app.put('/users/:id', userValidator.body(userValidationRules), handler);
```
