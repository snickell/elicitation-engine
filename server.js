var baseURL = '/gorilla';

/**
* Module dependencies.
*/

var express = require('express');
var http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');

var exphbs  = require('express-handlebars');
var connectAssets = require('connect-assets');


var app = express();

var viewsDir = __dirname + "/server/views";

var expressHandlebars = exphbs.create({
  defaultLayout: "main",
  extname: ".hbs",
  layoutsDir: viewsDir + "/layouts"
});

var connectAssetsHelpers = {};

console.log("env is: ", app.get('env'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set port for azure web app environment
app.set('port', process.env.PORT || 3000);

// Use handlebars
app.engine('.hbs', expressHandlebars.engine);
app.set('view engine', '.hbs');
app.set('views', viewsDir);

// NZ Database
var connectionString = process.env['SQLAZURECONNSTR_DefaultConnection'];
var NZDB = require('./server/nzdb');
var db = new NZDB(connectionString);

// Setup basic app routes
var router = express.Router();

app.use(connectAssets({
  paths: [
    'app',
    'public'
  ],
  servePath: baseURL + "/assets",
  helperContext: connectAssetsHelpers
}));

router.use(express.static('public'));
router.use('/app/widgets/thumbnails', express.static('app/widgets/thumbnails'));

router.get('/', function (req, res) {  
  res.render('index', {
    title: req.originalUrl
  });
});

router.get('/gorilla', function (req, res) {  
  res.render('index', {
    title: "Gorilla"
  });
});

var elicitationRoutes = require('./server/elicitation')(db, connectAssetsHelpers);
router.use('/', elicitationRoutes);


app.use(baseURL, router);

if (app.get('env') === 'development') {
  app.use(errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});