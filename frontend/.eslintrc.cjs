module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'standard-with-typescript',
    "plugin:tailwindcss/recommended",
    'prettier',
  ],
  overrides: [],
  ignorePatterns: ['**/*.spec.ts', 'geographies.json'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['tsconfig.json'],
  },
  plugins: ['react', 'jsx-a11y'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    'react/no-unescaped-entities': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/require-array-sort-compare': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'multiline-ternary': 'off',
    'react/prop-types': 'off',
    'tailwindcss/classnames-order': 'off',
    'tailwindcss/migration-from-tailwind-2': 'off',
    'tailwindcss/no-custom-classname': [1,{"whitelist": ["mode\\-selector\\-box", "mode\\-selector\\-box\\-mobile"]}],
  },
}
