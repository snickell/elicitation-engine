
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations;

using System.Xml;


using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.ComponentModel.DataAnnotations.Schema;

namespace NearZero.Models {
    /* An Elicitation links to a series of ElicitationDefinitions, the latest of which defines
     * the current content of the elicitation. Persons who have an ElicitationAssignment (giving
     * them access to the Elicitation), then submit an ElicitationData containing the results
     * of their filling out the Elicitation */
    public class Elicitation : Task, IInlineTask {
        public Elicitation() : base() {
            this.CompletePageMessage = "Thanks for completing the elicitation!";
            this.CompleteTaskInline = false;
            this.DefinitionHistory = new List<ElicitationDefinition>();
        }
        public Elicitation(Person creator, Discussion discussion) : base(creator, discussion) {
            this.CompletePageMessage = "Thanks for completing the elicitation!";
            this.CompleteTaskInline = false;
            this.DefinitionHistory = new List<ElicitationDefinition>();
        }

        public override Task Clone(NearZeroContext thisDB, NearZeroContext otherDB, Discussion thisDiscussion = null) {
            if (thisDiscussion == null) thisDiscussion = this.Discussion;
            bool sameDiscussion = thisDiscussion == this.Discussion;

            Elicitation other = otherDB.Elicitations.Create();
            otherDB.Elicitations.Add(other);

            base.CopyOver(thisDB, otherDB, thisDiscussion, other);

            other.ElicitationName = this.ElicitationName;
            if (sameDiscussion) {
                other.ElicitationName += " Copy";
            }

            other.CompleteTaskInline = this.CompleteTaskInline;

            // FIXME: we do this because otherwise we get:
            // {"Unable to determine a valid ordering for dependent operations. Dependencies may exist due to foreign key constraints, model requirements, or store-generated values."}
            // between the elicitation and elicitationdefinition
            otherDB.SaveChanges();

            var oldToNewDefinitions = this.DefinitionHistory.ToList().Select(d => new Tuple<ElicitationDefinition, ElicitationDefinition>(d, d.Clone(thisDB, otherDB))).ToDictionary(x => x.Item1, x => x.Item2);
            foreach (var definitionPair in oldToNewDefinitions) {
                other.DefinitionHistory.Add(definitionPair.Value);
                if (this.Definition == definitionPair.Key) {
                    other.Definition = definitionPair.Value;
                }
            }

            foreach (var assignment in other.ElicitationAssignments) {
                foreach (var datum in assignment.ElicitationDatas) {
                    if (datum.ElicitationDefinition != null) {
                        datum.ElicitationDefinition = oldToNewDefinitions[datum.ElicitationDefinition];
                    }
                }
            }

            // FIXME: we do not copy the PerWidgetResults here
            other.UpdateNumAssignedAndCompletedFromDB();

            return other;
        }

        [Display(Name="Elicitation Title")]
        [Required]
        public string ElicitationName { get; set; }

        [ForeignKey("Definition")]
        public int? ElicitationDefinition_ID { get; set; }
        public virtual ElicitationDefinition Definition { get; set; }

        [InverseProperty("Elicitation")]
        public virtual ICollection<ElicitationDefinition> DefinitionHistory { get; set; }

        // Used to access this elicitation in review mode, a unique
        // GUID so only somebody who knows the ID can get at it.
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required]
        public virtual Guid ReviewToken { get; set; }

        // This is an inline elicitation, show it in the flow of the discussion
        public virtual bool CompleteTaskInline { get; set; }

        public string URL(DiscussionMembership membership) {
            return Discussion.MakeURL(membership, "/elicitation/run/" + this.ID + "/" + this.Discussion.name);
        }

        [NotMapped]
        public List<ElicitationAssignment> ElicitationAssignments {
            get {
                return TaskAssignments.Where(ta => ta is ElicitationAssignment).Select(ea => (ElicitationAssignment)ea).ToList();
            }
        }

        public override TaskAssignment CreateAssignment(Person person) {
            return new ElicitationAssignment(this, person);
        }

        // DB argument is optional, but improves query performance
        // FIXME: DOES this improve query performance ??? Or is LINQ actually smart enough to handle the non-DB case with a single query?
        public IQueryable<ElicitationAssignment> CompletedElicitationAssignments(NearZeroContext db, bool filterDisabledDiscussionMemberships=true) {
            IQueryable<ElicitationAssignment> assignments;
            if (db != null) {
                assignments = db.ElicitationAssignments.Where(ea => ea.Task_ID == this.ID);
            } else {
                assignments = this.TaskAssignments.AsQueryable().Where(ta => ta is ElicitationAssignment).Select(ea => (ElicitationAssignment)ea);
            }
            assignments = assignments.Include(m => m.Person).Include(m => m.CompletedElicitationData).Where(ea => ea.CompletedElicitationData_ID != null);

            // Filter out disabled discussion memberships from the data set
            if (filterDisabledDiscussionMemberships && this.Discussion != null) {
                var disabledPersonIDs = this.Discussion.memberships.Where(m => m.Disabled).Select(p => p.Person_ID);
                assignments = assignments.Where(a => !disabledPersonIDs.Contains(a.Person_ID));
            }


            return assignments;
        }

        [NotMapped]
        public ICollection<ElicitationPerWidgetResult> PerWidgetResults {
            get {
                return this.TaskResults.Cast<ElicitationPerWidgetResult>().ToList();
            }
        }

        [NotMapped]
        public IEnumerable<ElicitationDefinition.WidgetInstance> WidgetInstancesWithResults {
            get {
                var widgetInstances = this.PerWidgetResults.Select(w => new ElicitationDefinition.WidgetInstance {
                    instanceID = w.WidgetInstance_ID,
                    questionText = w.WidgetQuestionText
                });
                int num = widgetInstances.Count();
                return widgetInstances;
            }
        }

        [NotMapped]
        public string DiscussionName {
            get {
                return this.Discussion.name;
            }
        }
    }
}
