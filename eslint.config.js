// eslint.config.js
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [".next/**", "node_modules/**", "infra/migrations/**"],
  },

  {
    files: ["**/*.js", "**/*.jsx"],
    rules: {
      semi: "error",
      "prefer-const": "error",
    },
  },
]);
