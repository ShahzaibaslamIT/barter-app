/** Admin app ESLint config — extends the shared base. root:true so it doesn't
 *  merge upward into any parent config. */
module.exports = {
  root: true,
  // require.resolve (Node, honors the package "exports" map) → absolute path.
  // ESLint 8's own resolver ignores "exports", so resolving the bare specifier
  // here is what makes the shared config load in this pnpm workspace.
  extends: [require.resolve("@barter/config/eslint/base")],
};
