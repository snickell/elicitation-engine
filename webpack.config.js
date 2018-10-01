var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  debug: true,
  devtool: 'eval-source-map',
  entry: {
    app: './app/index.js',
    vendor: './app/vendor.js',
    elicitationEditor: './app/elicitation-editor.js'
  },
  output: {
    path: './public/dist/dev',
    filename: '[name].js'
  },
  resolve: {
    alias: {
      ember: path.join(__dirname, './app/webpack-shims/ember'),
      app: path.join(__dirname, './app'),
      eat: path.join(__dirname, './app')
    },
    modulesDirectories: ["web_modules", "node_modules"]    
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: [ 
          /node_modules/, 
          path.join(__dirname, './public/libs'), 
          path.join(__dirname, './app/eval-in-scope.es3.js') // not compat with strict mode
        ],
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },   
			{ test: /\.png$/,    loader: "url-loader?prefix=img/&limit=5000" },
			{ test: /\.jpg$/,    loader: "url-loader?prefix=img/&limit=5000" },
			{ test: /\.gif$/,    loader: "url-loader?prefix=img/&limit=5000" },      
      /*
      {
        test: /\.hbs$/,
        include: /app\/templates/,
        loader: 'ember-webpack-loaders/htmlbars-loader'
      },
      {
        test: /app\/app\.js/,
        loader: 'ember-webpack-loaders/inject-templates-loader!ember-webpack-loaders/inject-modules-loader'
      },*/
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({name: "vendor"}),
    new webpack.optimize.CommonsChunkPlugin({name: "elicitationEditor", chunks: ['elicitationEditor']}),
    new ExtractTextPlugin("[name].css"),
    // new webpack.optimize.UglifyJsPlugin()
  ],
  devServer: {
    contentBase: './dist'
  },
  node: {
    fs: 'empty'
  },
  stats: {
    children: false //surpress extract-text-plugin console spew
  }  
}
