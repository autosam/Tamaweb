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
};
