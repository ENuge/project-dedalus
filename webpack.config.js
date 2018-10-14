const path = require('path');
const fs = require('fs');

module.exports = {
  mode: 'development',
  entry: './index.jsx',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              ...JSON.parse(fs.readFileSync(path.resolve(__dirname, './.babelrc'))),
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
