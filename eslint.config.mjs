import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default defineConfig(
  {
    ignores: [
      'dist/',
      '.astro/',
      '.recdr/',
      'src/assets/demo/',
      'test-results/',
      'playwright-report/',
      '.lighthouseci/',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
  },
  ...astro.configs.recommended,
);
