var express = require('express');
var router = express.Router();

var Handlebars = require('handlebars');

var setupViewModel = require('./elicitation/view-model');
var includeStatic = require('./elicitation/static-includes');
var authenticateAccessTo = require('./elicitation/auth');

module.exports = function (db, assetHelpers) {

  router.get('/run/:id', function (req, res) {
    elicit(req, res, "Elicitation.View+", false, false);
  });
  
  router.get('/edit/:id', function (req, res) {
    elicit(req, res, "Elicitation.Edit+", true, false);
  }); 

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
  

  function elicit(req, res, logName, startEditing, embedded) {
    var elicitationID = parseInt(req.params.id);
    console.log(logName + "(" + elicitationID + ")");

    authenticateAccessTo(elicitationID, req, res, function (err, personID) {
      if (err) {
        res.status(404).send("Oh uh, something went wrong: " + err);
        return;
      }
  
      db.getElicitationAndAssets(elicitationID, personID, function (err, models) {
        renderElicitation(res, models, "Elicitation.View+", startEditing, embedded);
      }); 
    });    
  } 
  
/*
        [ModeratorsOnly]
        public ActionResult Edit(int id, int? revision) {
            var elicitation = getElicitationFromID(id);
            var elicitationViewModel = setupElicitation("Elicitation.Edit", elicitation, startEditing: true);

            if (revision != null) {
                var definition = db.ElicitationDefinitions.Find(revision);

                if (!elicitation.DefinitionHistory.Contains(definition)) throw new Exception("Specified definitionID " + revision + " is not in the history of elicitation");
                elicitationViewModel.elicitationDefinition = definition.Definition;
                elicitationViewModel.settings.notTheLatestRevision = true;
            }

            return View("Elicitation", elicitationViewModel);
        }
*/  
  
  return router;
}
