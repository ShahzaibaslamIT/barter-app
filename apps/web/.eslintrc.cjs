/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  // require.resolve (Node, honors the package "exports" map) → absolute path.
  // ESLint 8's own resolver ignores "exports", so resolving the bare specifier
  // here is what makes the shared config load in this pnpm workspace.
  extends: [require.resolve("@barter/config/eslint/base")]
};
