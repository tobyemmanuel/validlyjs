import { useState, useEffect, useCallback } from 'react';
import {
  Validator,
  ValidationResult,
  RuleDefinition,
  ValidatorOptions,
  ValidationError,
} from 'validlyjs';

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
  const [errors, setErrors] = useState<Record<keyof T, string[]>>(
    {} as Record<keyof T, string[]>
  );
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isDirty, setIsDirty] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );
  const [touchedFields, setTouchedFields] = useState<Set<keyof T>>(new Set());
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const validator = new Validator(rules, options);

  const convertErrorsToFieldMap = (
    validationErrors: ValidationError[] | Record<string, string[]>
  ): Record<keyof T, string[]> => {
    const fieldErrors: Record<keyof T, string[]> = {} as Record<
      keyof T,
      string[]
    >;

    // Handle both array and object formats
    if (Array.isArray(validationErrors)) {
      validationErrors.forEach((error) => {
        const fieldKey = error.field as keyof T;
        if (!fieldErrors[fieldKey]) {
          fieldErrors[fieldKey] = [];
        }
        fieldErrors[fieldKey].push(error.message);
      });
    } else {
      // Handle grouped format (object)
      Object.entries(validationErrors).forEach(([field, messages]) => {
        const fieldKey = field as keyof T;
        fieldErrors[fieldKey] = Array.isArray(messages) ? messages : [messages];
      });
    }

    return fieldErrors;
  };

  const validate = useCallback(
    async (fieldName?: keyof T): Promise<boolean> => {
      setIsValidating(true);

      try {
        let result: ValidationResult;

        if (fieldName) {
          // Validate single field
          const fieldData = { [fieldName]: data[fieldName] };
          // const fieldRules = { [fieldName]: rules[fieldName] };
          result = await validator.validate(fieldData);

          // Handle both array and object error formats
          let fieldErrors: string[] = [];
          if (Array.isArray(result.errors)) {
            fieldErrors = result.errors
              .filter((err) => err.field === fieldName.toString())
              .map((err) => err.message);
          } else {
            // Handle grouped format
            fieldErrors = result.errors[fieldName as string] || [];
          }

          setErrors((prev) => ({
            ...prev,
            [fieldName]: fieldErrors,
          }));

          // Check if this field is valid
          const fieldIsValid = fieldErrors.length === 0;

          // Update overall validity by checking all current errors
          setErrors((currentErrors) => {
            const updatedErrors = {
              ...currentErrors,
              [fieldName]: fieldErrors,
            };
            const hasAnyErrors = Object.values(updatedErrors).some(
              (errs) => errs.length > 0
            );
            setIsValid(!hasAnyErrors);
            return updatedErrors;
          });

          return fieldIsValid;
        } else {
          // Validate all fields
          result = await validator.validate(data);
          const fieldErrors = convertErrorsToFieldMap(result.errors);

          setErrors(fieldErrors);
          setIsValid(result.isValid);

          return result.isValid;
        }
      } catch (error) {
        console.error('Validation error:', error);
        return false;
      } finally {
        setIsValidating(false);
      }
    },
    [data, rules, validator]
  );

  const handleChange = useCallback(
    (fieldName: keyof T, _value: any) => {
      setIsDirty((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      if (options?.validateOnChange && touchedFields.has(fieldName)) {
        validate(fieldName);
      }
    },
    [touchedFields, validate, options?.validateOnChange]
  );

  const handleBlur = useCallback(
    (fieldName: keyof T) => {
      const newTouchedFields = new Set(touchedFields);
      newTouchedFields.add(fieldName);
      setTouchedFields(newTouchedFields);

      if (options?.validateOnBlur !== false) {
        validate(fieldName);
      }
    },
    [touchedFields, validate, options?.validateOnBlur]
  );

  const reset = useCallback(() => {
    setErrors({} as Record<keyof T, string[]>);
    setIsValid(true);
    setIsDirty({} as Record<keyof T, boolean>);
    setTouchedFields(new Set());
    setIsValidating(false);
  }, []);

  const getFieldError = useCallback(
    (fieldName: keyof T): string | undefined => {
      return errors[fieldName]?.[0];
    },
    [errors]
  );

  const hasFieldError = useCallback(
    (fieldName: keyof T): boolean => {
      return (errors[fieldName]?.length || 0) > 0;
    },
    [errors]
  );

  useEffect(() => {
    if (options?.validateOnMount) {
      validate();
    }
  }, []);

  return {
    errors,
    isValid,
    isDirty,
    touchedFields,
    isValidating,
    validate,
    handleChange,
    handleBlur,
    reset,
    getFieldError,
    hasFieldError,
  };
}
