import { GlobalConfig } from '../../types';

export const formPreset: Partial<GlobalConfig> = {
  responseType: 'grouped',
  language: 'en',
  stopOnFirstError: false,
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