const path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: {
    js: './src/index.js',
  },
  output: {
    filename: 'bundle.js',
  },
  devServer: {
    port: 3000,
    contentBase: './src',
  }
}
