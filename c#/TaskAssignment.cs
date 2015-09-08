using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NearZero.Models {
    /* A TaskAssignment links/assigns a sub-class of Task (e.g. an Elicitation) 
     * to be Completed by an Expert. */
    public class TaskAssignment {
        public int ID { get; set; }

        public TaskAssignment() {
            this.Completed = false;
            this.Created = this.Modified = DateTime.Now;
        }
        public TaskAssignment(Task task, Person person)
            : this() {
            this.Task = task;
            this.Person = person;
        }

        [ForeignKey("Task")]
        public int Task_ID { get; set; }
        public virtual Task Task { get; set; }

        [ForeignKey("Person")]
        public int Person_ID { get; set; }
        public virtual Person Person { get; set; }

        public bool Completed { get; set; }

        public DateTime Created { get; set; }
        public DateTime Modified { get; set; }

        public DateTime? LastAccessed { get; set; }

        [NotMapped]
        virtual public string URL { get { throw new NotImplementedException("Must be overridden by subclasses"); } }

        [NotMapped]
        public bool HasBeenAccessed {
            get {
                return this.LastAccessed != null;
            }
        }

        public virtual TaskAssignment Clone(NearZeroContext thisDB, NearZeroContext otherDB) {
            throw new NotImplementedException("must be overridden...");
        }

        public virtual void CopyOver(TaskAssignment other) {
            other.Task = this.Task;
            other.Person = this.Person;
            other.Completed = this.Completed;
            other.Created = this.Created;
            other.Modified = this.Modified;
            other.LastAccessed = this.LastAccessed;
        }
    }
}
