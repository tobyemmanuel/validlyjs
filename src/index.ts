import { Validator as ValidatorClass } from './core/validator';

export { Validator } from './core/validator';
export { GlobalConfig } from './config/global-config';

// Export types
export type {
  ValidationResult,
  RuleDefinition,
  ValidatorOptions,
  ValidationError,
  GlobalConfig as GlobalConfigType,
  CustomRuleDefinition,
} from './types';

// Export builders
export {
  string,
  number,
  boolean,
  date,
  file,
  array,
  object,
  union,
} from './fluent';

// Convenience functions for better DX
/**
 * Configure global validation settings
 * @param config - Partial global configuration
 */
export function configure(config: Partial<import('./types').GlobalConfig>): void {
  return ValidatorClass.configure(config);
}

/**
 * Register a custom validation rule globally
 * @param name - Rule name
 * @param rule - Rule definition
 */
export function extend(name: string, rule: import('./types').CustomRuleDefinition): void {
  return ValidatorClass.extend(name, rule);
}

/**
 * Use a predefined configuration preset
 * @param preset - Preset name (laravel, api, form)
 */
export function usePreset(preset: string): void {
  return ValidatorClass.usePreset(preset);
}

/**
 * Create and apply a custom configuration preset
 * @param name - Preset name
 * @param config - Configuration to save as preset
 */
export function createPreset(name: string, config: Partial<import('./types').GlobalConfig>): void {
  return ValidatorClass.createPreset(name, config);
}

export const version = '2.0.0';
