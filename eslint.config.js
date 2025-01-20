const path = require("path");

module.exports = [
  {
    files: ["src/**/*.js"],
    plugins: {
      import: require("eslint-plugin-import"),
      "module-resolver": require("eslint-plugin-module-resolver"),
    },
    rules: {
      // Enforce the alias usage
      "module-resolver/use-alias": "error",
    },
    settings: {
      "import/resolver": {
        alias: {
          map: [
            // Map all files and subfolders under ./src/ to @tamaweb/*
            ["src/(.*)$", "@tamaweb/\\1"], // Updated regex
          ],
          extensions: [".js", ".jsx", ".ts", ".tsx"], // File extensions to resolve
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
];
