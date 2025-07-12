# Vue Integration

Seamless Vue.js integration with composables and directives for reactive form validation.

## Installation

ValidlyJS provides first-class Vue.js support through composables and directives.

```bash
npm install validlyjs
```

### Plugin Registration (Optional)

```javascript
// main.js
import { createApp } from 'vue';
import { install as ValidlyJSPlugin } from 'validlyjs/vue';
import App from './App.vue';

const app = createApp(App);

// Register ValidlyJS directives globally
app.use(ValidlyJSPlugin);

app.mount('#app');
```

**Note:** Plugin registration is optional if you only use the `useValidation` composable.

## useValidation Composable

The `useValidation` composable provides reactive validation state management for Vue components.

### Basic Usage

```vue



import { reactive } from 'vue';
import { useValidation } from 'validlyjs/vue';
import { string } from 'validlyjs';

const form = reactive({
  email: '',
  password: ''
});

const rules = {
  email: string().required().email(),
  password: string().required().min(8)
};

const {
  errors,
  isValid,
  isValidating,
  validate,
  handleChange,
  handleBlur,
  getFieldError,
  hasFieldError,
  reset
} = useValidation(form, rules, {
  validateOnBlur: true,
  validateOnChange: true
});

const handleSubmit = async () => {
  const isFormValid = await validate();
  
  if (isFormValid) {
    console.log('Form submitted:', form);
    // Submit form data
  }
};
```

## Composable Options

The `useValidation` composable accepts various options to customize validation behavior:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| validateOnMount | boolean | false | Validate form when component mounts |
| validateOnChange | boolean | false | Validate fields on value change |
| validateOnBlur | boolean | true | Validate fields when they lose focus |

## Return Values

The composable returns reactive state and helper functions:

| Property | Type | Description |
| --- | --- | --- |
| errors | Reactive\<Record\<string, any>> | Validation errors for each field |
| isValid | Ref\<boolean> | Overall form validity |
| isDirty | Reactive\<Record\<string, boolean>> | Tracks which fields have been modified |
| touchedFields | Reactive\<Set\<string>> | Set of fields that have been touched |
| isValidating | Ref\<boolean> | Whether validation is in progress |
| hasErrors | ComputedRef\<boolean> | Whether any validation errors exist |
| errorCount | ComputedRef\<number> | Total number of validation errors |
| validate | Function | Validate form or specific field |
| handleChange | Function | Handle field value changes |
| handleBlur | Function | Handle field blur events |
| reset | Function | Reset validation state |
| getFieldError | Function | Get first error for a field |
| hasFieldError | Function | Check if field has errors |

## Advanced Examples

### Real-time Validation

```vue

  import { reactive } from 'vue';
  import { useValidation } from 'validlyjs/vue';
  import { string } from 'validlyjs';

  const form = reactive({
    username: '',
    email: ''
  });

  const rules = {
    username: string().required().min(3).max(20).alphaNum(),
    email: string().required().email()
  };

  const {
    isDirty,
    hasErrors,
    errorCount,
    handleChange,
    handleBlur,
    getFieldError,
    hasFieldError
  } = useValidation(form, rules, {
    validateOnChange: true,
    validateOnBlur: true
  });
```

### Custom Components

```vue




defineProps({
  id: String,
  label: String,
  type: { type: String, default: 'text' },
  modelValue: String,
  hasError: Boolean,
  isDirty: Boolean,
  errorMessage: String
});

defineEmits(['update:modelValue', 'blur']);






import { reactive } from 'vue';
import { useValidation } from 'validlyjs/vue';
import { string } from 'validlyjs';
import CustomInput from './CustomInput.vue';

const form = reactive({
  firstName: '',
  lastName: ''
});

const rules = {
  firstName: string().required().min(2),
  lastName: string().required().min(2)
};

const {
  isDirty,
  handleBlur,
  getFieldError,
  hasFieldError
} = useValidation(form, rules);
```

## Validation Directives

ValidlyJS provides Vue directives for declarative validation without composables, using string format rules for consistency.

### v-validate Directive

Apply validation rules directly to input elements using string format:

```vue



import { ref } from 'vue';

const email = ref('');
const username = ref('');
const password = ref('');



.error {
  border-color: #e74c3c;
  background-color: #fdf2f2;
}

.valid {
  border-color: #27ae60;
  background-color: #f2fdf2;
}

[data-error]::after {
  content: attr(data-error);
  color: #e74c3c;
  font-size: 0.875rem;
  display: block;
  margin-top: 0.25rem;
}
```

### v-validate-on Directive

Custom validation with event handling:

```vue



import { ref, reactive } from 'vue';

const username = ref('');
const validationState = reactive({});

const handleValidation = (result, element) => {
  validationState.username = result;
  
  // Custom styling
  if (result.isValid) {
    element.classList.remove('error');
    element.classList.add('valid');
  } else {
    element.classList.remove('valid');
    element.classList.add('error');
  }
};
```

### v-error-display Directive

Display validation errors for specific fields:

```vue



import { ref } from 'vue';

const email = ref('');
const password = ref('');

const handleValidation = (event) => {
  console.log('Validation result:', event.detail);
};
```

**Tip:** Use string format rules in directives for consistency with other validation formats.

## TypeScript Support

ValidlyJS provides full TypeScript support for Vue integration:

```typescript
// types.ts
export interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  preferences: {
    newsletter: boolean;
    notifications: boolean;
  };
}

// Component.vue

import { reactive } from 'vue';
import { useValidation } from 'validlyjs/vue';
import { string, number, object, boolean } from 'validlyjs';
import type { UserForm } from './types';

const form = reactive<UserForm>({
  firstName: '',
  lastName: '',
  email: '',
  age: 0,
  preferences: {
    newsletter: false,
    notifications: true
  }
});

const rules = {
  firstName: string().required().min(2),
  lastName: string().required().min(2),
  email: string().required().email(),
  age: number().required().min(18),
  preferences: object().shape({
    newsletter: boolean(),
    notifications: boolean()
  })
};

const {
  errors,
  isValid,
  validate,
  handleChange,
  handleBlur,
  getFieldError,
  hasFieldError
} = useValidation(form, rules, {
  validateOnBlur: true
});

// Type-safe field validation
const validateField = async (fieldName: keyof UserForm) => {
  return await validate(fieldName);
};
```

## Performance Tips

### Optimization Strategies

* **Debounce Input:** Use debouncing for real-time validation to avoid excessive validation calls.
* **Reactive Optimization:** Use `shallowReactive` for large forms to improve performance.
* **Component Splitting:** Split large forms into smaller components for better performance and maintainability.
* **Conditional Validation:** Only validate touched fields to minimize unnecessary validation work.
