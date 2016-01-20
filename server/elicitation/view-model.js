var Url = require('./url-helper');

module.exports = function elicitationViewModel(baseURL, db, m, logName, startEditing, embedded) {
  var person = m.person;
  var membership = m.membership;
  var elicitation = m.elicitation;
  var elicitationDefinition = m.elicitationDefinition;
  var discussion = m.discussion;

  if (membership != null)
      membership.LastAccessed = new Date();


  console.warn("FIXME not implemented: DiscussionMembership.AllowModerator needs to check this.Person.IsAdministrator too!");
  var allowEditing = membership != null ? membership.Moderator : false;
  var notTheLatestRevision =  false;
  var reviewMode = false;
  
  var NZCategory = discussion ? discussion.category : 'solar';
  var discussionName = discussion ? discussion.name : 'nameless';
  
  var personID = person != null ? person.ID : 0;
  
  var otherPersonNames = [];
  console.error("FIXME: otherPersonNames = db.DiscussionMemberships.Where....");    
  /*
  db.DiscussionMemberships.Where(m => m.Person_ID != personID && m.discussion_ID == discussion.ID
      && m.ShowInParticipantsList == true)
      .Take(Discussion.MAX_NUM_DB_OBJECTS).ToList()
      .Select(m => m.Person.name).ToList();
  */

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
          imageURL: Url.Action(baseURL, "Index", "ImageInElicitation", { ElicitationID: elicitation.ID }),

          widgetGalleryThumbnailsURL: Url.Content(baseURL, "/app/widgets/thumbnails"),
          elicitationDefinitionID: elicitationDefinition.ID,

          allowEditing: allowEditing,
          switchToEditModeAfterLoading: startEditing,
          switchToReviewModeAfterLoading: reviewMode,

          notTheLatestRevision: notTheLatestRevision,

          completePageMessage: elicitation.CompletePageMessage,
          completePageIncludeLinkToDiscussion: elicitation.CompletePageIncludeLinkToDiscussion,

          embedded: embedded,

          /* elicitation.loggedInPerson */
          saveDataURL: person != null ? (!person.DisallowLoginViaAccessToken() ? Url.Action(baseURL, "SaveData", "Elicitation", { id: elicitation.ID, DiscussionName: discussionName, login: person.access_token }) : Url.Action(baseURL, "SaveData", "Elicitation", { id: elicitation.ID, DiscussionName: discussionName })) : null,
          email: person != null ? person.email : null,

          /* elicitation.discussionURL */
          discussionURL: discussion != null ? Url.Action(baseURL, "Index", "Discussion", { DiscussionName: discussionName }, null) : null,

          /* elicitation.adminURLs */
          /* elicitation.allowEditing */
          reviewAdminURL: allowEditing ? Url.Action(baseURL, "Review", "Elicitation", { ReviewToken: elicitation.ReviewToken }) : null,
          assignedToAdminURL: allowEditing ? Url.Action(baseURL, "AssignedTo", "Task", { id: elicitation.ID, DiscussionName: discussionName }) : null,
          dataAdminURL: allowEditing ? Url.Action(baseURL, "Data", "ElicitationAdmin", { id: elicitation.ID, DiscussionName: discussionName }) : null,
          changeHistoryAdminURL: allowEditing ? Url.Action(baseURL, "ChangeHistory", "ElicitationAdmin", { id: elicitation.ID, DiscussionName: discussionName }) : null,
          saveDefinitionURL: allowEditing ? Url.Action(baseURL, "SaveDefinition", "Elicitation", { id: elicitation.ID, DiscussionName: discussionName }) : null,
          uploadImageURL: allowEditing ? Url.Action(baseURL, "CreateImageInElicitation", "ElicitationAdmin", { id: elicitation.ID, DiscussionName: discussionName }) : null,
          
          personID: personID,

      }
  });
};