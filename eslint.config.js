import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'node_modules',
    'backend/**',
    'ai-nutrition-analyzer/**',
    'ai-nutrition-claude/**',
    'ai-nutrition-firebase/**',
    'nutriai-pro/backend/**',
    'nutriai-pro/ai-nutrition-analyzer/**',
    'nutriai-pro/ai-nutrition-claude/**',
    'nutriai-pro/ai-nutrition-firebase/**',
  ]),
  {
    files: ['src/**/*.{js,jsx}', 'nutriai-pro/src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', caughtErrors: 'none' }],
    },
  },
])
