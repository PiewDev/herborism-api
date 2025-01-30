import globals from 'globals';
import pluginJs from '@eslint/js';
import standard from 'eslint-config-standard';
import pluginN from 'eslint-plugin-n';
import pluginPromise from 'eslint-plugin-promise';
import pluginImport from 'eslint-plugin-import';

const config = [
  {
    files: ['*.{js,mjs,cjs}', '**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        globalThis: 'readonly'
      }
    }
  },
  pluginJs.configs.recommended,
  {
    plugins: {
      n: pluginN,
      import: pluginImport,
      promise: pluginPromise
    },
    rules: {
      ...standard.rules,
      semi: ['error', 'always'], // Requiere punto y coma
      curly: ['error', 'all'], // Bloques con llaves siempre
      'brace-style': ['error', '1tbs', { allowSingleLine: false }],
      indent: ['error', 2, { SwitchCase: 1 }], // 2 espacios, 1 nivel para `case`
      'space-before-blocks': ['error', 'always'],
      'space-in-parens': ['error', 'never'],
      'space-before-function-paren': ['error', 'always'],
      'keyword-spacing': ['error', { before: true, after: true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      quotes: ['error', 'single', { avoidEscape: true }], // Comillas simples, pero permite dobles si es necesario
      'eol-last': ['error', 'always']
    }
  },
  {
    ignores: ['coverage/', 'dist/', 'lib/']
  }
];

export default config;
