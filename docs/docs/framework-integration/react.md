# React Integration

Seamless form validation in React applications with the useValidation hook.

## Installation

ValidlyJS includes built-in React integration. Install the package using:

```bash
npm install validlyjs
```

**Note:** No additional packages are required for React integration.

## useValidation Hook

The `useValidation` hook provides comprehensive form validation with state management, real-time validation, and error handling.

### Basic Usage

```javascript
import React, { useState } from 'react';
import { useValidation, string, number } from 'validlyjs';

function UserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: ''
  });

  const {
    errors,
    isValid,
    validate,
    handleChange,
    handleBlur,
    getFieldError,
    hasFieldError
  } = useValidation(formData, {
    name: string().required().min(2).max(50),
    email: string().required().email(),
    age: number().required().min(18).max(120)
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    handleChange(field, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isFormValid = await validate();
    
    if (isFormValid) {
      console.log('Form is valid!', formData);
    }
  };

  return (
    
      
         handleInputChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          className={hasFieldError('name') ? 'error' : ''}
        />
        {hasFieldError('name') && (
          {getFieldError('name')}
        )}
      

      
         handleInputChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          className={hasFieldError('email') ? 'error' : ''}
        />
        {hasFieldError('email') && (
          {getFieldError('email')}
        )}
      

      
         handleInputChange('age', parseInt(e.target.value))}
          onBlur={() => handleBlur('age')}
          className={hasFieldError('age') ? 'error' : ''}
        />
        {hasFieldError('age') && (
          {getFieldError('age')}
        )}
      

      
        Submit
      
    
  );
}
```

## Hook Options

Configure validation behavior with these options:

```javascript
const validation = useValidation(formData, rules, {
  validateOnMount: true,     // Validate when component mounts
  validateOnChange: true,    // Validate on every change
  validateOnBlur: true,      // Validate when field loses focus
  
  // Standard Validator options
  stopOnFirstFailure: false,
  responseFormat: 'grouped',
  customMessages: {
    'email.required': 'Please enter your email address'
  }
});
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| validateOnMount | boolean | false | Run validation when component mounts |
| validateOnChange | boolean | false | Run validation on every field change |
| validateOnBlur | boolean | true | Run validation when field loses focus |

## Return Values

The `useValidation` hook returns an object with the following properties and methods:

| Property/Method | Type | Description |
| --- | --- | --- |
| errors | Record\<string, string[]> | Object containing validation errors for each field |
| isValid | boolean | Whether the entire form is valid |
| isDirty | Record\<string, boolean> | Tracks which fields have been modified |
| touchedFields | Set\<string> | Set of fields that have been touched (focused) |
| isValidating | boolean | Whether validation is currently running |
| validate(field?) | function | Manually trigger validation for all fields or a specific field |
| handleChange(field, value) | function | Handle field changes and trigger validation if configured |
| handleBlur(field) | function | Handle field blur events and trigger validation |
| reset() | function | Reset all validation state |
| getFieldError(field) | function | Get the first error message for a specific field |
| hasFieldError(field) | function | Check if a specific field has any errors |

## Advanced Examples

### Real-time Validation

```javascript
function RealTimeForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const validation = useValidation(formData, {
    username: string().required().min(3).max(20).alphaNum(),
    password: string().required().min(8),
    confirmPassword: string().required().same('password')
  }, {
    validateOnChange: true, // Real-time validation
    validateOnBlur: true
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validation.handleChange(field, value);
  };

  return (
    
      
         handleInputChange('username', e.target.value)}
          onBlur={() => validation.handleBlur('username')}
        />
        {validation.hasFieldError('username') && (
          
            {validation.errors.username.map((error, index) => (
              {error}
            ))}
          
        )}
      

      
         handleInputChange('password', e.target.value)}
          onBlur={() => validation.handleBlur('password')}
        />
        {validation.hasFieldError('password') && (
          {validation.getFieldError('password')}
        )}
      

      
         handleInputChange('confirmPassword', e.target.value)}
          onBlur={() => validation.handleBlur('confirmPassword')}
        />
        {validation.hasFieldError('confirmPassword') && (
          {validation.getFieldError('confirmPassword')}
        )}
      

      
        {validation.isValidating ? 'Validating...' : 'Submit'}
      
    
  );
}
```

### Custom Form Component

```javascript
function FormField({ 
  name, 
  type = 'text', 
  placeholder, 
  validation, 
  value, 
  onChange 
}) {
  return (
    
       onChange(name, e.target.value)}
        onBlur={() => validation.handleBlur(name)}
        className={validation.hasFieldError(name) ? 'error' : ''}
      />
      {validation.hasFieldError(name) && (
        
          {validation.getFieldError(name)}
        
      )}
    
  );
}

function UserRegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: ''
  });

  const validation = useValidation(formData, {
    firstName: string().required().min(2).max(50),
    lastName: string().required().min(2).max(50),
    email: string().required().email(),
    phone: string().required().regex(/^\+?[\d\s-()]+$/),
    age: number().required().min(18).max(120)
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validation.handleChange(field, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validation.validate();
    
    if (isValid) {
      // Submit form
      console.log('Submitting:', formData);
    }
  };

  return (
    
      
      
      
      
      
      
      
      
      

      
        Register
      
    
  );
}
```

## TypeScript Support

ValidlyJS provides full TypeScript support with type inference:

```typescript
interface UserFormData {
  name: string;
  email: string;
  age: number;
}

function TypedUserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: 0
  });

  // Type-safe validation with full IntelliSense
  const validation = useValidation(formData, {
    name: string().required().min(2).max(50),
    email: string().required().email(),
    age: number().required().min(18).max(120)
  });

  // TypeScript will enforce correct field names
  const handleChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validation.handleChange(field, value);
  };

  return (
    
      {/* Your form JSX */}
    
  );
}
```

## Performance Tips

### Optimization Strategies

* **Debounce Real-time Validation:** Use debouncing for `validateOnChange` to avoid excessive validation calls.
* **Memoize Validation Rules:** Define validation rules outside the component or use `useMemo` to prevent recreation.
* **Validate Only Touched Fields:** Show errors only for fields that have been touched to improve UX.
