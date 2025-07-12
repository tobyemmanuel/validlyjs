import { ref, reactive, watch, onMounted, computed } from 'vue';
import { Validator, ValidationResult, RuleDefinition, ValidatorOptions } from 'validlyjs';

export interface UseValidationOptions extends ValidatorOptions {
  validateOnMount?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useValidation<T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, RuleDefinition>,
  options?: UseValidationOptions
) {
  const errors = reactive<Record<string, any>>({});
  const isValid = ref(true);
  const isDirty = reactive<Record<string, boolean>>({} as Record<string, boolean>);
  const touchedFields = reactive<Set<string>>(new Set());
  const isValidating = ref(false);

  const validator = new Validator(rules, options);

  const validate = async (fieldName?: keyof T & string): Promise<boolean> => {
    isValidating.value = true;

    try {
      let result: ValidationResult;

      if (fieldName) {
        const fieldData = { [fieldName]: data[fieldName] };
        result = await validator.validate(fieldData);

        // Clear previous errors for this field
        if (errors[fieldName]) {
          delete errors[fieldName];
        }

        // Set new errors if any (directly use result.errors as your validation class handles the format)
        if (result.errors && typeof result.errors === 'object') {
          if (fieldName in result.errors) {
            errors[fieldName] = result.errors[fieldName as keyof typeof result.errors];
          }
        }

        const hasAnyErrors = Object.keys(errors).length > 0;
        isValid.value = !hasAnyErrors;

        return !errors[fieldName];
      } else {
        result = await validator.validate(data);

        // Clear all errors
        Object.keys(errors).forEach(key => {
          delete errors[key];
        });

        // Set new errors (directly use result.errors as your validation class handles the format)
        if (result.errors && typeof result.errors === 'object') {
          Object.assign(errors, result.errors);
        }

        isValid.value = result.isValid;
        return result.isValid;
      }
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    } finally {
      isValidating.value = false;
    }
  };

  const handleChange = (fieldName: keyof T & string, _value: any) => {
    isDirty[fieldName] = true;

    if (options?.validateOnChange && touchedFields.has(fieldName)) {
      validate(fieldName);
    }
  };

  const handleBlur = (fieldName: keyof T & string) => {
    touchedFields.add(fieldName);

    if (options?.validateOnBlur !== false) {
      validate(fieldName);
    }
  };

  const reset = () => {
    Object.keys(errors).forEach(key => {
      delete errors[key];
    });
    isValid.value = true;
    Object.keys(isDirty).forEach(key => {
      delete isDirty[key];
    });
    touchedFields.clear();
    isValidating.value = false;
  };

  const getFieldError = (fieldName: keyof T & string): string | undefined => {
    const fieldErrors = errors[fieldName];
    if (Array.isArray(fieldErrors)) {
      return fieldErrors[0];
    }
    return fieldErrors;
  };

  const hasFieldError = (fieldName: keyof T & string): boolean => {
    const fieldErrors = errors[fieldName];
    if (Array.isArray(fieldErrors)) {
      return fieldErrors.length > 0;
    }
    return !!fieldErrors;
  };

  const hasErrors = computed(() => {
    return Object.keys(errors).length > 0;
  });

  const errorCount = computed(() => {
    return Object.values(errors).reduce((count, errs) => {
      if (Array.isArray(errs)) {
        return count + errs.length;
      }
      return count + (errs ? 1 : 0);
    }, 0);
  });

  watch(() => ({ ...data }), () => {
    if (options?.validateOnChange) {
      for (const field of touchedFields) {
        validate(field);
      }
    }
  }, { deep: true });

  onMounted(() => {
    if (options?.validateOnMount) {
      validate();
    }
  });

  return {
    errors,
    isValid,
    isDirty,
    touchedFields,
    isValidating,
    hasErrors,
    errorCount,
    validate,
    handleChange,
    handleBlur,
    reset,
    getFieldError,
    hasFieldError,
  };
}