var includeStatic = require('../elicitation/static-includes');

// The easiest way to make sure we have the /same/ version of handlebars
// as used inside express-handlebars is to create a blank instance, ugh.
var exphbs = require('express-handlebars');
var Handlebars = exphbs.create().handlebars;

module.exports = function (assetHelpers) {
  return {
        includeStatic: function(filename) { return new Handlebars.SafeString(includeStatic(filename)); },
        jsonStringify: function(obj) { return new Handlebars.SafeString(JSON.stringify(obj)); },
        publicPath: function(filename) { 
          var baseURLNoSlash = assetHelpers.baseURL.endsWith('/') ? assetHelpers.baseURL(0,-1) : assetHelpers.baseURL;          
          return new Handlebars.SafeString(baseURLNoSlash + "/public/" + filename);
        }
  };
}