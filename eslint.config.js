import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
  {
    ignores: [".next/**", "node_modules/**", "infra/migrations/**"],
  },

  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      semi: "error",
      "prefer-const": "error",
    },
  },
]);
