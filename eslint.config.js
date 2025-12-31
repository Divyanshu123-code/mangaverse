// eslint.config.js

import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      globals: {
        // include browser and node globals
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      // you can spread recommended rules
      ...js.configs.recommended.rules,

      // React recommended
      ...reactPlugin.configs.recommended.rules,

      // React hooks plugin rules
      ...reactHooks.configs.recommended.rules,

      // Overwrites / your custom rules
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      // etc. add more custom ones you want
    }
  }
];