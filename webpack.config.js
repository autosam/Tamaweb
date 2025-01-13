const path = require('path');

module.exports = {
  entry: './src/index.js', // Replace with your actual entry point
  output: {
    filename: 'bundle.js', // Output file
    path: path.resolve(__dirname, 'dist'), // Output directory
    // library: 'MyApp', // Assign to a global variable
    // libraryTarget: 'window', // Attach to the global window object
  },
  mode: 'development', // Change to 'production' for production builds
  module: {
    rules: [
      {
        test: /\.js$/, // Target JavaScript files
        exclude: /src\/libs/, // Exclude everything in the src/libs directory
        use: {
          loader: 'babel-loader', // Example loader (e.g., for transpiling JS)
        },
      },
      // Add other loaders here if needed
    ],
  },
};
