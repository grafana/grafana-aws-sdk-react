import grafanaConfig from '@grafana/eslint-config/flat.js';

export default [
  {
    ignores: ['**/node_modules', '**/build', '**/dist', '**/compiled'],
  },
  ...grafanaConfig,
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
];
