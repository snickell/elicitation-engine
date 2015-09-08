
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

    public class ElicitationAssignment : TaskAssignment {
        public ElicitationAssignment()
            : base() {
            this.ElicitationDatas = new List<ElicitationData>();
        }

        public ElicitationAssignment(Task task, Person person) : base(task, person) {
            this.ElicitationDatas = new List<ElicitationData>();
        }

        [NotMapped]
        public Elicitation Elicitation {
            get {
                return (Elicitation)this.Task;
            }
        }

        [NotMapped]
        public ElicitationData LastestElicitationData {
            get {
                return this.Completed ? this.CompletedElicitationData : this.ElicitationDatas.OrderByDescending(ed => ed.Modified).FirstOrDefault();
            }
        }

        [NotMapped]
        public override string URL {
            get {
                var discussion_ID = this.Elicitation.Discussion_ID;
                var membership = Person.memberships.Where(m => m.discussion_ID == discussion_ID).FirstOrDefault();
                return this.Elicitation.URL(membership);
            }
        }

        [ForeignKey("CompletedElicitationData")]
        public int? CompletedElicitationData_ID { get; set; }
        public virtual ElicitationData CompletedElicitationData { get; set; }

        [InverseProperty("ElicitationAssignment")]
        public virtual ICollection<ElicitationData> ElicitationDatas { get; set; }

        // The last web browser to access this elicitation assignment, useful for
        // debugging cases where somebody can't view an elicitation at all
        public string LastBrowserUserAgent { get; set; }

        public override TaskAssignment Clone(NearZeroContext thisDB, NearZeroContext otherDB) {
            var other = otherDB.ElicitationAssignments.Create();
            base.CopyOver(other); // need to assign the Task first
            otherDB.ElicitationAssignments.Add(other);

            other.LastBrowserUserAgent = this.LastBrowserUserAgent;

            var oldDataToNewData = this.ElicitationDatas.ToList().Select(ed => new Tuple<ElicitationData, ElicitationData>(ed, ed.Clone(thisDB, otherDB)));
            foreach (var datumPair in oldDataToNewData) {
                other.ElicitationDatas.Add(datumPair.Item2);
                if (this.CompletedElicitationData == datumPair.Item1) {
                    other.CompletedElicitationData = datumPair.Item1;
                }
            }

            return other;
        }
    }

}
