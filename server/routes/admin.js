var express = require('express');
var router = express.Router();

var Handlebars = require('handlebars');
var authenticateAccessTo = require('../elicitation/auth');
var handlebarsHelpers = require('../utils/handlebars-helpers');

var Promise = require('bluebird');
// FIXME: should only use in dev, not prod
Promise.longStackTraces();

module.exports = function (db, assetHelpers) {

  router.get('/', function (req, res, next) {
    res.render('admin', {
      helpers: handlebarsHelpers(req.baseUrl, assetHelpers)
    });
  });
  
  return router;
}
    