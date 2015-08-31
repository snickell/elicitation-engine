
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var ncsBuilder = require('node-connection-string-builder');

function connectionStringToConfig(connectionString) {
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
  
  return config;
}

var NZDB = function (connectionString) {
  var config = connectionStringToConfig(connectionString)
  this.connection = new Connection(config);

  this.connection.on('connect', function(err) {
    console.log("DB Connected");
  }); 
}

NZDB.prototype.query = function (query, params, cb) {
  var con = this.connection;
  
  var rowResults = [];
    
  request = new Request(query, function(err, rowCount) {
    if (err) {
      console.log(err);
    } else {
      console.log(rowCount + ' rows');
    }

    cb(err, rowResults);
  });
  
  params.forEach(function (param) {
    request.addParameter(param.name, param.type, param.value);
  });
    
  request.on('row', function(columns) {
    var result = {};
    
    columns.forEach(function(column) {
      result[column.metadata.colName] = column.value;
    });

    rowResults.push(result);
  });
    
  con.execSql(request);
}

NZDB.prototype.getElicitationFromID = function (id, cb) {
  this.query(
    "SELECT * FROM Tasks WHERE Discriminator='Elicitation' and ID=@id",
    [
      { name: "id", type: TYPES.Int, value: id}
    ],
    function (err, rows) {
      if (err) {
        cb(err, null);
      } else if (rows.length == 1){
        cb(null, rows[0]);
      } else {
        cb("uhoh, more than 1 elicitation was returned", null);
      }
    }
  )
}

module.exports = NZDB;
