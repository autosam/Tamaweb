const path = require("path");

module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
  ],
  plugins: ["import"],
  settings: {
    "import/resolver": {
      alias: {
        map: [["@Activities", path.resolve(__dirname, "src/Activities")]],
        extensions: [".js"],
      },
    },
  },
  rules: {
    "import/no-unresolved": "error",
    "import/order": ["warn", { groups: ["builtin", "external", "internal"] }],
  },
};
