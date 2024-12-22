const path = require('path');

module.exports = {
  entry: './index.js', // Correct path to the index.js file inside the package folder
    output: {
        filename: 'EW-bundle.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'ElectronicWidget',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: 'babel-loader', // Optional if you want to transpile code
        },
        ],
    },
};
