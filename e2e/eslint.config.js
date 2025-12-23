import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        // Playwright globals
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off', // Allow console in test scripts
      'no-empty-function': 'off', // Allow empty test functions
    },
  },
  {
    files: ['tests/**/*.spec.ts', 'tests/**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
      'no-console': 'off', // Allow console logging in tests
    },
  },
  {
    ignores: [
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      '*.config.js',
      '*.config.ts',
      'run-e2e.js',
    ],
  },
];
