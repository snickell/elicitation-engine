
/**
* Module dependencies.
*/

var express = require('express')
, http = require('http')
, path = require('path')
, request = require('request')
, Handlebars = require('handlebars')
, exphbs  = require('express-handlebars')
, connectAssets = require('connect-assets');

var app = express();

var expressHandlebars = exphbs.create({
  defaultLayout: "main",
  extname: ".hbs"
});

var connectAssetsHelpers = {};

console.log("env is: ", app.get('env'));

app.configure(function(){
  app.set('port', process.env.PORT || 3000);

  app.engine('.hbs', expressHandlebars.engine);
  app.set('view engine', '.hbs');

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  
  app.use(connectAssets({
    paths: [
      'app',
      'public'
    ],
    helperContext: connectAssetsHelpers
  }));
    
  app.use(app.router);

  app.use(express.static('public'));
  app.use('/app/widgets/thumbnails', express.static('app/widgets/thumbnails'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});



var connectionString = process.env['SQLAZURECONNSTR_DefaultConnection'];
var NZDB = require('./backend/nzdb');
var db = new NZDB(connectionString);



app.get('/', function (req, res) {  
  res.render('home', {
    title: "bumpy"
  });
});



function authenticateAcessTo(elicitationID, cb) {
  console.log("Authenticating acess to ", elicitationID);
  var url = "http://www.nearzero.org/authenticate-access-to-elicitation/" + elicitationID;
  console.log(url);
  
  console.error("DISABLED AUTHENTICATION");
  cb();
  return;
  
  request(url, function (error, response, body) {
    console.log("error ", error, "response.statusCode", response.statusCode);
    if (!error && response.statusCode == 200) {
      cb();
    } else {
      cb("couldn't authenticate access to elicitation");
    }
  });
}

function addLogEntry(logName, text) {
  // FIXME
  console.error("FIXME: addLogEntry(", logName, text, ")");
}

function dbSaveChanges(cb) {
  // FIXME
  console.error("FIXME: dbSaveChanges()");
  cb();
}

function setupElicitation(person, membership, logName, elicitation, elicitationDefinition, discussion, startEditing, embedded, cb) {
  startEditing = startEditing !== undefined ? startEditing : false;
  embedded = embedded !== undefined ? embedded : false;

  if (elicitation != null) {
      addLogEntry(logName, "ElicitationID: " + elicitation.ID + ", ElicitationName: " + elicitation.ElicitationName);
  } else {
      addLogEntry(logName, "Elicitation Not Found!");
  }

  if (membership != null)
      membership.LastAccessed = new Date();

  dbSaveChanges(function () {
    var allowEditing = membership != null ? membership.AllowModerator : false;
    var notTheLatestRevision =  false;
    var reviewMode = false;
    var NZCategory = discussion.category;

    var personID = person != null ? person.ID : 0;
    
    var otherPersonNames = [];
    console.error("FIXME: otherPersonNames = db.DiscussionMemberships.Where....");    
    /*
    db.DiscussionMemberships.Where(m => m.Person_ID != personID && m.discussion_ID == discussion.ID
        && m.ShowInParticipantsList == true)
        .Take(Discussion.MAX_NUM_DB_OBJECTS).ToList()
        .Select(m => m.Person.name).ToList();
    */

  
    var Url = {
      Action: function(method, controller, params) {
        console.error("FIXME Url.Action(", method, controller, params, ")");
        return "http://www.fixme.org/" + controller + "/" + method;
      },
      Content: function(path) {
        return path;
      }
    }

    var isMobileDevice = false; // FIXME: HttpContext.Request.Browser.IsMobileDevice,
    console.error("FIXME isMobileDevice=false");

    cb(null, {

        // @Html.Raw()
        elicitationDefinition: elicitationDefinition.Definition,
        elicitationPriorSessionData: null,


        /* ETC ETC */
        nzCategory: NZCategory.toLowerCase(),
        isMobileDevice: isMobileDevice,
        elicitationName: elicitation.ElicitationName,

        showNZLogo: !(isMobileDevice || embedded),

        expertNames: otherPersonNames,

        settings: {
            /* elicitation.settings */
            imageURL: Url.Action("Index", "ImageInElicitation", { ElicitationID: elicitation.ID }),

            widgetGalleryThumbnailsURL: Url.Content("/app/widgets/thumbnails"),
            elicitationDefinitionID: elicitationDefinition.ID,

            allowEditing: allowEditing,
            switchToEditModeAfterLoading: startEditing,
            switchToReviewModeAfterLoading: reviewMode,

            notTheLatestRevision: notTheLatestRevision,

            completePageMessage: elicitation.CompletePageMessage,
            completePageIncludeLinkToDiscussion: elicitation.CompletePageIncludeLinkToDiscussion,

            embedded: embedded,



            /* elicitation.loggedInPerson */
            saveDataURL: person != null ? (!person.DisallowLoginViaAccessToken ? Url.Action("SaveData", { id: elicitation.ID, DiscussionName: elicitation.DiscussionName, login: person.access_token }) : Url.Action("SaveData", { id: elicitation.ID, DiscussionName: elicitation.DiscussionName })) : null,
            email: person != null ? person.email : null,

            /* elicitation.discussionURL */
            discussionURL: discussion != null ? Url.Action("Index", "Discussion", { DiscussionName: elicitation.DiscussionName }, null) : null,

            /* elicitation.adminURLs */
            /* elicitation.allowEditing */
            reviewAdminURL: allowEditing ? Url.Action("Review", { ReviewToken: elicitation.ReviewToken }) : null,
            assignedToAdminURL: allowEditing ? Url.Action("AssignedTo", "Task", { id: elicitation.ID, DiscussionName: elicitation.DiscussionName }) : null,
            dataAdminURL: allowEditing ? Url.Action("Data", "ElicitationAdmin", { id: elicitation.ID, DiscussionName: elicitation.DiscussionName }) : null,
            changeHistoryAdminURL: allowEditing ? Url.Action("ChangeHistory", "ElicitationAdmn", { id: elicitation.ID, DiscussionName: elicitation.DiscussionName }) : null,
            saveDefinitionURL: allowEditing ? Url.Action("SaveDefinition", { id: elicitation.ID, DiscussionName: elicitation.DiscussionName }) : null,
            uploadImageURL: allowEditing ? Url.Action("CreateImageInElicitation", "ElicitationAdmin", { id: elicitation.ID, DiscussionName: elicitation.DiscussionName }) : null,

        }
    });
  });
}

var staticIncludes = {
  "google-analytics.html": {
    filename: "app/templates/google-analytics.html",
    content: null
  },
  "eat.hbs": {
    filename: "app/templates/eat.hbs",
    content: null
  },
  "widgets.hbs": {
    filename: "app/templates/widgets.hbs",
    content: null
  }
};

// YUUUUUUUUCKKK!!!! THIS SO GROSS!!!! FIXME FIXME FIXME
var fs = require('fs');
Object.keys(staticIncludes).forEach(function (includeName) {
  fs.readFile(staticIncludes[includeName].filename, 'utf8', function (err, content) {
    staticIncludes[includeName].content = content;
  });
});

app.get('/elicitation/run/:id', function (req, res) {
  var elicitationID = parseInt(req.params.id);
  console.log("running elicitation #" + elicitationID + "#");
  
  authenticateAcessTo(elicitationID, function (err) {
    if (err) res.status(404).send("Oh uh, something went wrong: " + err);    
    
    db.getElicitationAndAssets(elicitationID, function (err, result) {
      var elicitation = result.elicitation;
      var definition = result.definition;
      
      var startEditing = false;
      var embedded = false;
      
      var membership = {
        AllowModerator: true
      };
      
      var person = {
        ID: 666,
        DisallowLoginViaAccessToken: false,
        access_token: "markofbeast",
        email: "fixme@fixme.org"
      };
      
      var discussion = {
        category: "solar"
      };

      setupElicitation(person, membership, "Elicitation.View+", elicitation, definition, discussion, startEditing, embedded, function (err, elicitationViewModel) {
        elicitationViewModel.helpers = {
          includeStatic: function(filename) { return new Handlebars.SafeString(staticIncludes[filename].content); },
          css: function(filename) { return new Handlebars.SafeString(connectAssetsHelpers.css(filename)); },
          js: function(filename) { return new Handlebars.SafeString(connectAssetsHelpers.js(filename)); },
          assetPath: function(filename) { return new Handlebars.SafeString(connectAssetsHelpers.assetPath(filename)); },
          jsonStringify: function(obj) { return new Handlebars.SafeString(JSON.stringify(obj)); }
        };
        
        elicitationViewModel.layout = false;
        
        res.render('elicitation-backend-layout', elicitationViewModel);
      });
    }); 
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
