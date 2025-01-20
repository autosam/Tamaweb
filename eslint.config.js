import path from "path";
import eslintPluginImport from "eslint-plugin-import";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";

export default [
  {
    ignores: ["node_modules/**"],
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      import: eslintPluginImport,
      "no-relative-import-paths": noRelativeImportPaths,
    },
    rules: {
      "import/no-unresolved": "error",
      "import/order": ["warn", { groups: ["builtin", "external", "internal"] }],
      "no-relative-import-paths/no-relative-import-paths": [
        "warn",
        { allowSameFolder: false, rootDir: "./src" },
      ],
    },
    settings: {
      "import/resolver": {
        alias: {
          map: [["@tamaweb/*", "./src/*"]],
          extensions: [".js"],
        },
      },
    },
  },
];
