var Sequelize = require('sequelize');

var ncsBuilder = require('node-connection-string-builder');
var nzdbModels = require('./nzdb-models');


console.warn("Monkeypatching ('sequelize/lib/sql-string').dateToString to work with MSSQL datetime columns (see: https://github.com/sequelize/sequelize/issues/3892)");
var sqlString = require('sequelize/lib/sql-string');
var dateToString = sqlString.dateToString;
sqlString.dateToString = (d, tz, dialect) => dateToString(d, tz, 'mysql');


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
      database: '',
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

  this.sql = new Sequelize(config.options.database, config.userName, config.password, {
    host: config.server,
    dialect: 'mssql',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
    dialectOptions: config.options
  });
  
  this.ready = this.sql.authenticate()
  .then(function () {
    console.log("NZDB(): connected  via sequelize");  
    this.models = nzdbModels(this.sql, Sequelize);
  }.bind(this))
  .catch(function (err) { 
    console.log("NZDB(): couldn't auth with db: ", err);
    throw err;
  });
}

NZDB.prototype.transaction = function (t) {
  return this.sql.transaction(t);
}

NZDB.prototype.getElicitation = function (elicitationID) {
  return this.models.Task.findOne({
    where: {
      ID: elicitationID, 
      Discriminator: 'Elicitation' 
  }});  
}

NZDB.prototype.getElicitationAssignment = function (id) {
  return this.models.TaskAssignment.findOne({
    where: {
      ID: id, 
      Discriminator: 'ElicitationAssignment' 
  }});  
}

NZDB.prototype.getDiscussionMembership = function (discussionID, personID) {
  return this.models.DiscussionMembership.findOne({
    where: {
      discussion_ID: discussionID,
      Person_ID: personID
  }});  
}


NZDB.prototype.updateNumAssignedAndCompletedFromDB = function (elicitation, transaction) {  
  return this.models.TaskAssignment.count({ where: { Task_ID: elicitation.ID }, transaction: transaction })
  .then(function (numAssigned) {
    elicitation.NumAssigned = numAssigned;

    return this.models.TaskAssignment.count({ where: { Task_ID: elicitation.ID, Completed: true }, transaction: transaction });
  }.bind(this)).then(function (numCompleted) {    
    elicitation.NumCompleted = numCompleted;
    
    return elicitation;
  });
}

module.exports = NZDB;
