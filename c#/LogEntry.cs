using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace NearZero.Models {
    /* LogEntries are a logging mechanism to display basic UA, etc information
     * on access to a discussion. LogEntries for a Discussion are viewable by
     * a Moderator of the Discussion. This can be useful for answering questions
     * like "What browser was Person Blah using?" or "Did expert Blah open the elicitation?" */
    public class LogEntry {
        public int ID { get; set; }
        public bool InternalEvent { get; set; }

        [ForeignKey("Person")]
        public int Person_ID { get; set; }
        public virtual Person Person { get; set; }

        [ForeignKey("Discussion")]
        public int Discussion_ID { get; set; }
        public virtual Discussion Discussion { get; set; }

        public string PageInstance { get; set; }
        public DateTime Date { get; set; }
        public string EventType { get; set; }
        public string Text { get; set; }
        public string RequestArgs { get; set; }

        public LogEntry Clone(NearZeroContext thisDB, NearZeroContext otherDB) {
            var other = otherDB.LogEntries.Create();

            other.Person = this.Person;
            other.Discussion = this.Discussion;

            other.InternalEvent = this.InternalEvent;
            other.PageInstance = this.PageInstance;
            other.Date = this.Date;
            other.EventType = this.EventType;
            other.Text = this.Text;
            other.RequestArgs = this.RequestArgs;

            otherDB.LogEntries.Add(other);

            return other;
        }
    }

}