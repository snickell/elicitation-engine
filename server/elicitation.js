var express = require('express');
var router = express.Router();

var Handlebars = require('handlebars');

var elicitationViewModel = require('./elicitation/view-model');
var includeStatic = require('./elicitation/static-includes');
var authenticateAccessTo = require('./elicitation/auth');

module.exports = function (db, assetHelpers) {

  router.get('/run/:id', function (req, res) {
    elicit(req, res, "Elicitation.View+");
  });
  
  router.get('/edit/:id', function (req, res) {
    elicit(req, res, "Elicitation.Edit+", { 
      startEditing: true,
      modifyViewModel: function (viewModel) {
        /*
        if (revision != null) {
            var definition = db.ElicitationDefinitions.Find(revision);

            if (!elicitation.DefinitionHistory.Contains(definition)) throw new Exception("Specified definitionID " + revision + " is not in the history of elicitation");
            elicitationViewModel.elicitationDefinition = definition.Definition;
            elicitationViewModel.settings.notTheLatestRevision = true;
        }*/
        console.log("Modifying view model!");
        return viewModel;
      }
    });
  }); 

  function renderElicitation(req, res, models, logName, startEditing, embedded, modifyViewModel) {
    return elicitationViewModel(db, models, logName, startEditing, embedded)
    .then(modifyViewModel)
    .then(viewModel => {
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
  

  function elicit(req, res, logName, options) {
    var options = options || {};
    var startEditing = options.startEditing != undefined ? options.startEditing : false;
    var embedded = options.embedded != undefined ? options.embedded : false;
    var modifyViewModel = options.modifyViewModel || function (viewModel) { return viewModel; };
    
    var elicitationID = parseInt(req.params.id);
    console.log(logName + "(" + elicitationID + ")");

    authenticateAccessTo(elicitationID, req, res)
    .then(
      personID => db.getElicitationAndAssets(elicitationID, personID)
    )
    .then(
      models => renderElicitation(req, res, models, "Elicitation.View+", startEditing, embedded, modifyViewModel)
    ); 
    
  } 
  
  return router;
}
