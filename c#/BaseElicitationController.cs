using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NearZero.Models;
using NearZero_Web.Models;

namespace NearZero_Web.Controllers
{
    public abstract class BaseElicitationController : NZController {
        protected ElicitationViewModel setupElicitation(string logName, Elicitation elicitation, bool startEditing = false, bool embedded = false) {
            Discussion discussion = elicitation.Discussion;

            if (elicitation != null) {
                this.addLogEntry(logName, Text: "ElicitationID: " + elicitation.ID + ", ElicitationName: " + elicitation.ElicitationName);
            } else {
                this.addLogEntry(logName, Text: "Elicitation Not Found!");
            }

            if (membership != null)
                membership.LastAccessed = DateTime.Now;

            db.SaveChanges();

            bool allowEditing = this.membership != null ? this.membership.AllowModerator : false;
            bool notTheLatestRevision =  false;
            bool reviewMode = false;
            string NZCategory = discussion.category;

            int personID = person != null ? person.ID : 0;
            var otherPersonNames = db.DiscussionMemberships.Where(m => m.Person_ID != personID && m.discussion_ID == discussion.ID
                && m.ShowInParticipantsList == true)
                .Take(Discussion.MAX_NUM_DB_OBJECTS).ToList()
                .Select(m => m.Person.name).ToList();

            string elicitationDefinition = elicitation.Definition.Definition;
            
            UrlHelper Url = new UrlHelper(HttpContext.Request.RequestContext);

            return new ElicitationViewModel {

                // @Html.Raw()
                elicitationDefinition = elicitationDefinition,
                elicitationPriorSessionData = null,


                /* ETC ETC */
                nzCategory = NZCategory.ToLower(),
                isMobileDevice = HttpContext.Request.Browser.IsMobileDevice,
                elicitationName = elicitation.ElicitationName,

                expertNames = otherPersonNames,

                settings = new ElicitationViewModel.ElicitationSettings {
                    /* elicitation.settings */
                    imageURL = Url.Action("Index", "ImageInElicitation", new { ElicitationID = elicitation.ID }),

                    widgetGalleryThumbnailsURL = Url.Content("~/Content/elicitation/widgets/thumbnails"),
                    elicitationDefinitionID = elicitation.Definition.ID,

                    allowEditing = allowEditing,
                    switchToEditModeAfterLoading = startEditing,
                    switchToReviewModeAfterLoading = reviewMode,

                    notTheLatestRevision = notTheLatestRevision,

                    completePageMessage = elicitation.CompletePageMessage,
                    completePageIncludeLinkToDiscussion = elicitation.CompletePageIncludeLinkToDiscussion,

                    embedded = embedded,



                    /* elicitation.loggedInPerson */
                    saveDataURL = person != null ? (!person.DisallowLoginViaAccessToken ? Url.Action("SaveData", new { id = elicitation.ID, DiscussionName = elicitation.DiscussionName, login = person.access_token }) : Url.Action("SaveData", new { id = elicitation.ID, DiscussionName = elicitation.DiscussionName })) : null,
                    email = person != null ? person.email : null,

                    /* elicitation.discussionURL */
                    discussionURL = discussion != null ? Url.Action("Index", "Discussion", new { DiscussionName = elicitation.DiscussionName }, null) : null,

                    /* elicitation.adminURLs */
                    /* elicitation.allowEditing */
                    // TODO: these should be hidden unless allowEditing=true
                    reviewAdminURL = allowEditing ? @Url.Action("Review", new { ReviewToken = elicitation.ReviewToken }) : null,
                    assignedToAdminURL = allowEditing ? @Url.Action("AssignedTo", "Task", new { id = elicitation.ID, DiscussionName = elicitation.DiscussionName }) : null,
                    dataAdminURL = allowEditing ? @Url.Action("Data", "ElicitationAdmin", new { id = elicitation.ID, DiscussionName = elicitation.DiscussionName }) : null,
                    changeHistoryAdminURL = allowEditing ? @Url.Action("ChangeHistory", "ElicitationAdmn", new { id = elicitation.ID, DiscussionName = elicitation.DiscussionName }) : null,
                    saveDefinitionURL = allowEditing ? Url.Action("SaveDefinition", new { id = elicitation.ID, DiscussionName = elicitation.DiscussionName }) : null,
                    uploadImageURL = allowEditing ? Url.Action("CreateImageInElicitation", "ElicitationAdmin", new { id = elicitation.ID, DiscussionName = elicitation.DiscussionName }) : null,

                }
            };
        }

        protected void assertElicitationIsInThisDiscussion(Task elicitation) {
            if (elicitation.Discussion_ID != this.discussion.ID) throw new Exception("Not allowed");
        }

        protected Elicitation getElicitationFromID(int elicitationID, bool setDiscussionFromElicitation = false) {
            var elicitation = db.Elicitations.Find(elicitationID);

            if (elicitation == null) return null;

            if (setDiscussionFromElicitation) {
                this.discussion = elicitation.Discussion;
                this.membership = this.discussion.getMembershipFor(person, db);
            } else {
                assertElicitationIsInThisDiscussion(elicitation);
            }

            return elicitation;
        }
    }

}