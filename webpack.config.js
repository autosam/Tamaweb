const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [path.resolve(__dirname, "./modules")],
      },
    ],
  },
  resolve: {
    alias: {
      "@Activities": path.resolve(__dirname, "src/Activities"),
    },
    extensions: [".js"],
  },
};
