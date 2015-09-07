var Sequelize = require('sequelize');

var ncsBuilder = require('node-connection-string-builder');

var nzdbModels = require('./nzdb-models');


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

  this.sql = new Sequelize(config.database, config.userName, config.password, {
    host: config.server,
    dialect: 'mssql',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
    dialectOptions: {
      encrypt: true,
      database: 'NearZero'
    }
  });
  
  this.sql.authenticate()
      .then(function () {
          console.log("NZDB(): connected  via sequelize");
          console.log("Loaded");
          this.models = nzdbModels(this.sql, Sequelize);
          this.models.ElicitationDefinitions.findAll().then(function (bub) {
            console.log("found", bub);
          }).catch(function (err) { console.log("ERROR: ", err);}).done();
          
      }.bind(this));
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

NZDB.prototype.queryOne = function (query, params, cb) {
  this.query(query, params, function (err, rows) {
      if (err) {
        cb(err, null);
      } else if (rows.length == 1){
        cb(null, rows[0]);
      } else {
        cb("uhoh, more than 1 was returned", null);
      }
    }
  )  
}

NZDB.prototype.getElicitationDefinitionFromID = function(id, cb) {
  this.queryOne(
    "SELECT * FROM ElicitationDefinitions WHERE ID=@id",
    [
      { name: "id", type: TYPES.Int, value: id}
    ],    
    cb
  )
}

NZDB.prototype.getElicitationFromID = function (id, cb) {
  this.queryOne(
    "SELECT * FROM Tasks WHERE Discriminator='Elicitation' and ID=@id",
    [
      { name: "id", type: TYPES.Int, value: id}
    ],
    cb
  )
}

NZDB.prototype.getElicitationAndAssets = function(elicitationID, cb) {
  this.getElicitationFromID(elicitationID, function (err, elicitation) {
    if (err) {
      cb(err, null);
    } else {
      this.getElicitationDefinitionFromID(elicitation.ElicitationDefinition_ID, function (err, definition) {
        cb(null, {
          elicitation: elicitation,
          definition: definition
        });
      });
    }
  }.bind(this));
}

module.exports = NZDB;
