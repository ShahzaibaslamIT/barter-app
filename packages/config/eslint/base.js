/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: false,
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ],
    "@typescript-eslint/no-explicit-any": "warn"
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "dist/",
    "build/",
    "coverage/",
    "*.config.js",
    "*.config.mjs"
  ]
};
