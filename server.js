
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


var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

var config = {
  server: undefined,
  userName: undefined,
  password: undefined
  ,options: {
    debug: {
      packet: true,
      data: true,
      payload: true,
      token: false,
      log: true
    },
    database: 'NearZero',
    encrypt: true // for Azure users
  }
};

var connectionString = process.env['SQLAZURECONNSTR_DefaultConnection'];
var ncsBuilder=require('node-connection-string-builder');
var builder=new ncsBuilder(connectionString);
if (builder.dataSource) {
    var ds=builder.dataSource.split('\\', 2);
    config.server=ds[0] || config.server; 
    var instanceName=ds[1] || config.options.instanceName;
    if (instanceName)
        config.options.instanceName=instanceName;
}
config.userName=builder.userID || config.userName;
config.password=builder.password || config.password;
config.options.encrypt=builder.encrypt || config.options.encrypt;
config.options.database=builder.initialCatalog || config.options.database;

console.log("Config is", config);

var connection = new Connection(config);

connection.on('connect', function(err) {
    // If no error, then good to go...
    executeStatement();
  }
);

var dbMessage = "";

function executeStatement() {
  request = new Request("select name from Discussions", function(err, rowCount) {
    if (err) {
      console.log(err);
    } else {
      console.log(rowCount + ' rows');
    }

    connection.close();
  });

  request.on('row', function(columns) {
    columns.forEach(function(column) {
      if (column.value === null) {
        console.log('NULL');
      } else {
        console.log(column.value);
        dbMessage += ", " + column.value;
      }
    });
  });

  request.on('done', function(rowCount, more) {
    console.log(rowCount + ' rows returned');
  });

  // In SQL Server 2000 you may need: connection.execSqlBatch(request);
  connection.execSql(request);
}

app.get('/', function (req, res) {
    res.render('home', {
        title: "bumpy"
    });
});

app.get('/noodlefactory', function (req, res) {
    res.render('noodlefactory', {
        value: "skimpy",
        cloudProvider: process.env.CloudProvider,
        thing: dbMessage,
        test: process.env['SQLAZURECONNSTR_DefaultConnection'],
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
