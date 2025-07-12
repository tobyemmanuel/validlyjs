import { GlobalConfig } from '../../types';

export const laravelPreset: Partial<GlobalConfig> = {
  responseType: 'laravel',
  language: 'en',
  stopOnFirstError: true,
  coercion: {
    enabled: true,
    strings: true,
    numbers: true,
    booleans: true
  },
  performance: {
    cacheRules: true,
    optimizeUnions: true,
    parallelValidation: false,
    compileRules: true
  }
};