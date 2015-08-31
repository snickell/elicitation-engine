
/**
* Module dependencies.
*/

var express = require('express')
, http = require('http')
, path = require('path')
, request = require('request');

var exphbs  = require('express-handlebars');

var app = express();


var devEnv = app.get('env') === 'development';

var staticDir = path.join(__dirname, 'public');
var assetsDir = path.join(__dirname, 'builtAssets');
var assetsUrl = devEnv ? '/' : '/assets';
var maxAge = 86400000; // one day

var assets = {
  'test.js' : {
    type: 'js',
    dir: 'js',
    files: [
      'one.js',
      'two.js' 
    ]
  }
};

var assetManagerConfig = {
  rootRoute: assetsUrl,
  srcDir: staticDir,
  buildDir: assetsDir,
  process: true
};


var Handlebars = require('handlebars');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);

  app.engine('handlebars', exphbs({defaultLayout: 'main'}));
  app.set('view engine', 'handlebars');

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  
  app.use(require("express-asset-manager")(assets, assetManagerConfig));
  
  app.use(app.router);

  if (!devEnv) app.use(assetsUrl, 
    express.static(assetsDir, { maxAge: maxAge })
  );
  
  app.use(express.static(staticDir));
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
        console.error("FIXME Url.Content(", path, ")");
        return "http://static.fixme.org/" + path;
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

        expertNames: otherPersonNames,

        settings: {
            /* elicitation.settings */
            imageURL: Url.Action("Index", "ImageInElicitation", { ElicitationID: elicitation.ID }),

            widgetGalleryThumbnailsURL: Url.Content("~/Content/elicitation/widgets/thumbnails"),
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
            // TODO: these should be hidden unless allowEditing=true
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

app.get('/elicitation/run/:id', function (req, res) {  
  var elicitationID = parseInt(req.params.id);
  console.log("running elicitation #" + elicitationID + "#");
    
  /*
  includeStatic filename
  includeCSS filename
  includeJS filename
  jsonStringify obj
  */
  
  // add to viewModel:
  // showNZLogo = embedded && isMobileDevice
  
  authenticateAcessTo(elicitationID, function (err) {
    if (err) res.status(404).send("Oh uh, something went wrong: " + err);    
    
    db.getElicitationFromID(elicitationID, function (err, elicitation) {
      
      var startEditing = false;
      var embedded = false;
      
      var membership = {
        AllowModerator: false
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
      
      var elicitationDefinition = {
        ID: 666,
        Definition: "fixme"
      };

      setupElicitation(person, membership, "Elicitation.View+", elicitation, elicitationDefinition, discussion, startEditing, embedded, function (err, elicitationViewModel) {
        elicitationViewModel.helpers = {
          includeStatic: function(filename) { return "includeStatic(filename=" + filename + ")"; },
          includeCSS: function(filename) { return "includeCSS(filename=" + filename + ")"; },
          includeJS: function(filename) { return "includeJS(filename=" + filename + ")"; },
          jsonStringify: function(obj) { return new Handlebars.SafeString(JSON.stringify(obj)); }
        };
        
        elicitationViewModel.layout = false;
        
        res.render('elicitation', elicitationViewModel);
      });
    }); 
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
