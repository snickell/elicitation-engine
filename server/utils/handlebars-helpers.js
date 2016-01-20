var Handlebars = require('handlebars');
var includeStatic = require('../elicitation/static-includes');

module.exports = function (baseURL, assetHelpers) {
  return {
        includeStatic: function(filename) { return new Handlebars.SafeString(includeStatic(filename)); },
        css: function(filename) { return new Handlebars.SafeString(assetHelpers.css(filename)); },
        js: function(filename) { return new Handlebars.SafeString(assetHelpers.js(filename)); },
        assetPath: function(filename) { return new Handlebars.SafeString(assetHelpers.assetPath(filename)); },
        jsonStringify: function(obj) { return new Handlebars.SafeString(JSON.stringify(obj)); },
        publicPath: function(filename) { return new Handlebars.SafeString(baseURL + "/public/" + filename)}
  };
}