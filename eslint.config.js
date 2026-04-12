import js from "@eslint/js";
import globals from "globals";
import importPlugin from "eslint-plugin-import-x";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "functions/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs}"],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": "warn",
      "no-useless-assignment": "off",
      "preserve-caught-error": "off",
      "no-unused-expressions": "warn",
      "no-unused-labels": "warn",
      "no-var": "warn",
      "no-empty": "warn",
      "import/no-unresolved": "error",
      "import/named": "warn",
      "import/export": "warn",
      "import/no-duplicates": "warn",
      "import/first": "warn",
      "import/order": [
        "off",
        {
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/exports-last": "warn",
      "import/newline-after-import": "warn",
    },
  },
];
