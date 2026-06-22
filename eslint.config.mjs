import grafanaConfig from '@grafana/eslint-config';
import prettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: ['**/node_modules', '**/build', '**/dist', '**/compiled'],
  },
  ...grafanaConfig,
  {
    files: ['src/**/*.{ts,tsx}'],

    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },

    rules: {
      '@typescript-eslint/no-deprecated': 'warn',
    },
  },
  {
    settings: {
      react: {
        version: '18',
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
  },
  {
    plugins: {
      prettier: prettier,
    },

    rules: {
      'prettier/prettier': 'error',
    },
  },
];
