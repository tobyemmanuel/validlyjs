import { App } from 'vue';

// Export the main composable
export { useValidation } from './composables';
export type { UseValidationOptions } from './composables';

// Export directives
export {
  vValidate,
  vValidateOn,
  vErrorDisplay,
  install as directivesPlugin
} from './directives';

// Vue plugin
export const ValidlyPlugin = {
  install(app: App, options = {}) {
    // Install directives
    const { install } = require('./directives');
    install(app);
    
    // Provide global options if needed
    app.provide('validly-options', options);
  }
};

// Re-export core types for convenience
// export type {
//   ValidationResult,
//   ValidationError,
//   RuleDefinition,
//   ValidatorOptions
// } from '../../types';