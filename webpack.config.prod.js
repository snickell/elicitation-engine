var webpack = require('webpack');
var config = require('./webpack.config');

config.debug = false;
config.devtool = undefined;
config.plugins.push(new webpack.optimize.UglifyJsPlugin());
config.output.path = './public/dist';

module.exports = config;