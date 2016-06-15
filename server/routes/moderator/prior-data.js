var express = require('express');
var router = express.Router();

var authenticateAccessTo = require('../../elicitation/auth');
var handlebarsHelpers = require('../../utils/handlebars-helpers');

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
      return db.models.TaskAssignment.findAll({ 
        where: {
            Task_ID: elicitationID,
            Discriminator: 'ElicitationAssignment'
        }
      }).then(function (assignments) {
        var viewModel = {
          priorDatas: assignments.map(a => ({
              personID: a.Person_ID, 
              priorData: a.PriorData || "no prior data"
          })),
          layout: "moderator-page",
          helpers: handlebarsHelpers(assetHelpers),
          title: "Prior Data"          
        };
        
        return res.render('moderator/prior-data', viewModel);        
      })
      
    })
    .catch(authenticateAccessTo.RedirectToLoginError, 
      redirect => res.redirect(redirect.url)
    )
    .catch(function (e) {
      next(e);
    });
  });


  function updatePriorData(elicitationID, priorDatas) {
    return db.transaction(function (t) {
      return db.models.TaskAssignment.update(
        { PriorData: null },
        {
          where: {
            Task_ID: elicitationID,
            Discriminator: 'ElicitationAssignment'
          },
          transaction: t,
        }
      ).then(function () {
        console.log("Blanked existing priorDatas");
        var p = Promise.resolve();
        priorDatas.forEach(function (priorData) {
          p = p.then(function () {
            console.log("saving priordata: ", priorData);            
            return db.models.TaskAssignment.update(
              { PriorData: JSON.stringify(priorData) },
              {
                where: {
                  Task_ID: elicitationID,
                  Person_ID: priorData.personID,
                  Discriminator: 'ElicitationAssignment'
                },
                transaction: t,
              }
            ).catch(function (e) {
              console.log("Error trying to update one of the priordatas", e);
            });
          });          
        });
        return p;
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
            var priorDatas = [];
            file
              .pipe(fastCSV({headers: true}))
              .on('data', data => priorDatas.push(data))
              .on('end', function () {
                console.log("rows of the csv: ", priorDatas);
                
              
                // FIXME: ok, now we have a bunch of row objects like...
                // [ { personID: '2', ' boo': ' i am the walrus', ' bam': ' banana' },  { personID: '5', ' boo': ' nada', ' bam': ' niente' } ]
                // 

                // 0) debug updateVariablePresets
                // 1) Implement TaskAssignment.VariablePresets in C# and migrate DB
                // 2) Uncomment server/nzdb-models/TaskAssignment.VariablePresets
                // 3) set priordata in elicitation-backend-layout.hbs
                // 4) bind to customScriptingVariables in app 
                              
              
                updatePriorData(elicitationID, priorDatas)
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