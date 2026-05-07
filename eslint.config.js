import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import astroPlugin from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
    js.configs.recommended,
    ...astroPlugin.configs['flat/recommended'],
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            'jsx-a11y': jsxA11y,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    },
    {
        ignores: ['dist/', '.astro/', 'node_modules/'],
    },
];
