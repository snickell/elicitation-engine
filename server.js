var getConfig = require('./server/config').get;
var haventSetAdminPassword = require('./server/config').haventSetAdminPassword;

var baseURL = getConfig("BASE_URL");

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
  layoutsDir: viewsDir + "/layouts",
  partialsDir: viewsDir + "/partials"
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
var NZDB = require('./server/nzdb');
var db = new NZDB();


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
connectAssetsHelpers.baseURL = baseURL;

router.use('/public', express.static('public'));
router.use('/app/widgets/thumbnails', express.static('app/widgets/thumbnails'));

router.get('/', function (req, res) {  
  res.render('index', {
    title: req.originalUrl
  });
});

router.get(baseURL, function (req, res) {  
  res.render('index', {
    title: "Gorilla"
  });
});

if (getConfig("STANDALONE") || app.get('env') === 'development') {
  console.log("ELICITATION_STANDALONE || env=development: enabling standalone features");
  
  if (haventSetAdminPassword()) {
    console.error("\nWARNING WARNING WARNING: using default admin password, please set ELICITATION_STANDALONE_ADMIN_PASSWORD for security\n\n");
  }
  
  var adminRoutes = require('./server/routes/admin')(db, connectAssetsHelpers);
  router.use('/admin', adminRoutes);
  
  // Convenience authenticator for dev mode
  app.get('/authenticate-access-to-elicitation/:id', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ 
      personID: 2
    }));
  });
}

var elicitationRoutes = require('./server/routes/elicitation')(db, connectAssetsHelpers);
router.use('/', elicitationRoutes);

app.use(baseURL, router);

// FIXME: maybe should only do this in dev? think its ok for now...
app.use(errorHandler({ dumpExceptions: true, showStack: true }));

if (app.get('env') === 'development') {
  

}

http.createServer(app).listen(app.get('port'), function(){
  console.log("node process.version=", process.version);
  console.log("Express server listening on port " + app.get('port'));
});