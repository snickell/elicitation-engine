var express = require('express');
var router = express.Router();

var Handlebars = require('handlebars');

var setupViewModel = require('./elicitation/view-model');
var includeStatic = require('./elicitation/static-includes');
var authenticateAccessTo = require('./elicitation/auth');

module.exports = function (db, assetHelpers) {

  router.get('/run/:id', function (req, res) {
    var elicitationID = parseInt(req.params.id);
    console.log("running elicitation #" + elicitationID + "#");

    authenticateAccessTo(elicitationID, req, res, function (err, personID) {
      if (err) {
        res.status(404).send("Oh uh, something went wrong: " + err);
        return;
      }
  
      db.getElicitationAndAssets(elicitationID, personID, function (err, result) {
        var elicitation = result.elicitation;
        var definition = result.definition;
    
        var startEditing = false;
        var embedded = false;
    
        var membership = {
          AllowModerator: true // FIXME: need to implement this
        };
    
        var person = {
          ID: result.person.ID,
          DisallowLoginViaAccessToken: false, // FIXME: what do we compute this from? see c# code
          access_token: result.person.access_token,
          email: result.person.email
        };
    
        var discussion = {
          category: "solar" // FIXME: need to implement this
        };

        setupViewModel(db, person, membership, "Elicitation.View+", elicitation, definition, discussion, startEditing, embedded, function (err, elicitationViewModel) {
          elicitationViewModel.helpers = {
            includeStatic: function(filename) { return new Handlebars.SafeString(includeStatic(filename)); },
            css: function(filename) { return new Handlebars.SafeString(assetHelpers.css(filename)); },
            js: function(filename) { return new Handlebars.SafeString(assetHelpers.js(filename)); },
            assetPath: function(filename) { return new Handlebars.SafeString(assetHelpers.assetPath(filename)); },
            jsonStringify: function(obj) { return new Handlebars.SafeString(JSON.stringify(obj)); }
          };
      
          elicitationViewModel.layout = false;
      
          res.render('elicitation-backend-layout', elicitationViewModel);
        });
      }); 
    });
  });
  
  return router;
}
