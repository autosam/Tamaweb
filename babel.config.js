module.exports = {
  presets: [
    // Add your presets here, e.g. '@babel/preset-env', '@babel/preset-react', etc.
  ],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./src"],
        alias: {
          "@tamaweb": "./src", // Add your alias mapping here
        },
      },
    ],
  ],
};
