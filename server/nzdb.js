var getConfig = require('./config').get;

var Sequelize = require('sequelize');
var colors = require('colors');

var nzdbModels = require('./nzdb-models');

function FIXME_monkeyPatchSequelizeForMSSQL() {
  console.warn("NZDB(): monkeypatching ('sequelize/lib/sql-string').dateToString to work with MSSQL datetime columns (see: https://github.com/sequelize/sequelize/issues/3892)");
  var sqlString = require('sequelize/lib/sql-string');
  var dateToString = sqlString.dateToString;
  sqlString.dateToString = (d, tz, dialect) => dateToString(d, tz, 'mysql');  
}


var NZDB = function (sequelizeConfig) {
  var config = sequelizeConfig || getConfig("SEQUELIZE_CONFIG");
  
  console.log("NZDB(): db is " + JSON.stringify(config, null, '\t'));  
  
  config.options = config.options || {};
  
  if (config.options.dialect && config.options.dialect === 'mssql') {
    FIXME_monkeyPatchSequelizeForMSSQL();
  }

  config.options.logging = function(s) {
    console.log(s.green);
  }
  this.sql = new Sequelize(config.database, config.userName, config.password, config.options);

  // this.sql = new Sequelize('seth', 'seth', '', { host: 'localhost', dialect: 'postgres' });
  
  console.log("NZDB(): attempting to connect...");
  
  var self = this;
  function auth() {
      return self.sql.authenticate();
  }
  
  this.ready = auth()
  .catch(function (err) { 
    console.error("NZDB(): couldn't auth with db: ", err);
    console.warn("Trying to connect one more time....");
    return auth()
    .catch(function (err) {
      console.error("NZDB(): second try, couldn't auth with db: ", err);
      console.error("NZDB(): allowing connection to continue, but could NOT AUTHENTICATE WITH DB");
    });
  })
  .then(function () {
      console.error("NZDB(): done")
      self.models = nzdbModels(self.sql, Sequelize);
      return true;      
  });
}

NZDB.prototype.syncDBTables = function () {
  return this.ready
  .bind(this)
  .then( () => this.sql.sync({ force: false }) );
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

NZDB.prototype.isAdmin = function (personID) {
  return this.sql.query(
    "SELECT u.UserId FROM webpages_UsersInRoles u INNER JOIN webpages_Roles r ON u.RoleId = r.roleid WHERE u.UserId = :user_id AND RoleName = 'Administrator'",
    { replacements: { user_id: personID }, type: Sequelize.QueryTypes.SELECT }
  )
  .then( 
    results => results.length > 0
  );
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
  });
}

NZDB.prototype.getElicitationForOpenAccess = function (openAccessToken) {
  return this.models.Task.findOne({
    where: {
      OpenAccessToken: openAccessToken,
      EnableOpenAccess: true,
      Discriminator: 'Elicitation'
    }
  });
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
