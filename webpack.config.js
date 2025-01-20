import path from "path";

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development",
  resolve: {
    alias: { "@tamaweb/*": path.resolve(__dirname, "./src/*") },
    extensions: [".js"],
  },
};
