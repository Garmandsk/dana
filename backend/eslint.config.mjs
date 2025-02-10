import globals from "globals";
import pluginJs from "@eslint/js";
import esLintDicoding from "eslint-config-dicodingacademy";

/** @type {import('eslint').Linter.Config[]} */
export default [
  esLintDicoding,
  {
    languageOptions: { 
      globals: globals.browser 
    }
  },
  pluginJs.configs.recommended,
];