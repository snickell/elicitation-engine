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

// LGPL library from http://code.google.com/p/excellibrary/
using ExcelLibrary.SpreadSheet;
using System.IO;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Web.Script.Serialization;
using System.Web.Security;

namespace NearZero_Web.Controllers
{
    public class ElicitationAdminController : BaseElicitationController {

        public ActionResult AuthenticateAccessToElicitation(int elicitationID, string ReturnURL) {
            bool needsReloadToRefreshFormsAuth; // we ignore this, we don't need to use forms auth later 
            Person person = AuthorizedOnly.GetAuthorizedPerson(Request, out needsReloadToRefreshFormsAuth);

            if (person == null) {
                string loginURL = FormsAuthentication.LoginUrl + "?ReturnURL=" + HttpUtility.UrlEncode(ReturnURL);
                return Redirect(loginURL);
            } else {
                this.person = person;
                var elicitation = getElicitationFromID(elicitationID, setDiscussionFromElicitation: true);
                if (elicitation != null) {
                    // Allow moderators, or people assigned the elicitation
                    if (this.membership.AllowModerator || (elicitation.ElicitationAssignments.FirstOrDefault(ea => ea.Person_ID == this.person.ID) != null)) {
                        return Json(new {
                                personID = person.ID
                            }, 
                            JsonRequestBehavior.AllowGet
                        );
                    }
                }
            }

            return new HttpStatusCodeResult(403);
        }

        [ModeratorsOnly]
        public ActionResult ChangeHistory(int id) {
            Elicitation elicitation = getElicitationFromID(id);
            return View(elicitation);
        }


        [ModeratorsOnly]
        public ActionResult EditPerWidgetResults(int id) {
            Elicitation elicitation = getElicitationFromID(id);

            return View(elicitation);
        }

        [HttpPost]
        [ModeratorsOnly]
        public ActionResult EditPerWidgetResults(int id, bool ShowResultsInDiscussion, string[] WidgetIDsToIncludeInResults) {
            var elicitation = getElicitationFromID(id);

            elicitation.ShowResultsInDiscussion = ShowResultsInDiscussion;

            var existingWidgets = elicitation.PerWidgetResults;

            if (WidgetIDsToIncludeInResults == null) WidgetIDsToIncludeInResults = new string[0];

            var widgetsToAddToResults = WidgetIDsToIncludeInResults.Where(w => !existingWidgets.Any(existingWidget => existingWidget.WidgetInstance_ID == w)).ToList();
            var widgetsToRemoveFromResults = existingWidgets.Where(ta => !WidgetIDsToIncludeInResults.Contains(ta.WidgetInstance_ID)).ToList();

            foreach (var perWidgetResultToRemove in widgetsToRemoveFromResults) {
                db.ElicitationPerWidgetResults.Remove(perWidgetResultToRemove);
            }
            foreach (var widgetID in widgetsToAddToResults) {
                var newPerWidgetResult = ElicitationPerWidgetResult.GenerateFromDB(elicitation, widgetID);
                elicitation.TaskResults.Add(newPerWidgetResult);
                db.ElicitationPerWidgetResults.Add(newPerWidgetResult);
            }

            if (ModelState.IsValid) {
                db.SaveChanges();
                return RedirectToAction("Index", "Discussion", new { ID=discussion.ID });
            } else {
                return View(elicitation);
            }
        }

        [HttpPost]
        [ModeratorsOnly]
        public ActionResult CreateImageInElicitation(int id, HttpPostedFileBase file) {
            var elicitation = getElicitationFromID(id);

            string imageID=null; // imageID to return
            string errorMessage=null; // message to display (optional)
            bool success;

            if (file.ContentLength > 2000000) {
                errorMessage = "The image is too large (max size is 2 MB), please resize it in an image editor such as Adobe Photoshop and/or save it in JPEG format";
                success = false;
            } else {
                byte[] fileData = null;
                using (var binaryReader = new BinaryReader(file.InputStream)) {
                    fileData = binaryReader.ReadBytes(file.ContentLength);
                }

                var image = ImageInElicitation.Create(fileData, file.ContentType);
                db.ImageInElicitations.Add(image);
                db.SaveChanges();

                imageID = image.ID.ToString();
                success = true;
            }

            return Json(new {
                imageID=imageID,
                errorMessage=errorMessage,
                success=success
            });
        }


        [ModeratorsOnly]
        public ActionResult Create() {
            return View(new Elicitation(person, discussion));
        }

        [HttpPost]
        [ModeratorsOnly]
        public ActionResult Create(Elicitation task, int[] AssignToPeople) {
            if (ModelState.IsValid) {
                var now = DateTime.Now;

                task.Discussion = discussion;
                task.Creator_ID = this.person.ID;
                task.Created = now;

                if (AssignToPeople != null) {
                    foreach (var expertID in AssignToPeople) {
                        var assignment = new ElicitationAssignment(task, db.People.Find(expertID));
                        db.TaskAssignments.Add(assignment);
                        task.TaskAssignments.Add(assignment);
                    }
                }

                task.UpdateNumAssignedAndCompletedFromDB();

                db.Tasks.Add(task);
                db.SaveChanges();

                var definition = new ElicitationDefinition() {
                    Elicitation = task,
                    Created = now,
                    Modified = now,
                    CreatedBy = this.person
                };

                task.Definition = definition;
                db.SaveChanges();

                return RedirectToAction("Edit", "Elicitation", new { id = task.ID, DiscussionName = discussion.name });
            }
            return View();
        }

        /*
            {
                type: "AgreeDisagree",
                questionText: "Who would you vote for senator?",
                data: [
                    {
                        expertID: "5",
                        expertName: "George Lucas",
                        data: { ...widget-specific data here... }
                    }
                ]
            }
        */

        [ModeratorsOnly]
        public ActionResult Data(int id) {
            var elicitation = getElicitationFromID(id);

            return View(elicitation);
        }

        [ModeratorsOnly]
        public ActionResult ViewData(int id) {
            var elicitation = getElicitationFromID(id);

            var table = new ElicitationDataTable(elicitation, db);
            return View(table);
        }

        [ModeratorsOnly]
        public ActionResult ElicitationDatas(int id, int? AssignmentID) {
            var assignment = db.ElicitationAssignments.Find(AssignmentID);
            assertElicitationIsInThisDiscussion(assignment.Task);

            return View(assignment);
        }

        [ModeratorsOnly]
        public ActionResult DownloadDataJSON(int id, int? AssignmentID, int? ElicitationDataID=null) {
            var assignment = db.ElicitationAssignments.Find(AssignmentID);
            assertElicitationIsInThisDiscussion(assignment.Task);

            ElicitationData elicitationData;            
            if (ElicitationDataID == null) {
                elicitationData = assignment.LastestElicitationData;
            } else {
                elicitationData = assignment.ElicitationDatas.Where(data => data.ID == ElicitationDataID).FirstOrDefault();
            }

            if (elicitationData != null) {
                var json = JObject.Parse(elicitationData.JSON);
                
                return Content(json.ToString(), "application/json");
            } else {
                return Content("ElicitationData not found");
            }
        }

        [ModeratorsOnly]
        public ActionResult DownloadDataCSV(int id) {
            var elicitation = getElicitationFromID(id);

            var table = new ElicitationDataTable(elicitation, db);

            var fileName = elicitation.ElicitationName + ".csv";
            return File(Encoding.UTF8.GetBytes(table.toCSV()), "text/csv", fileName);
        }


        [ModeratorsOnly]
        public ActionResult DownloadDataXLS(int id) {
            var elicitation = getElicitationFromID(id);

            var table = new ElicitationDataTable(elicitation, db);

            var excelMimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = elicitation.ElicitationName + ".xls";
            return File(table.toExcelBytes(), excelMimeType, fileName);
        }


        [ModeratorsOnly]
        public ActionResult MailMergeCSV(int id) {
            var elicitation = getElicitationFromID(id);

            string csv = "email,title,firstname,lastname,affiliation,formalname,completed?,accessed?,elicitationlink,discussionlink,donotemail\r\n";
            foreach (var assignment in elicitation.ElicitationAssignments) {
                var expert = assignment.Person;
                DiscussionMembership membership = discussion != null ? discussion.getMembershipFor(expert, db) : null;

                // Don't include email addresses in the CSV for disabled accounts, people who don't want email, etc
                bool permissionToEmail;
                if (membership != null) {
                    permissionToEmail = PermissionToEmail.MayISendThisEmail(PermissionToEmail.TypeOfEmail.FROM_DISCUSSION_MODERATOR, membership);
                } else {
                    permissionToEmail = PermissionToEmail.MayISendThisEmailOutsideADiscussion(PermissionToEmail.TypeOfEmail.FROM_DISCUSSION_MODERATOR, person);
                }

                string email = expert.email + (permissionToEmail ? "" : (membership != null && membership.Disabled) ? "_DISABLED" : "_DO_NOT_EMAIL");
                string discussionURL = (membership != null) ? discussion.URL(membership) : "";

                string[] fields = {
                    email,
                    expert.Title,
                    expert.FirstName,
                    expert.LastName,
                    expert.affiliation,
                    expert.FormalName,
                    assignment.Completed.ToString(),
                    assignment.HasBeenAccessed.ToString(),
                    assignment.URL,
                    discussionURL,
                    (!permissionToEmail).ToString()
                };

                csv += NearZero_Web.Helpers.Csv.EscapeRow(fields);
            }

            var fileName = String.Format("mailmerge_{0}_{1}.csv", elicitation.ElicitationName, DateTime.Now.ToString("MMM-dd-yyyy"));
            Response.AddHeader("Content-Disposition", "attachment; filename=" + fileName);

            return Content(csv, "text/csv");
        }

    }
}