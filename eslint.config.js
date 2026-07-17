import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-template-curly-in-string': 'warn',
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'warn',
      'no-throw-literal': 'error',
      'no-return-assign': 'error',
      'no-self-compare': 'error',
      'no-unmodified-loop-condition': 'warn',
      'no-unreachable-loop': 'error',
      'no-useless-concat': 'warn',
      'no-useless-return': 'warn',
      'no-promise-executor-return': 'warn',
      'curly': ['error', 'multi-line'],
      'no-else-return': 'warn',
      'no-lonely-if': 'warn',
      'no-nested-ternary': 'warn',
      'no-unneeded-ternary': 'warn',
    }
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/__tests__/**',
    ]
  }
);
