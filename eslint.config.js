import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // 무시할 파일
  { ignores: ['dist', 'node_modules', '.gemini'] },

  // JavaScript 기본 권장 규칙
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettier,
    },
    rules: {
      // React Hooks 규칙
      ...reactHooks.configs.recommended.rules,
      'react-hooks/static-components': 'off', // 컴포넌트 내부 컴포넌트 정의 허용
      'react-hooks/set-state-in-effect': 'warn', // Effect에서 setState warning으로 완화

      // React Refresh (HMR) 규칙
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Prettier 통합
      'prettier/prettier': 'error',

      // TypeScript 규칙 커스터마이징
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // 일반 규칙
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Prettier와 충돌하는 규칙 비활성화
  prettierConfig
);
