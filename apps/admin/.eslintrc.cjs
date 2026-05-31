/** Admin app ESLint config — extends the shared base. root:true so it doesn't
 *  merge upward into any parent config. */
module.exports = {
  root: true,
  extends: ["@barter/config/eslint/base"],
};
