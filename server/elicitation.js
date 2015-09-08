var express = require('express');
var router = express.Router();

var Handlebars = require('handlebars');

var setupViewModel = require('./elicitation/view-model');
var includeStatic = require('./elicitation/static-includes');
var authenticateAccessTo = require('./elicitation/auth');

module.exports = function (db, assetHelpers) {

  function renderElicitation(res, models, logName, startEditing, embedded) {
    setupViewModel(db, models, logName, startEditing, embedded, function (err, viewModel) {
      viewModel.helpers = {
        includeStatic: function(filename) { return new Handlebars.SafeString(includeStatic(filename)); },
        css: function(filename) { return new Handlebars.SafeString(assetHelpers.css(filename)); },
        js: function(filename) { return new Handlebars.SafeString(assetHelpers.js(filename)); },
        assetPath: function(filename) { return new Handlebars.SafeString(assetHelpers.assetPath(filename)); },
        jsonStringify: function(obj) { return new Handlebars.SafeString(JSON.stringify(obj)); }
      };
      viewModel.layout = false;
            
      res.render('elicitation-backend-layout', viewModel);
    });
  }
  

  router.get('/run/:id', function (req, res) {
    var elicitationID = parseInt(req.params.id);
    console.log("running elicitation #" + elicitationID + "#");

    authenticateAccessTo(elicitationID, req, res, function (err, personID) {
      if (err) {
        res.status(404).send("Oh uh, something went wrong: " + err);
        return;
      }
  
      db.getElicitationAndAssets(elicitationID, personID, function (err, models) {
        var startEditing = false;
        var embedded = false;
        renderElicitation(res, models, "Elicitation.View+", startEditing, embedded)
      }); 
    });
  });
  
  return router;
}
