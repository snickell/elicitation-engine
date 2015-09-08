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
  
      db.getElicitationAndAssets(elicitationID, personID, function (err, models) {
        var startEditing = false;
        var embedded = false;

        setupViewModel(db, models, "Elicitation.View+", startEditing, embedded, function (err, viewModel) {      
          res.render('elicitation-backend-layout', viewModel);
        });
      }); 
    });
  });
  
  return router;
}
