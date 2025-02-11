module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: 'tsconfig.json',
      tsconfigRootDir: __dirname,
      sourceType: 'module',
    },
    plugins: [
      '@typescript-eslint/eslint-plugin',
      'import',
      'prettier'
    ],
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/typescript',
    ],
    root: true,
    env: {
      node: true,
      jest: true,
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
      // Naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        // variablelar va funksiyalar uchun camelCase
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE']
        },
        {
          selector: 'function',
          format: ['camelCase']
        },
        // class va decoratorlar uchun PascalCase
        {
          selector: 'class',
          format: ['PascalCase']
        },
        {
          selector: 'decorator',
          format: ['PascalCase']
        },
        // konstantalar uchun UPPER_CASE
        {
          selector: 'enum',
          format: ['UPPER_CASE']
        },
      ],
      
      // Import tartibini tekshirish
      'import/order': [
        'error',
        {
          'groups': [
            'builtin',    // node "builtin" modullari
            'external',   // npm package'lar
            'internal',   // loyiha ichki modullari
            ['parent', 'sibling'], // relative importlar
            'index',     // index fayllar
            'object',    // object importlar
            'type'       // type importlar
          ],
          'newlines-between': 'always',
          'alphabetize': {
            'order': 'asc',
            'caseInsensitive': true
          }
        }
      ],
  
      // Async/await bilan ishlash
      '@typescript-eslint/explicit-function-return-type': 'error',
      'no-return-await': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
  
      // Try-catch bloklar
      'no-try-catch-finally': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
    }
  };