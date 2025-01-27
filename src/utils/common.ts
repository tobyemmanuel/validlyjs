import { ValidationConfig } from '../types/interfaces.js';

/**
 * Prepares a value based on validation configuration
 * @param value - The value to prepare
 * @param config - Validation configuration options
 * @returns The prepared value
 * @throws Error if config is null/undefined
 */
export function prepareValue(value: any, config: ValidationConfig) {
  if (typeof value === 'string') {
    if (config.autoTrim) value = value.trim();
    if (config.convertEmptyStringToNull && value === '') return null;
  }
  return value;
}
