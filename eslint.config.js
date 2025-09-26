// minimal eslint config for Vite React
import js from "@eslint/js";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    plugins: { react },
    languageOptions: { ecmaVersion: "latest", sourceType: "module" },
    rules: { "react/react-in-jsx-scope": "off" }
  }
];