var Promise = require('bluebird');
var extend = require('extend');
var authenticateAccessTo = require('../elicitation/auth');

function throwIfNull(x) {
  if (x === null) {
    throw "Couldn't find required resource in database";
  } else {
    return x;
  }
}

module.exports = function (db) {
  function addLogEntry(req, eventType, text, personID, discussionID) {
    var requestArgs = JSON.stringify({
      ua: req.headers['user-agent'],
      queryArgs: req.query,
      postArgs: req.body
    });
    
    if (discussionID) {
      return db.models.LogEntry.create({
        InternalEvent: false,
        Person_ID: personID,
        Discussion_ID: discussionID,
        PageInstance: null,
        Date: Date.now(),
        EventType: eventType,
        Text: text,
        RequestArgs: requestArgs
      });      
    } else {
      return Promise.resolve();
    }
  }  
  
  function loadReviewModels(reviewToken) {
    return db.ready
    .then( () =>
      Promise.props({
        elicitation: db.getElicitationForReview(reviewToken)
      })
    )
    .then(loadElicitationDefinition)
    .then(loadDiscussion);
  }

  function loadElicitationDefinition(m) {
    return db.models.ElicitationDefinition.findById(m.elicitation.ElicitationDefinition_ID)
    .then(throwIfNull)    
    .then( definition => extend(m, {
      elicitationDefinition: definition
    }));
  }

  function loadDiscussion(m) {
    return db.models.Discussion.findById(m.elicitation.Discussion_ID)    
    .then(throwIfNull)    
    .then( discussion => extend(m, {
      discussion: discussion
    }));
  }

  function authAndLoad(logEventName, elicitationID, req, res, options) {
    options = extend(
      {
        includeElicitationDefinition: false,
        includeDiscussion: false,
      }, options
    );

    return db.ready
    .then( () =>
      authenticateAccessTo(elicitationID, req, res)
    )
    .then(personID =>
      Promise.props({
        elicitation: db.getElicitation(elicitationID).then(throwIfNull),
        assignment: db.getElicitationAssignment(elicitationID, personID), // assignment can be null for admins/mods
        person: db.models.Person.findById(personID).then(throwIfNull)
      })
    )
    .then((m) => db.isAdmin(m.person.ID).then(isAdmin => extend(m, { isAdmin: isAdmin })))
    .then((m) =>
      m.elicitation.Discussion_ID
      ? addLogEntry(req, logEventName, "ElicitationID: " + elicitationID, m.person.ID, m.elicitation.Discussion_ID)
        .then( () => db.getDiscussionMembership(m.elicitation.Discussion_ID, m.person.ID) )
        .then(function (membership) {
          if (m.isAdmin) {
            if (membership != null) {
              // admins are always moderators
              membership.Moderator = true;
            } else {
              // Creating a virtual db.models.DiscussionMembership for admins, who should
              // be given access to any elicitation
              membership = {
                Virtual: true,
                Moderator: true,
                ReadOnly: true
              };              
            }
          }
          
          return extend(m, { 
            membership: membership, 
            isModOrAdmin: m.isAdmin || membership.Moderator 
          });
        })
      : m
    )
    .then(function (m) {
      // Discussion moderators or site admins can access even if they aren't assigned
      if (m.assignment != null || m.membership && (m.membership.Moderator || m.membership.Moderator)) {
        return m;
      } else {
        throw "This elicitation has not been assigned to you";
      }
    })    
    .then((m) =>
      options.includeElicitationDefinition
      ? loadElicitationDefinition(m)
      : m
    )
    .then((m) =>
      options.includeDiscussion && m.elicitation.Discussion_ID
      ? loadDiscussion(m)
      : m
    );
  }
  
  return {
      authAndLoad: authAndLoad,
      loadReviewModels: loadReviewModels,
      addLogEntry: addLogEntry
  }; 
}

