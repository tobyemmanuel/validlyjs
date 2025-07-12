# Array & Object Validation

Comprehensive validation for arrays and objects with support for nested structures, length constraints, and shape validation.

## Array Validation

ValidlyJS provides powerful array validation capabilities including length constraints, element validation, uniqueness checks, and positional validation.

### Basic Array Validation

```javascript
import { Validator, array, string, number } from 'validlyjs_2';

const validator = new Validator({
  tags: array().required().min(1).max(10).each(string().min(2)),
  scores: array().required().length(5).each(number().min(0).max(100)),
  categories: array().optional().unique().each(string().in(['tech', 'design', 'business']))
});

const result = await validator.validate({
  tags: ['javascript', 'validation', 'library'],
  scores: [85, 92, 78, 96, 88],
  categories: ['tech', 'design']
});
```

### String Format

```javascript
const validator = new Validator({
  tags: 'required|array|min:1|max:10',
  'tags.*': 'string|min:2',
  scores: 'required|array|length:5',
  'scores.*': 'number|min:0|max:100'
});
```

### Array Format

```javascript
const validator = new Validator({
  tags: ['required', 'array', 'min:1', 'max:10'],
  'tags.*': ['string', 'min:2'],
  scores: ['required', 'array', 'length:5'],
  'scores.*': ['number', 'min:0', 'max:100']
  'students.0': ['string', 'min:0', 'max:100']
});
```

## Available Array Rules

### min(length)

Validates that the array has at least the specified number of elements.

```javascript
array().min(3)
// String: 'array|min:3'
```

### max(length)

Validates that the array has at most the specified number of elements.

```javascript
array().max(10)
// String: 'array|max:10'
```

### length(length)

Validates that the array has exactly the specified number of elements.

```javascript
array().length(5)
// String: 'array|length:5'
```

### each(rule)

Validates that each element in the array passes the specified rule.

```javascript
array().each(string().email())
// String: 'array.*|string|email'
```

### unique()

Validates that all elements in the array are unique.

```javascript
array().unique()
// String: 'array|unique'
```

### contains(value)

Validates that the array contains the specified value.

```javascript
array().contains('admin')
// String: 'array|contains:admin'
```


## Object Validation

ValidlyJS provides comprehensive object validation with shape validation, key constraints, and strict mode for preventing additional properties.

### Basic Object Validation

```javascript
import { Validator, object, string, number, boolean } from 'validlyjs_2';

const validator = new Validator({
  user: object().required().shape({
    name: string().required().min(2),
    age: number().required().min(18),
    email: string().required().email(),
    isActive: boolean().required()
  }),
  settings: object().optional().strict().shape({
    theme: string().in(['light', 'dark']),
    notifications: boolean()
  })
});

const result = await validator.validate({
  user: {
    name: 'John Doe',
    age: 25,
    email: 'john@example.com',
    isActive: true
  },
  settings: {
    theme: 'dark',
    notifications: true
  }
});
```

### Nested Object Validation

```javascript
const validator = new Validator({
  profile: object().required().shape({
    personal: object().required().shape({
      firstName: string().required().min(2),
      lastName: string().required().min(2),
      birthDate: string().required() // date validation
    }),
    contact: object().required().shape({
      email: string().required().email(),
      phone: string().optional(),
      address: object().optional().shape({
        street: string().required(),
        city: string().required(),
        zipCode: string().required().regex(/^\d{5}$/)
      })
    }),
    preferences: object().optional().shape({
      language: string().in(['en', 'es', 'fr']),
      timezone: string().required(),
      notifications: object().shape({
        email: boolean(),
        sms: boolean(),
        push: boolean()
      })
    })
  })
});
```

## Available Object Rules

### shape(schema)

Validates that the object matches the specified schema structure.

```javascript
object().shape({
  name: string().required(),
  age: number().min(0)
})
// String: Use nested field notation
```

### keys(keys)

Validates that the object contains only the specified keys.

```javascript
object().keys(['name', 'email', 'age'])
// String: 'object|keys:name,email,age'
```

### strict()

Validates that the object contains no additional properties beyond those defined in the schema.

```javascript
object().strict().shape({
  name: string(),
  email: string()
})
// String: 'object|strict'
```

## Common Use Cases

### User Registration Form

```javascript
const registrationValidator = new Validator({
  user: object().required().strict().shape({
    profile: object().required().shape({
      firstName: string().required().min(2).max(50),
      lastName: string().required().min(2).max(50),
      email: string().required().email(),
      password: string().required().min(8),
      confirmPassword: string().required()
    }),
    preferences: object().optional().shape({
      newsletter: boolean(),
      notifications: boolean(),
      language: string().in(['en', 'es', 'fr', 'de'])
    }),
    interests: array().optional().min(1).max(5).each(
      string().in(['technology', 'sports', 'music', 'travel', 'food'])
    ).unique()
  })
});

// Valid registration data
await registrationValidator.validate({
  user: {
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123'
    },
    preferences: {
      newsletter: true,
      notifications: false,
      language: 'en'
    },
    interests: ['technology', 'travel']
  }
}); // ✓
```

### API Configuration

```javascript
const configValidator = new Validator({
  database: object().required().shape({
    host: string().required(),
    port: number().required().min(1).max(65535),
    name: string().required(),
    credentials: object().required().shape({
      username: string().required(),
      password: string().required().min(8)
    })
  }),
  cache: object().optional().shape({
    enabled: boolean(),
    ttl: number().min(0),
    providers: array().min(1).each(
      string().in(['redis', 'memcached', 'memory'])
    )
  }),
  features: object().optional().shape({
    logging: object().shape({
      level: string().in(['debug', 'info', 'warn', 'error']),
      destinations: array().each(string())
    }),
    security: object().shape({
      cors: object().shape({
        origins: array().each(string().url()),
        methods: array().each(string().in(['GET', 'POST', 'PUT', 'DELETE']))
      })
    })
  })
});

// Valid configuration
await configValidator.validate({
  database: {
    host: 'localhost',
    port: 5432,
    name: 'myapp',
    credentials: {
      username: 'admin',
      password: 'securepassword'
    }
  },
  cache: {
    enabled: true,
    ttl: 3600,
    providers: ['redis']
  },
  features: {
    logging: {
      level: 'info',
      destinations: ['console', 'file']
    },
    security: {
      cors: {
        origins: ['https://example.com'],
        methods: ['GET', 'POST']
      }
    }
  }
}); // ✓
```

### E-commerce Product

```javascript
const productValidator = new Validator({
  product: object().required().shape({
    basic: object().required().shape({
      name: string().required().min(3).max(100),
      description: string().required().min(10).max(1000),
      sku: string().required().regex(/^[A-Z]{2,3}-\d{4,6}$/),
      category: string().required().in(['electronics', 'clothing', 'books'])
    }),
    pricing: object().required().shape({
      price: number().required().min(0),
      currency: string().required().length(3),
      discounts: array().optional().each(
        object().shape({
          type: string().in(['percentage', 'fixed']),
          value: number().min(0),
          startDate: string(), // date
          endDate: string()    // date
        })
      )
    }),
    inventory: object().required().shape({
      quantity: number().required().min(0),
      lowStockThreshold: number().optional().min(0),
      locations: array().min(1).each(
        object().shape({
          warehouse: string().required(),
          quantity: number().min(0)
        })
      )
    }),
    media: object().optional().shape({
      images: array().min(1).max(10).each(string().url()),
      videos: array().optional().max(3).each(string().url()),
      documents: array().optional().each(
        object().shape({
          name: string().required(),
          url: string().required().url(),
          type: string().in(['manual', 'warranty', 'specification'])
        })
      )
    }),
    attributes: object().optional().shape({
      dimensions: object().optional().shape({
        length: number().min(0),
        width: number().min(0),
        height: number().min(0),
        weight: number().min(0)
      }),
      specifications: array().optional().each(
        object().shape({
          name: string().required(),
          value: string().required()
        })
      )
    })
  })
});
```

### Survey Response

```javascript
const surveyValidator = new Validator({
  response: object().required().shape({
    respondent: object().required().shape({
      id: string().required().uuid(),
      demographics: object().optional().shape({
        age: number().min(13).max(120),
        gender: string().in(['male', 'female', 'other', 'prefer_not_to_say']),
        location: string().optional()
      })
    }),
    answers: array().required().min(1).each(
      object().shape({
        questionId: string().required(),
        type: string().required().in(['text', 'choice', 'rating', 'boolean']),
        value: string().required(), // Will be validated based on type
        metadata: object().optional().shape({
          timeSpent: number().min(0),
          revisited: boolean()
        })
      })
    ),
    completion: object().required().shape({
      status: string().required().in(['complete', 'partial', 'abandoned']),
      startTime: string().required(), // ISO date
      endTime: string().optional(),   // ISO date
      totalTime: number().optional().min(0)
    })
  })
});

// Valid survey response
await surveyValidator.validate({
  response: {
    respondent: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      demographics: {
        age: 28,
        gender: 'female',
        location: 'New York'
      }
    },
    answers: [
      {
        questionId: 'q1',
        type: 'rating',
        value: '4',
        metadata: {
          timeSpent: 15,
          revisited: false
        }
      },
      {
        questionId: 'q2',
        type: 'text',
        value: 'Great product overall'
      }
    ],
    completion: {
      status: 'complete',
      startTime: '2024-01-15T10:30:00Z',
      endTime: '2024-01-15T10:45:00Z',
      totalTime: 900
    }
  }
}); // ✓
```

## Advanced Array Techniques

### Conditional Array Validation using when() [experimental]

This allows you to throw in more conditions into your validation. **It is only available in fluent api.**

```javascript
// Different validation based on array length
const validator = new Validator({
  items: array().required().min(1),
  'items.*': string().when('items', {
    length: { gte: 5 },
    then: string().min(10), // Longer strings for larger arrays
    otherwise: string().min(3)
  })
});

//You can handle non-array values directly with the operators
// Multiple conditions (you can combine operators)
const validator = new Validator({
  score: number().required(),
  feedback: string().when('score', {
    gt: 8, // Direct comparison for non-array values
    then: string().min(20), // Detailed feedback for high scores
    otherwise: string().min(5)
  })
});

const validator = new Validator({
  score: number().required(),
  feedback: string().when('name', {
    length: 8, // Direct comparison for non-array values
    then: string().min(20), // Detailed feedback for high scores
    otherwise: string().min(5)
  })
});

// Available operators
// gte = greater than or equal to
// gt = greater than
// lt = less than
// lte = less than or equal to
// eq = equal to
// length (for non-array values)

```

### Array of Objects with Unique Constraints

```javascript
const validator = new Validator({
  users: array().required().min(1).each(
    object().shape({
      id: string().required(),
      email: string().required().email(),
      role: string().in(['admin', 'user', 'moderator'])
    })
  ),
  // Ensure unique emails across all users
  'users.*.email': string().unique()
});

await validator.validate({
  users: [
    { id: '1', email: 'john@example.com', role: 'admin' },
    { id: '2', email: 'jane@example.com', role: 'user' }
  ]
}); // ✓
```

## Error Messages

Array and object validation provides clear, specific error messages:

```javascript
const validator = new Validator({
  tags: array().required().min(2).max(5).unique(),
  user: object().required().strict().shape({
    name: string().required(),
    age: number().required()
  })
});

const result = await validator.validate({
  tags: ['tag1'],
  user: {
    name: 'John',
    age: 25,
    extra: 'not allowed' // Extra property in strict mode
  }
});

console.log(result.errors);
// {
//   tags: ['The tags must have at least 2 items.'],
//   user: ['The user object contains unexpected properties: extra']
// }
```

### Default Error Messages

| Rule | Default Message |
| --- | --- |
| array.min | The `{field}` must have at least `{min}` items. |
| array.max | The `{field}` may not have more than `{max}` items. |
| array.length | The `{field}` must contain `{length}` items. |
| array.unique | The `{field}` has duplicate values. |
| array.contains | The `{field}` must contain `{value}`. |
| object.shape | The `{field}` must be a valid object. |
| object.keys | The `{field}` contains invalid keys. |
| object.strict | The `{field}` object contains unexpected properties: `{properties}`. |

## Performance Tips

### Shallow vs Deep

Use shallow validation when possible to improve performance on large nested structures.

### Early Validation

Validate array length before validating individual elements to fail fast.

### Schema Reuse

Define object schemas once and reuse them across multiple validators.

### Minimize Nesting

Keep object nesting levels reasonable for better performance and readability.
