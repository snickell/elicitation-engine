function addLogEntry(db, logName, text) {
  // FIXME
  console.error("FIXME: addLogEntry(", logName, text, ")");
}

function dbSaveChanges(db, cb) {
  // FIXME
  console.error("FIXME: dbSaveChanges()");
  cb();
}

module.exports = function elicitationViewModel(db, m, logName, startEditing, embedded) {
  var person = m.person;
  var membership = m.membership;
  var elicitation = m.elicitation;
  var elicitationDefinition = m.elicitationDefinition;
  var discussion = m.discussion;

  if (elicitation != null) {
      addLogEntry(db, logName, "ElicitationID: " + elicitation.ID + ", ElicitationName: " + elicitation.ElicitationName);
  } else {
      addLogEntry(db, logName, "Elicitation Not Found!");
  }

  if (membership != null)
      membership.LastAccessed = new Date();


  console.warn("FIXME not implemented: DiscussionMembership.AllowModerator needs to check this.Person.IsAdministrator too!");
  var allowEditing = membership != null ? membership.Moderator : false;
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
      
      if (controller === "Elicitation") {
        return "/gorilla/" + method.toLowerCase() + "/" + params.id;
      } else {
        console.error("FIXME Url.Action(", method, controller, params, ")");
        return "http://www.fixme.org/" + controller + "/" + method;
      }
    },
    Content: function(path) {
      return path;
    }
  };

  var isMobileDevice = false; // FIXME: HttpContext.Request.Browser.IsMobileDevice,
  console.error("FIXME isMobileDevice=false");

  return Promise.resolve({

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
          saveDataURL: person != null ? (!person.DisallowLoginViaAccessToken() ? Url.Action("SaveData", "Elicitation", { id: elicitation.ID, DiscussionName: elicitation.DiscussionName, login: person.access_token }) : Url.Action("SaveData", "Elicitation", { id: elicitation.ID, DiscussionName: elicitation.DiscussionName })) : null,
          email: person != null ? person.email : null,

          /* elicitation.discussionURL */
          discussionURL: discussion != null ? Url.Action("Index", "Discussion", { DiscussionName: elicitation.DiscussionName }, null) : null,

          /* elicitation.adminURLs */
          /* elicitation.allowEditing */
          reviewAdminURL: allowEditing ? Url.Action("Review", "Elicitation", { ReviewToken: elicitation.ReviewToken }) : null,
          assignedToAdminURL: allowEditing ? Url.Action("AssignedTo", "Task", { id: elicitation.ID, DiscussionName: elicitation.DiscussionName }) : null,
          dataAdminURL: allowEditing ? Url.Action("Data", "ElicitationAdmin", { id: elicitation.ID, DiscussionName: elicitation.DiscussionName }) : null,
          changeHistoryAdminURL: allowEditing ? Url.Action("ChangeHistory", "ElicitationAdmn", { id: elicitation.ID, DiscussionName: elicitation.DiscussionName }) : null,
          saveDefinitionURL: allowEditing ? Url.Action("SaveDefinition", "Elicitation", { id: elicitation.ID, DiscussionName: elicitation.DiscussionName }) : null,
          uploadImageURL: allowEditing ? Url.Action("CreateImageInElicitation", "ElicitationAdmin", { id: elicitation.ID, DiscussionName: elicitation.DiscussionName }) : null,

      }
  });
};