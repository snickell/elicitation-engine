
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
  'elicitation.css' : {
    type: 'css',
    dir: 'css',
    files: [
      'one.css',
      'two.css'
    ]
  },
  'elicitation-widgets.js' : {
    type: 'js',
    dir: 'elicitation/widgets',
    files: [
        'agree-disagree.js',
        'allocation-table.js',
        'area-allocation.js',
        'box-and-whiskers.js',
        'card-rank.js',
        'dropdown.js',
        'image.js',
        'likert.js',
        'multiple-choice.js',
        'multiple-choice-table.js',      
        'paragraph.js',
        'custom-scripting.js',
        'slider-allocation.js',
        'tabular-input.js',
        'text-area.js',
        'text-box.js',
        'time-trend.js'
    ]
  },
  'elicitation-widgets.css' : {
    type: 'css',
    dir: 'elicitation/widgets',
    files: [
        'agree-disagree.css',
        'allocation-table.css',
        'area-allocation.css',
        'box-and-whiskers.css',
        'card-rank.css',
        'dropdown.css',
        'image.css',
        'likert.css',
        'multiple-choice.css',
        'multiple-choice-table.css',
        'paragraph.css',
        'custom-scripting.css',
        'slider-allocation.css',
        'tabular-input.css',
        'text-area.css',        
        'text-box.css',
        'time-trend.css',
    ]
  }, 
  'elicitation.css' : {
    type: 'css',
    dir: 'elicitation/css',
    files: [
      'elicitation.css',
      /* elicitation editing */
      'jquery.miniColors.css',
      'elicitation-editor.css',
      'elicitation-print.css',
    ]
  },
  'elicitation-categories.css' : {
    type: 'css',
    dir: 'categories',
    files: [  
        'other/elicitation.css',
        'biomass/elicitation.css',
        'buildings/elicitation.css',
        'ccs/elicitation.css',
        'climate/elicitation.css',
        'fossil/elicitation.css',
        'geothermal/elicitation.css',
        'hydro/elicitation.css',
        'industry/elicitation.css',
        'nuclear/elicitation.css',
        'solar/elicitation.css',
        'storage-and-transmission/elicitation.css',
        'transportation/elicitation.css',
        'wind/elicitation.css',
    ]
  },
  'site.css' : {
    type: 'css',
    dir: 'css',
    files: [
      'chosen/chosen.css',
      'themes/base/all.css',
      'nearzero-confidentiality-indicator.css'      
    ]
  },
  'site.js' : {
    type: 'js',
    dir: 'js',
    files: [
      'jquery-1.11.3.js',
      'jquery.textarea_auto_expand.js',      
      'browser-detection-from-old-jquery.js',
      'jquery.scrollTo.js',
      'jquery-ui-1.11.4.js',
      'nearzero-confidentiality-indicator.js',
      'handlebars.js',
      'ember.js'
    ]
  },
  'elicitation.js' : {
    type: 'js',
    dir: 'elicitation/scripts',
    files: [
      'libs/jquery.miniColors.js',


      'pagedown/Markdown.Converter.js',
      'pagedown/Markdown.Editor.js',
      'pagedown/Markdown.Sanitizer.js',
            
      // This bad hack library is required because APPLE SUX and so does JQUERY UI
      'libs/jquery.ui.touch-punch.js',
      'libs/jquery.color.js',
      'libs/jquery.placeholder.js',

      'elicitation-utils.js',
      'app.js',

      'rate-limited-view.js',
      'markdown-label.js',
      'phrase-definition.js',
      'page.js',
      'pages.js',
      'widget-gallery.js',

      'eat.js',
      'eat-views.js',
      'elicitation.js',
      
      'schema.js',
      'property-editor.js',
      
      'widget-definition.js',
      'widget-qualification.js',
      'widget-data.js',
      'widget.js',
      
      // <resource reference="elicitationWidgetsJs',
      // <!-- Support code for out-of-process acceptance testing -->
      // 'widget-test.js',

      'register-elicitation-widgets.js'
    ]
  }

};

/*
site.css:
      <resource reference="elicitation-categories"/>

      <resource path="~/Content/chosen/chosen.css"/>
      <resource path="~/Content/themes/base/all.css"/>
      <resource path="~/Content/nearzero-confidentiality-indicator.css"/>      
*/

// 	{{includeCSS "elicitationCSS"}}
// 	{{includeJS "siteJs"}}
//	{{includeJS "elicitationJs"}}


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

        showNZLogo: !(isMobileDevice || embedded),

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
  _GoogleAnalytics: {
    filename: "app/views/_GoogleAnalytics.cshtml",
    content: null
  },
  _ElicitationTemplates: {
    filename: "app/views/_ElicitationTemplates.cshtml",
    content: null
  },
  _ElicitationWidgets: {
    filename: "app/views/_ElicitationWidgets.cshtml",
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
  
  var asset = res.locals.asset;
  
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
          includeCSS: function(filename) { return new Handlebars.SafeString(asset(filename)); },
          includeJS: function(filename) { return new Handlebars.SafeString(asset(filename)); },
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
