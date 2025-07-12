module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      },
      project: './tsconfig.json'
    },
    plugins: [
      '@typescript-eslint',
      'prettier'
    ],
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      '@typescript-eslint/recommended-requiring-type-checking',
      'prettier'
    ],
    env: {
      browser: true,
      node: true,
      es6: true,
      jest: true
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-const': 'error',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': false,
          'ts-check': false
        }
      ],
      
      // Import/Export rules
      'no-duplicate-imports': 'error',
      
      // General JavaScript rules
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'no-param-reassign': 'error',
      'no-return-assign': 'error',
      'no-useless-return': 'error',
      'no-useless-concat': 'error',
      'no-useless-escape': 'error',
      
      // Code style
      'curly': 'error',
      'eqeqeq': ['error', 'always'],
      'no-nested-ternary': 'warn',
      'no-unneeded-ternary': 'error',
      
      // Prettier integration
      'prettier/prettier': 'error'
    },
    overrides: [
      {
        // Test files
        files: [
          '**/__tests__/**/*.ts',
          '**/*.test.ts',
          '**/*.spec.ts'
        ],
        rules: {
          '@typescript-eslint/no-explicit-any': 'off',
          '@typescript-eslint/no-non-null-assertion': 'off',
          'no-console': 'off'
        }
      },
      {
        // Configuration files
        files: [
          '*.config.js',
          '*.config.ts',
          '.eslintrc.js',
          'rollup.config.js',
          'jest.config.js',
          'vite.config.ts'
        ],
        rules: {
          '@typescript-eslint/no-var-requires': 'off',
          'no-console': 'off'
        }
      },
      {
        // React integration files
        files: [
          'src/integrations/react/**/*.ts',
          'src/integrations/react/**/*.tsx'
        ],
        parserOptions: {
          ecmaFeatures: {
            jsx: true
          }
        },
        rules: {
          '@typescript-eslint/no-explicit-any': 'warn'
        }
      },
      {
        // Vue integration files
        files: [
          'src/integrations/vue/**/*.ts',
         'src/integrations/vue/**/*.tsx'
        ],
        parserOptions: {
          ecmaFeatures: {
            jsx: true
          }
        },
        rules: {
          '@typescript-eslint/no-explicit-any': 'warn'
        }
      }
    ]
  };