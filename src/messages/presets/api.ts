import { GlobalConfig } from '../../types';

export const apiPreset: Partial<GlobalConfig> = {
  responseType: 'flat',
  language: 'en',
  stopOnFirstError: false,
  coercion: {
    enabled: false
  },
  performance: {
    cacheRules: true,
    optimizeUnions: true,
    parallelValidation: true,
    compileRules: true
  }
};