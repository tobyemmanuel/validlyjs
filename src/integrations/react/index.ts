// Export the main hook
export { useValidation } from './use-validation';
export type { UseValidationOptions } from './use-validation';

// Export components
export {
  ValidationProvider,
  ValidatedForm,
  ValidatedField,
  useValidationContext
} from './components';

export type {
  ValidationProviderProps,
  ValidatedFormProps,
  ValidatedFieldProps
} from './components';

// // Re-export core types for convenience
// export type {
//   ValidationResult,
//   ValidationError,
//   RuleDefinition,
//   ValidatorOptions
// } from '../../types';