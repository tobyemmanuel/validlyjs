module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/__tests__/**/*.test.tsx',
    '<rootDir>/src/**/__tests__/**/*.spec.ts',
    '<rootDir>/src/**/__tests__/**/*.spec.tsx',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.test.tsx',
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/**/*.spec.tsx',
  ],

  // TypeScript configuration
  transform: {
    '^.+\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'ES2020',
          module: 'CommonJS',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true,
        },
      },
    ],
    '^.+\.vue$': '@vue/vue3-jest',
  },

  // Allow Jest to transform ESM packages
  transformIgnorePatterns: ['node_modules/(?!(file-type)/)'],

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/core/(.*)$': '<rootDir>/src/core/$1',
    '^@/parsers/(.*)$': '<rootDir>/src/parsers/$1',
    '^@/rules/(.*)$': '<rootDir>/src/rules/$1',
    '^@/fluent/(.*)$': '<rootDir>/src/fluent/$1',
    '^@/messages/(.*)$': '<rootDir>/src/messages/$1',
    '^@/response/(.*)$': '<rootDir>/src/response/$1',
    '^@/config/(.*)$': '<rootDir>/src/config/$1',
    '^@/extensions/(.*)$': '<rootDir>/src/extensions/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/integrations/(.*)$': '<rootDir>/src/integrations/$1',
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'vue'],
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setup.ts',
    '<rootDir>/src/__tests__/setup-vue.ts',
  ],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  globals: {
    'ts-jest': {
      useESM: false,
    },
  },
};
