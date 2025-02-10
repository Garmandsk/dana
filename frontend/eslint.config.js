import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: { 
      globals: globals.browser 
    },
    rules: {
      "prefer-const": ["error", { "ignoreReadBeforeAssign": true }],
      "no-unused-vars": "error",
    }
  },
  pluginJs.configs.recommended,
];