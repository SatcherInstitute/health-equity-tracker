module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript'
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['tsconfig.json']
  },
  plugins: [
    'react'
  ],
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    quotes: 'off',
    '@typescript-eslint/quotes': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    '@typescript-eslint/semi': 'off',
    '@typescript-eslint/explicit-function-return-type': "off",
    '@typescript-eslint/space-before-function-paren': "off",
    '@typescript-eslint/strict-boolean-expressions': "off",
    '@typescript-eslint/indent': "off",
    "react/react-in-jsx-scope": "off",
    '@typescript-eslint/restrict-plus-operands': "off",
    '@typescript-eslint/require-array-sort-compare': "off",
    '@typescript-eslint/ban-ts-comment': "off",
    'react/no-unescaped-entities': "off",
    "multiline-ternary": "off",
    "react/prop-types": "off"
  }
}
