
/**
* Module dependencies.
*/

var express = require('express')
, http = require('http')
, path = require('path');

var exphbs  = require('express-handlebars');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);

  app.engine('handlebars', exphbs({defaultLayout: 'main'}));
  app.set('view engine', 'handlebars');

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var connectionString = process.env['SQLAZURECONNSTR_DefaultConnection'];
var NZDB = require('./nzdb');
var db = new NZDB(connectionString);



app.get('/', function (req, res) {  
  res.render('home', {
    title: "bumpy"
  });
});

app.get('/noodlefactory', function (req, res) {
  db.getElicitationFromID(97, function (err, results) {
    res.render('noodlefactory', {
      results: JSON.stringify(results),
    });
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
