var express = require('express');
var router = express.Router();
var authenticateAccessTo = require('../../elicitation/auth');

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var busboy = require('connect-busboy');
var busboyMiddle = busboy();
var fastCSV = require('fast-csv');

var Promise = require('bluebird');
// FIXME: should only use in dev, not prod
Promise.longStackTraces();

module.exports = function (db, assetHelpers) {
  var dbHelper = require('../../elicitation/db-helper')(db);



  router.get('/:id', function (req, res, next) {
    var elicitationID = parseInt(req.params.id);
    
    dbHelper.authAndLoad("priorData", elicitationID, req, res, { requireModOrAdmin: true })
    .then(function (m) {
      var viewModel = {
        iAmThe: "Walrus"
      };
      
      return res.render('moderator/prior-data', viewModel);
    })
    .catch(authenticateAccessTo.RedirectToLoginError, 
      redirect => res.redirect(redirect.url)
    )
    .catch(function (e) {
      next(e);
    });
  });


  function updateVariablePresets(elicitationID, presets) {
    return db.transaction(function (t) {
      return db.models.TaskAssignment.update(
        { VariablePresets: null },
        {
          where: {
            Task_ID: elicitationID,
            Discriminator: 'ElicitationAssignment'
          },
          transaction: t,
        }
      ).then(function () {
        return Promise.all(
          presets.map(function (preset) {
            console.log("saving preset: ", preset);
            return db.models.TaskAssignment.update(
              { VariablePresets: JSON.stringify(preset) },
              {
                where: {
                  Task_ID: elicitationID,
                  Person_ID: preset.personID,
                  Discriminator: 'ElicitationAssignment'
                },
                transaction: t,
              }
            );
          })                      
        );
      }).then(function () {
        console.log("All rows updated!!!");
      });
    })    
  }

  router.post('/:id', busboyMiddle, function (req, res, next) {
    var elicitationID = parseInt(req.params.id);
        
    dbHelper.authAndLoad("priorData", elicitationID, req, res, { requireModOrAdmin: true })
    .then(function (m) {
      req.pipe(req.busboy)
        .on('file', function(fieldname, file, filename, encoding, mimetype) {
          if (fieldname == "csv") {
            var rows = [];
            file
              .pipe(fastCSV({headers: true}))
              .on('data', data => rows.push(data))
              .on('end', function () {
                console.log("rows of the csv: ", rows);
                
              
                // FIXME: ok, now we have a bunch of row objects like...
                // [ { personID: '2', ' boo': ' i am the walrus', ' bam': ' banana' },  { personID: '5', ' boo': ' nada', ' bam': ' niente' } ]
                // 

                // 1) Implement TaskAssignment.VariablePresets in C# and migrate DB
                // 2) Uncomment server/nzdb-models/TaskAssignment.VariablePresets
                // 3) set priordata in elicitation-backend-layout.hbs
                // 4) bind to customScriptingVariables in app           
                              
              
                updateVariablePresets(elicitationID, rows)
                .then(function () {
                  res.redirect("back")
                });
              });        
          }
        });
    })
    .catch(function (e) {
      next(e);
    });    
  });
  
  return router;
}