using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NearZero.Models {

    /* A TaskResult contains data for displaying the
     * result of completing the task to the rest of the conversation
     * participants. For example, in the case of ElicitationPerWidgetResult
     * the TaskResult contains JSON of all expert's submissions for the 
     * corresponding widget
     */
    public class TaskResult {
        public int ID { get; set; }

        [ForeignKey("Task")]
        public int Task_ID { get; set; }
        public virtual Task Task { get; set; }

        public DateTime Modified { get; set; }

        public void  CopyOver(TaskResult other) {
            other.Task = this.Task;
            other.Modified = this.Modified;
        }

        public virtual TaskResult Clone(NearZeroContext thisDB, NearZeroContext otherDB) {
            throw new NotImplementedException("Must be overridden by sub-classes!");
        }
    }

    // We implement this TaskResult to make sure EF CodeFirst creates (and populates) a discriminator column
    // DO NOT DELETE this until there is /ANOTHER/ TaskResult implemented or this will delete the discrim column from the DB
    public class PLACEHOLDER_TASK_RESULT_DELETE_ME : TaskResult {
        public PLACEHOLDER_TASK_RESULT_DELETE_ME() {
            throw new NotImplementedException();
        }
    }
}
