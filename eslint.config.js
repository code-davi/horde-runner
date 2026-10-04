// Limites definidos em docs/specs/2026-10-03-padroes-de-codigo.md §2.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import prettier from 'eslint-config-prettier';

const SIZE_OPTIONS = { skipBlankLines: true, skipComments: true };

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'test-results',
      'playwright-report',
      '.claude',
      '.superpowers',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintComments.recommended,
  prettier,
  {
    rules: {
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      'max-params': ['error', 3],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@eslint-community/eslint-comments/require-description': 'error',
    },
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      'max-lines': ['error', { max: 200, ...SIZE_OPTIONS }],
      'max-lines-per-function': ['error', { max: 40, ...SIZE_OPTIONS }],
      'no-console': 'error',
    },
  },
  {
    files: ['tests/**/*.ts'],
    rules: {
      'max-lines': ['error', { max: 300, ...SIZE_OPTIONS }],
    },
  },
  {
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'phaser', message: 'core/ contém só regras puras (ADR 0013).' }],
          patterns: [
            {
              group: ['**/game/**', '**/platform/**'],
              message: 'core/ não depende de game/ nem platform/.',
            },
          ],
        },
      ],
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage'],
    },
  },
  {
    files: ['src/platform/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['**/game/**'], message: 'platform/ não depende de game/.' }] },
      ],
    },
  },
);
