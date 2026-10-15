import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', 'coverage/', '*.config.js', '.dependency-cruiser.cjs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
      'no-restricted-syntax': [
        'error',
        { selector: 'MethodDefinition[static=true]', message: 'Sem métodos estáticos (.claude/rules/arquitetura.md).' },
      ],
    },
  },
);
