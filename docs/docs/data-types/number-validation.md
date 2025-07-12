# Number Validation

Comprehensive number validation with range checks, type validation, and mathematical constraints.

## Basic Number Validation

ValidlyJS provides robust number validation with support for integers, decimals, and various mathematical constraints.

### Fluent API

```javascript
import { Validator, number } from 'validlyjs_2';

const validator = new Validator({
  age: number().required().min(18).max(120),
  price: number().required().positive().decimal(2),
  quantity: number().required().integer().min(1)
});

const result = await validator.validate({
  age: 25,
  price: 19.99,
  quantity: 5
});
```

### String Format

```javascript
const validator = new Validator({
  age: 'required|number|min:18|max:120',
  price: 'required|number|positive|decimal:2',
  quantity: 'required|number|integer|min:1'
});
```

### Array Format

```javascript
const validator = new Validator({
  age: ['required', 'number', 'min:18', 'max:120'],
  price: ['required', 'number', 'positive', 'decimal:2'],
  quantity: ['required', 'number', 'integer', 'min:1']
});
```

## Available Number Rules

### min(value)

Validates that the number is greater than or equal to the specified minimum value.

```javascript
number().min(18)
// String: 'number|min:18'
```

### max(value)

Validates that the number is less than or equal to the specified maximum value.

```javascript
number().max(100)
// String: 'number|max:100'
```

### between(min, max)

Validates that the number is between the specified minimum and maximum values (inclusive).

```javascript
number().between(1, 100)
// String: 'number|between:1,100'
```

### positive()

Validates that the number is greater than zero.

```javascript
number().positive()
// String: 'number|positive'
```

### negative()

Validates that the number is less than zero.

```javascript
number().negative()
// String: 'number|negative'
```

### integer()

Validates that the number is an integer (whole number).

```javascript
number().integer()
// String: 'number|integer'
```

### decimal(places?)

Validates that the number is a decimal. Optionally specify the number of decimal places.

```javascript
number().decimal(2)
// String: 'number|decimal:2'

number().decimal()
// String: 'number|decimal'
```

### multipleOf(divisor)

Validates that the number is a multiple of the specified divisor.

```javascript
number().multipleOf(5)
// String: 'number|multiple_of:5'
```

## Common Use Cases

### Age Validation

```javascript
const ageValidator = new Validator({
  age: number().required().integer().min(0).max(150)
});

// Valid ages
await ageValidator.validate({ age: 25 }); // ✓
await ageValidator.validate({ age: 0 });  // ✓

// Invalid ages
await ageValidator.validate({ age: -5 });   // ✗ Below minimum
await ageValidator.validate({ age: 200 });  // ✗ Above maximum
await ageValidator.validate({ age: 25.5 }); // ✗ Not an integer
```

### Price Validation

```javascript
const priceValidator = new Validator({
  price: number().required().positive().decimal(2),
  discount: number().optional().between(0, 100).decimal(2)
});

// Valid prices
await priceValidator.validate({ 
  price: 19.99, 
  discount: 10.50 
}); // ✓

// Invalid prices
await priceValidator.validate({ price: -10 });     // ✗ Not positive
await priceValidator.validate({ price: 19.999 });  // ✗ Too many decimals
await priceValidator.validate({ discount: 150 });  // ✗ Above maximum
```

### Quantity and Inventory

```javascript
const inventoryValidator = new Validator({
  quantity: number().required().integer().min(1),
  batchSize: number().required().multipleOf(10).min(10),
  weight: number().required().positive().decimal(3)
});

// Valid inventory
await inventoryValidator.validate({
  quantity: 100,
  batchSize: 50,
  weight: 15.750
}); // ✓

// Invalid inventory
await inventoryValidator.validate({ quantity: 0 });      // ✗ Below minimum
await inventoryValidator.validate({ batchSize: 15 });    // ✗ Not multiple of 10
await inventoryValidator.validate({ weight: -5.2 });     // ✗ Not positive
```

## Error Messages

Number validation provides clear, specific error messages:

```javascript
const validator = new Validator({
  age: number().required().min(18).max(65)
});

const result = await validator.validate({ age: 15 });

console.log(result.errors);
// {
//   age: ['The age must be at least 18.']
// }
```

### Default Error Messages

| Rule | Default Message |
| --- | --- |
| min | The `{field}` must be at least `{min}`. |
| max | The `{field}` may not be greater than `{max}`. |
| between | The `{field}` must be between `{min}` and `{max}`. |
| positive | The `{field}` must be a positive number. |
| negative | The `{field}` must be a negative number. |
| integer | The `{field}` must be an integer. |
| decimal | The `{field}` must be a decimal number. |
| multipleOf | The `{field}` must be a multiple of `{divisor}`. |

## Performance Tips

### Use Specific Rules

Use `integer()` instead of `decimal(0)` for better performance with whole numbers.

### Range Validation

Use `between()` instead of separate `min()` and `max()` calls when possible.

### Avoid Unnecessary Precision

Don't specify more decimal places than needed - it affects both validation speed and memory usage.
