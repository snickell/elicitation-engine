using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;
using System.Net.Mail;
using System.Runtime.Serialization.Json;
using System.Text;

using NearZero.Models;
using NearZero.Models.Mail;
using NearZero_Web.Models;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Web.Script.Serialization;

namespace NearZero_Web.Controllers
{

    public class ElicitationController : BaseElicitationController {


        public ActionResult Review(Guid ReviewToken) {
            var elicitation = db.Elicitations.Where(e => e.ReviewToken == ReviewToken).FirstOrDefault();

            var elicitationViewModel = setupElicitation("Elicitation.Review", elicitation);

            elicitationViewModel.settings.switchToReviewModeAfterLoading = true;
            elicitationViewModel.settings.allowEditing = false;
            elicitationViewModel.settings.switchToEditModeAfterLoading = false;

            return View("Elicitation", elicitationViewModel);
        }

        [AuthorizedOnly(redirectToLogin: true, authorizeDiscussionMembership: false)]
        public ActionResult Run(int id, bool embedded = false, bool resumePriorSessionData = true) {
            var elicitation = getElicitationFromID(id, setDiscussionFromElicitation: true);
            var elicitationViewModel = setupElicitation("Elicitation.View", elicitation, startEditing: false, embedded: embedded);

            var elicitationAssignment = elicitation.ElicitationAssignments.FirstOrDefault(ea => ea.Person_ID == this.person.ID);
            if (elicitationAssignment == null) {
                return Content("This elicitation has not been properly assigned to you. This is probably a mistake, but to prevent security problems we can't display the elicitation. Please contact the person who sent you a link to fix this! Sorry for the hassle.");
            } else {
                elicitationAssignment.LastBrowserUserAgent = this.Request.UserAgent;
                elicitationAssignment.LastAccessed = DateTime.Now;
                db.SaveChanges();

                if (resumePriorSessionData) {
                    var latestElicitationData = elicitationAssignment.ElicitationDatas.OrderByDescending(d => d.Modified).FirstOrDefault();
                    if (latestElicitationData != null && !latestElicitationData.Completed) {
                        elicitationViewModel.elicitationPriorSessionData = latestElicitationData.JSON;
                    }
                }
            }

            return View("Elicitation", elicitationViewModel);
        }

        /* Accepts JSON data submissions from Expert participants, including page-by-page 'backup' submissions,
        * which will have completed=false, and the final data submit, which will have completed=true */
        [AuthorizedOnly(authorizeDiscussionMembership: false)]
        [HttpPost]
        // FIXME: would be better to use a model with [AllowHtml] set on the json field
        [ValidateInput(false)] // don't validate since json may contain HTML
        public ActionResult SaveData(int id, int elicitation_definition_id, string json, string completed) {
            Trace.TraceInformation("ElicitationController.SaveData on id: " + id + " from personID: " + person.ID);

            this.addLogEntry("Elicitation.SaveData", Text: "ElicitationID: " + id);
            db.SaveChanges();

            try {
                var elicitation = getElicitationFromID(id, setDiscussionFromElicitation: true);

                var assignment = elicitation.ElicitationAssignments.Where(ea => ea.Person_ID == person.ID).FirstOrDefault();
                if (assignment == null) throw new Exception("ElicitationAssignment not found");

                var now = DateTime.Now;

                membership.LastAccessed = now;
                assignment.LastAccessed = now;

                var ElicitationCompleted = completed != null;

                var elicitationData = new ElicitationData {
                    ElicitationAssignment = assignment,
                    JSON = json,
                    Completed = ElicitationCompleted,
                    Created = now,
                    Modified = now,
                    ElicitationDefinition_ID = elicitation_definition_id,
                    BrowserUserAgent = this.Request.UserAgent
                };

                db.ElicitationDatas.Add(elicitationData);

                if (ElicitationCompleted) {
                    assignment.CompletedElicitationData = elicitationData;
                    assignment.Completed = true;
                    elicitation.UpdateNumAssignedAndCompletedFromDB();
                    this.addLogEntry("Elicitation Complete", Text: "ElicitationID: " + id);

                    membership.HasParticipated = true;
                    membership.HasCompletedATask = true;
                    elicitation.LastCompleted = now;
                    membership.LastParticipated = now;

                    // Update dates
                    if (elicitation.Discussion != null) {
                        elicitation.Discussion.LastActivity = now;
                    }
                }
                assignment.Modified = now;

                db.SaveChanges();

                if (ElicitationCompleted) {
                    // Update Per-Widget Results
                    try {
                        foreach (var perWidgetResults in elicitation.PerWidgetResults) {
                            perWidgetResults.AddElicitationData(elicitationData);
                        }
                        db.SaveChanges();
                    } catch (Exception e) {
                        // FIXME: log exception
                        Trace.TraceError("ElicitationController.SaveData: error updating per-widget results\n" + e.ToString());
                        var message = e.Message;
                    }

                    // Email the moderators, let them know an expert submitted an elicitation
                    try {
                        var domainName = NearZero.Models.NZConfiguration.DomainName;
                        if (domainName != "127.0.0.1") {
                            var formattedJSON = JObject.Parse(json).ToString();

                            string elicitationName = elicitation.ElicitationName;

                            var message = new MailMessage {
                                From = elicitation.Discussion.getMailAddress(domainName),
                                Subject = "Elicitation Completed (" + elicitationName.ToString() + ")",
                                Body = person.name + " completed the elicitation"
                            };
                            foreach (var moderator in elicitation.Discussion.Moderators) {
                                message.To.Add(new MailAddress(moderator.email, moderator.name));
                            }
                            MessageSender.SendMailMessage(message);
                            //AmazonSES.send(message);
                        }
                    } catch (Exception e) {
                        Trace.TraceError("ElicitationController.SaveData: error sending moderators a message\n" + e.ToString());
                    }

                    Trace.TraceInformation("ElicitationController.SaveData: complete submission from " + person.ID);
                }

                Trace.TraceInformation("ElicitationController.SaveData returning true on id: " + id + " from personID: " + person.ID);

                return Content("true");
            } catch (Exception ex) {
                var exString = ex.ToString();
                Trace.TraceError("ElicitationController.SaveData: error \n" + exString);

                this.addLogEntry("Elicitation.SaveData ERROR", Text: "ElicitationID: " + id + "\nException:\n" + exString + "\n");
                db.SaveChanges();
                throw ex;
            }
        }

        [ModeratorsOnly]
        public ActionResult Edit(int id, int? revision) {
            var elicitation = getElicitationFromID(id);
            var elicitationViewModel = setupElicitation("Elicitation.Edit", elicitation, startEditing: true);

            if (revision != null) {
                var definition = db.ElicitationDefinitions.Find(revision);

                if (!elicitation.DefinitionHistory.Contains(definition)) throw new Exception("Specified definitionID " + revision + " is not in the history of elicitation");
                elicitationViewModel.elicitationDefinition = definition.Definition;
                elicitationViewModel.settings.notTheLatestRevision = true;
            }

            return View("Elicitation", elicitationViewModel);
        }

        private void saveDefinition(Elicitation elicitation, string definitionText, string changeSummary) {
            var now = DateTime.Now;

            var newDefinition = new ElicitationDefinition() {
                Definition = definitionText,
                ChangeSummary = changeSummary,
                Elicitation = elicitation,
                Created = now,
                Modified = now,
                CreatedBy = this.person
            };
            elicitation.Definition = newDefinition;
            elicitation.Modified = now;

            if (elicitation.Discussion != null) {
                elicitation.Discussion.LastActivity = now;
            }

            db.SaveChanges();

            foreach (var perWidgetResult in elicitation.PerWidgetResults) {
                perWidgetResult.UpdateFromElicitationDefinition(dbRequiredForDeleting: this.db);
            }
            db.SaveChanges();
        }

        [ModeratorsOnly]
        public ActionResult SaveDefinition(int id, string ChangeSummary,
                                            bool SaveAsNewElicitation = false, string SaveAsNewElicitationName = null) {
            string definitionText = Request.Unvalidated()["ElicitationDefinition"];
            var elicitation = getElicitationFromID(id);

            if (SaveAsNewElicitation) {
                var oldElicitation = elicitation;
                elicitation = (Elicitation)oldElicitation.Clone(db, db);
                elicitation.ElicitationName = SaveAsNewElicitationName;
                db.SaveChanges();
            }

            this.saveDefinition(elicitation, definitionText, ChangeSummary);

            return Content("true");
        }


    }
}
