
# Date Validation

Comprehensive date validation with format checking, range validation, and timezone support.

## Basic Date Validation

ValidlyJS provides robust date validation with support for various date formats, ranges, and timezone handling.

### Fluent API

```javascript
import { Validator, date } from 'validlyjs';

const validator = new Validator({
  birthDate: date().required().before('2005-01-01'),
  appointmentDate: date().required().after(new Date()).weekday(),
  eventDate: date().required().format('YYYY-MM-DD').timezone('UTC')
});

const result = await validator.validate({
  birthDate: '1990-05-15',
  appointmentDate: '2024-03-15',
  eventDate: '2024-12-25'
});
```

### String Format

```javascript
const validator = new Validator({
  birthDate: 'required|date|before:2005-01-01',
  appointmentDate: 'required|date|after:today|weekday',
  eventDate: 'required|date|format:YYYY-MM-DD|timezone:UTC'
});
```

### Array Format

```javascript
const validator = new Validator({
  birthDate: ['required', 'date', 'before:2005-01-01'],
  appointmentDate: ['required', 'date', 'after:today', 'weekday'],
  eventDate: ['required', 'date', 'format:YYYY-MM-DD', 'timezone:UTC']
});
```

## Available Date Rules

### after(date)

Validates that the date is after the specified date.

```javascript
date().after('2024-01-01')
date().after(new Date())
// String: 'date|after:2024-01-01'
```

### before(date)

Validates that the date is before the specified date.

```javascript
date().before('2025-12-31')
date().before(new Date())
// String: 'date|before:2025-12-31'
```

### afterOrEqual(date)

Validates that the date is after or equal to the specified date.

```javascript
date().afterOrEqual('2024-01-01')
// String: 'date|after_or_equal:2024-01-01'
```

### beforeOrEqual(date)

Validates that the date is before or equal to the specified date.

```javascript
date().beforeOrEqual('2025-12-31')
// String: 'date|before_or_equal:2025-12-31'
```

### Relative dates

You can also use relative dates.

```javascript
date().before('today')
date().before('yesterday')
date().before('tomorrow')
date().before('now')
date().before('-1 day')
date().before('+2 days')
```

### format(format)

Validates that the date matches the specified format pattern.

```javascript
date().format('YYYY-MM-DD')
date().format('DD/MM/YYYY')
// String: 'date|format:YYYY-MM-DD'
```

### timezone(timezone)

Validates that the date is in the specified timezone.

```javascript
date().timezone('UTC')
date().timezone('America/New_York')
// String: 'date|timezone:UTC'
```

### weekday()

Validates that the date falls on a weekday (Monday-Friday).

```javascript
date().weekday()
// String: 'date|weekday'
```

### weekend()

Validates that the date falls on a weekend (Saturday-Sunday).

```javascript
date().weekend()
// String: 'date|weekend'
```

## Date Format Patterns

ValidlyJS supports various date format patterns for validation:

| Pattern | Description | Example |
| --- | --- | --- |
| YYYY-MM-DD | ISO 8601 date format | 2024-03-15 |
| DD/MM/YYYY | European date format | 15/03/2024 |
| MM/DD/YYYY | US date format | 03/15/2024 |
| YYYY-MM-DD HH:mm:ss | ISO 8601 datetime format | 2024-03-15 14:30:00 |
| DD-MM-YYYY | European with dashes | 15-03-2024 |
| YYYY/MM/DD | ISO with slashes | 2024/03/15 |
| YYYY/MM/DD | ISO with slashes | 2024/03/15 |

## Common Use Cases

### Birth Date Validation

```javascript
const birthDateValidator = new Validator({
  birthDate: date()
    .required()
    .before(new Date()) // Must be in the past
    .after('1900-01-01') // Reasonable minimum
    .format('YYYY-MM-DD')
});

// Valid birth dates
await birthDateValidator.validate({ birthDate: '1990-05-15' }); // ✓
await birthDateValidator.validate({ birthDate: '2000-12-25' }); // ✓

// Invalid birth dates
await birthDateValidator.validate({ birthDate: '2030-01-01' }); // ✗ Future date
await birthDateValidator.validate({ birthDate: '1850-01-01' }); // ✗ Too old
await birthDateValidator.validate({ birthDate: '15/05/1990' }); // ✗ Wrong format
```

### Appointment Scheduling

```javascript
const appointmentValidator = new Validator({
  appointmentDate: date()
    .required()
    .after(new Date()) // Must be in the future
    .weekday(), // Only weekdays
  
  followUpDate: date()
    .optional()
    .after('appointmentDate') // Must be after appointment
});

// Valid appointments
await appointmentValidator.validate({
  appointmentDate: '2024-03-18', // Monday
  followUpDate: '2024-03-25'
}); // ✓

// Invalid appointments
await appointmentValidator.validate({
  appointmentDate: '2024-03-16' // Saturday
}); // ✗ Weekend date
```

### Event Planning

```javascript
const eventValidator = new Validator({
  eventDate: date()
    .required()
    .after(new Date())
    .format('YYYY-MM-DD'),
  
  registrationDeadline: date()
    .required()
    .before('eventDate')
    .format('YYYY-MM-DD'),
  
  earlyBirdDeadline: date()
    .optional()
    .before('registrationDeadline')
    .format('YYYY-MM-DD')
});

// Valid event dates
await eventValidator.validate({
  eventDate: '2024-06-15',
  registrationDeadline: '2024-06-01',
  earlyBirdDeadline: '2024-05-15'
}); // ✓
```

## Timezone Support

ValidlyJS supports timezone validation for global applications:

```javascript
const globalEventValidator = new Validator({
  utcDate: date().required().timezone('UTC'),
  nyDate: date().required().timezone('America/New_York'),
  londonDate: date().required().timezone('Europe/London'),
  tokyoDate: date().required().timezone('Asia/Tokyo')
});

// Common timezone identifiers
const timezones = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
];
```

## Error Messages

Date validation provides clear, specific error messages:

```javascript
const validator = new Validator({
  eventDate: date().required().after('2024-01-01').weekday()
});

const result = await validator.validate({ 
  eventDate: '2023-12-25' 
});

console.log(result.errors);
// {
//   eventDate: ['The eventDate must be after 2024-01-01.']
// }
```

### Default Error Messages

| Rule | Default Message |
| --- | --- |
| after | The `{field}` must be after `{date}`. |
| before | The `{field}` must be before `{date}`. |
| afterOrEqual | The `{field}` must be after or equal to `{date}`. |
| beforeOrEqual | The `{field}` must be before or equal to `{date}`. |
| format | The `{field}` must match the format `{format}`. |
| timezone | The `{field}` must be in timezone `{timezone}`. |
| weekday | The `{field}` must be a weekday. |
| weekend | The `{field}` must be a weekend. |

## Performance Tips

### Use ISO Format

ISO 8601 format (YYYY-MM-DD) is fastest to parse and validate.

### Minimize Timezone Conversions

Store dates in UTC when possible to avoid timezone conversion overhead.

### Cache Date Objects

Reuse Date objects for comparison dates instead of creating new ones each time.
