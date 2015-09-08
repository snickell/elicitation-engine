using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NearZero.Models {
    /* Tasks (including, notably, the Elicitation sub-class) are assigned to each Person
     * (who are often part of a discussion) by way of a TaskAssignment.
     * 
     * A Task is nothing more than something which is assigned to a Person and can
     * be Completed, sometimes resulting in a TaskResult sub-class displayed inside
     * the conversation.
     * 
     */
    public abstract class Task : IDiscussionMember {
        public int ID { get; set; }

        public Task() {
            this.TaskAssignments = new List<TaskAssignment>();
            this.TaskResults = new List<TaskResult>();
            this.Created = this.Modified = this.LastCompleted = DateTime.Now;
            this.CompleteTaskInPopup = false;
            this.ShowResultsInDiscussion = false;
            this.CompletePageMessage = "Task complete";
            this.CompletePageIncludeLinkToDiscussion = false;
            this.CompleteTaskBeforeDiscussion = false;
        }
        public Task(Person creator, Discussion discussion)
            : this() {
            this.Creator_ID = creator.ID;
            this.Discussion = discussion;
        }

        [ForeignKey("Discussion")]
        public int? Discussion_ID { get; set; }
        public virtual Discussion Discussion { get; set; }

        // Don't want a foreign key, but the ID of the Person (moderator) who created this
        public int? Creator_ID { get; set; }

        public DateTime Created { get; set; }
        public DateTime Modified { get; set; }
        public DateTime LastCompleted { get; set; }

        [NotMapped]
        public DateTime SortByDate { get { return this.Created; } }

        [NotMapped]
        public bool Recent {
            get {
                var delta = DateTime.Now - this.Modified;
                var thirtyDays = new TimeSpan(30, 0, 0, 0);
                return delta.CompareTo(thirtyDays) <= 0;
            }
        }

        //[Required(ErrorMessage = "You need to enter a message.")]

        // Message displayed to lure people into doing the task
        [Display(Name="Introductory Paragraph")]
        [DataType(DataType.MultilineText)]
        public string IntroMessage { get; set; }

        // Message to display on the 'complete page' for a task (in the case of an elicitaiton
        // this would be the "Changes saved" page)
        [Display(Name="Post-Submit Message", GroupName="Complete Page")]
        [DataType(DataType.MultilineText)]
        public string CompletePageMessage { get; set; }

        // Put a link to the discussion on the complete page? In other words, give experts the
        // option of continuing to the discussion?
        [Display(Name="Include a link to the discussion on the post-submit page", GroupName="Complete Page")]
        public bool CompletePageIncludeLinkToDiscussion { get; set; }

        // If true: lightbox the task in an iframe
        // If false: use a full browser window
        [Display(Name="Popup over the discussion in a 'lightbox' (good for short elicitations)")]
        public bool CompleteTaskInPopup { get; set; }

        // If true: experts will be redirected (or lightboxed) to the elicitation/task before the discussion
        [Display(Name="Have assigned experts complete this BEFORE continuing to the discussion")]
        public bool CompleteTaskBeforeDiscussion { get; set; }

        [Display(Name="Enable results charts for widgets")]
        // Can the results of this Task be shared with everyone?
        public bool ShowResultsInDiscussion { get; set; }

        [InverseProperty("Task")]
        public virtual ICollection<TaskAssignment> TaskAssignments { get; set; }

        [NotMapped]
        public List<Person> AssignedToPeople {
            get {
                return this.TaskAssignments.Select(ta => ta.Person).ToList();
            }
        }

        public abstract TaskAssignment CreateAssignment(Person person);

        public TaskAssignment TaskAssignmentFor(Person person) {
            var personID = person.ID;
            return this.TaskAssignments.FirstOrDefault(ta => ta.Person_ID == personID);
        }

        [InverseProperty("Task")]
        public virtual ICollection<TaskResult> TaskResults { get; set; }

        public void UpdateNumAssignedAndCompletedFromDB() {
            this.NumAssigned = this.TaskAssignments.Count;
            this.NumCompleted = this.TaskAssignments.Count(ta => ta.Completed == true);
        }

        public int NumCompleted { get; set; }
        public int NumAssigned { get; set; }

        public abstract Task Clone(NearZeroContext thisDB, NearZeroContext otherDB, Discussion thisDiscussion = null);
        public void CopyOver(NearZeroContext thisDB, NearZeroContext otherDB, Discussion thisDiscussion, Task other) {
            other.Creator_ID = this.Creator_ID;
            other.Created = this.Created;
            other.Modified = this.Modified;
            other.LastCompleted = this.LastCompleted;
            other.Discussion = thisDiscussion;
            other.IntroMessage = this.IntroMessage;
            other.CompleteTaskInPopup = this.CompleteTaskInPopup;
            other.ShowResultsInDiscussion = this.ShowResultsInDiscussion;
            other.CompleteTaskBeforeDiscussion = this.CompleteTaskBeforeDiscussion;

            var newAssignments = this.TaskAssignments.ToList().Select(ta => ta.Clone(thisDB, otherDB));
            foreach (var assignment in newAssignments) {
                other.TaskAssignments.Add(assignment);
            }

            var newTaskResults = this.TaskResults.ToList().Select(tr => tr.Clone(thisDB, otherDB));
            foreach (var result in newTaskResults) {
                other.TaskResults.Add(result);
            }
        }
    }

    interface IInlineTask {
        [Display(Name="Complete inline with the flow of discussion (good for very short elicitations)")]
        bool CompleteTaskInline { get; set; }
    }
    
    // We implement this Task to make sure EF CodeFirst creates (and populates) a discriminator column
    // DO NOT DELETE this until there is /ANOTHER/ Task besides Elicitation implemented, or this will delete
    // the discriminator column from the DB, which will change the Model, and make you unhappy.
    public class PLACEHOLDER_TASK_DELETE_ME : Task {
        public PLACEHOLDER_TASK_DELETE_ME() {
            throw new NotImplementedException();
        }
        public override TaskAssignment CreateAssignment(Person person) {
            throw new NotImplementedException();
        }
        public override Task Clone(NearZeroContext thisDB, NearZeroContext otherDB, Discussion thisDiscussion = null) {
            throw new NotImplementedException();
        }

    }
}
