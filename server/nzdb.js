var Sequelize = require('sequelize');
var colors = require('colors');

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
    dialectOptions: config.options,
    logging: function (s) {
      console.log(s.green);
    }
  });

  // this.sql = new Sequelize('seth', 'seth', '', { host: 'localhost', dialect: 'postgres' });
  
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

NZDB.prototype.seedDevServer = function () {  
  console.log("Syncing first...");
  
  return this.ready
  .bind(this)
  .then( () => this.sql.sync({ force: true }) )
  .then( () =>
    this.models.Person.create({ ID: 2, affiliation: "Code Toad Inc.", email: "dev@dev.com",
      FirstName: "Dev", LastName: "Account", Title: "Professor", 
      DoNotEmail: false, DoNotEmailActiveOptOut: false 
    })
  ).then( (person) =>
    this.models.Task.create({
      ID: 97,
      Created: Date.now(),
      ElicitationName: "Dev Elicitation",
      Discriminator: 'Elicitation',
      Modified: Date.now(),
      CompleteTaskInPopup: false,
      ShowResultsInDiscussion: false,
      NumCompleted: 0,
      NumAssigned: 0,
      ReviewToken: "60b4922a-5f47-11e5-9d70-feff819cdc9f",
      CompleteTaskBeforeDiscussion: false,
      CompletePageIncludeLinkToDiscussion: false,
      CompleteTaskInline: false,
      LastCompleted: Date.now()
    }).then( (elicitation) =>
      this.models.TaskAssignment.create({
        Task_ID: elicitation.ID,
        Person_ID: person.ID,
        Completed: false,
        Created: Date.now(),
        Modified: Date.now(),
        Modified: Date.now(),
        Discriminator: 'ElicitationAssignment'
      }).then( () => 
        this.models.ElicitationDefinition.create({
          Definition: "<elicitation><page title='hi'></page></elicitation>",
          Elicitation_ID: elicitation.ID,
          CreatedBy_ID: person.ID,
          Created: Date.now(),
          Modified: Date.now(),
        })
      ).then( (definition) =>
        elicitation.updateAttributes({ ElicitationDefinition_ID: definition.ID })
      )
    )
  ).then(function () {
    console.log("Created!")
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

NZDB.prototype.getElicitationForReview = function (reviewToken) {
  return this.models.Task.findOne({
    where: {
      ReviewToken: reviewToken,
      Discriminator: 'Elicitation'
    }
  })
}

NZDB.prototype.getElicitationAssignment = function (elicitationID, personID) {
  return this.models.TaskAssignment.findOne({
    where: {
      Task_ID: elicitationID,
      Person_ID: personID,
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
