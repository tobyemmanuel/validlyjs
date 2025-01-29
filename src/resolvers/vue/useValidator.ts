import { ref } from "vue";
import { Validator } from "../../core/Validator.js";
import type { ValidationResult } from "../../core/Validator.js";

export function useValidator<T extends Record<string, any>>(
  schema: any,
  initialData: T
) {
  const errors = ref<Record<string, string[]>>({});
  const validator = new Validator<T>(schema);

  const validate = async (data: T): Promise<boolean> => {
    const result = await validator.validateAsync(data);

    const normalizedErrors: Record<string, string[]> = {};
    for (const key in result.errors) {
      normalizedErrors[key] = result.errors[key] || [];
    }

    errors.value = normalizedErrors;
    return result.isValid;
  };

  const resetErrors = () => {
    errors.value = {};
  };

  // Optionally validate initial data on mount
  validate(initialData);

  return { validate, errors, resetErrors };
}
