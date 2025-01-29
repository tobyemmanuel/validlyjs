import { useEffect, useState } from "react";
import { Validator } from '../../core/Validator.js';
import type { ValidationResult } from '../../core/Validator.js';

export function useValidator<T extends Record<string, any>>(
  schema: any,
  initialData: T
): {
  validate: (data: T) => Promise<boolean>;
  errors: Record<string, string[]>;
  resetErrors: () => void;
} {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const validator = new Validator<T>(schema);

  const validate = async (data: T): Promise<boolean> => {
    const result = await validator.validateAsync(data);

    const normalizedErrors: Record<string, string[]> = {};
    for (const key in result.errors) {
      normalizedErrors[key] = result.errors[key] || [];
    }

    setErrors(normalizedErrors);
    return result.isValid;
  };

  const resetErrors = () => setErrors({});

  // Optionally validate initial data on mount
  useEffect(() => {
    validate(initialData);
  }, []);

  return { validate, errors, resetErrors };
}
