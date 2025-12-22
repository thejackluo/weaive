import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  prettier,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        __DEV__: 'readonly',
        fetch: 'readonly',
        // Browser/React Native globals
        performance: 'readonly',
        AbortController: 'readonly',
        Blob: 'readonly',
        FormData: 'readonly',
        URLSearchParams: 'readonly',
        FileReader: 'readonly',
        XMLHttpRequest: 'readonly',
        // Jest/testing globals
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'off', // Turn off base rule for TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_', // Ignore parameters starting with _
          varsIgnorePattern: '^_', // Ignore variables starting with _
          args: 'after-used', // Allow unused parameters before used ones
          ignoreRestSiblings: true,
        },
      ],

      // ===================================================================
      // Configuration Consistency Rules (Story 0.9 - Critical)
      // ===================================================================
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'MemberExpression[object.object.name="process"][object.property.name="env"][property.name=/^EXPO_PUBLIC_API/]',
          message:
            '❌ Do not use process.env.EXPO_PUBLIC_API_* for API URLs. Use getApiBaseUrl() from @/utils/api instead. This ensures consistent configuration across all services.',
        },
        {
          selector:
            'VariableDeclarator[id.name="API_BASE_URL"][init.type="LogicalExpression"][init.left.object.object.name="process"]',
          message:
            '❌ Do not hardcode API_BASE_URL with process.env fallback. Use: const API_BASE_URL = getApiBaseUrl();',
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        jest: 'readonly',
      },
      ecmaVersion: 2021,
      sourceType: 'module',
    },
  },
  {
    ignores: [
      'node_modules',
      '.expo',
      'dist',
      'build',
      '.vscode',
      'tailwind.config.js',  // CommonJS config file
      'jest.setup.js',  // Jest setup with class field syntax
      'src/_archive/**',  // Archived code from old implementations
    ],
  },
];
