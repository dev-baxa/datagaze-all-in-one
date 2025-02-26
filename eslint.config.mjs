// eslint.config.mjs
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginImport from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            import: eslintPluginImport,
            '@typescript-eslint': tseslint.plugin,
        },
        rules: {
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin', // 1. Node.js built-in modullari (fs, path, etc.)
                        'external', // 2. NPM orqali o'rnatilgan kutubxonalar
                        'internal', // 3. Loyiha ichidagi modullar
                        ['parent', 'sibling', 'index'], // 4. Boshqa nisbiy importlar
                    ],
                    'newlines-between': 'always', // Har bir guruh orasida 1 qator bo'sh joy qoldirish
                },
            ],

            // Naming conventions
            '@typescript-eslint/naming-convention': [
                'error',
                // Variable and function naming rule
                {
                    selector: ['variable', 'function'],
                    format: ['camelCase'],
                    leadingUnderscore: 'allow',
                },
                // Class and decorator naming rule
                {
                    selector: ['class', 'decorator'],
                    format: ['PascalCase'],
                },
                // Constant naming rule
                {
                    selector: 'variable',
                    modifiers: ['const', 'global'],
                    format: ['UPPER_CASE'],
                    leadingUnderscore: 'allow',
                },
                // Interface naming rule
                {
                    selector: 'interface',
                    format: ['PascalCase'],
                    prefix: ['I'],
                },
                // Type naming rule
                {
                    selector: 'typeAlias',
                    format: ['PascalCase'],
                },
            ],

            // TypeScript specific rules
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/explicit-module-boundary-types': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],

            // Async/await rules
            '@typescript-eslint/promise-function-async': 'error',
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/no-floating-promises': 'error',

          

            // General code style rules
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            eqeqeq: ['error', 'always'],
            'no-unused-expressions': 'error',
            'no-duplicate-imports': 'error',

            // Error handling
            'no-throw-literal': 'error',
            'handle-callback-err': 'error',
        },

        settings: {
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json',
                },
            },
        },
    },
    eslintConfigPrettier,
);
