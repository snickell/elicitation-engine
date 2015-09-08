using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations;
using System.Net.Mail;
using System.ComponentModel.DataAnnotations.Schema;

namespace NearZero.Models {
    /* Discussion contains a series of Messages, and Topics, created by Experts
     * who have a DiscussionMembership */
    public class Discussion {
        public int ID { get; set; }

        [MinLength(3)]
        [RegularExpression(Validations.URI_FRAGMENT)]
        [Display(Name = "Discussion URL")]
        [Required, StringLength(128) /* this is indexed + set as Unique in the DB by migration People_email_Unique, length is required for index */]
        public string name { get; set; }

        [RegularExpression(Validations.CATEGORY)]
        [Display(Name = "NearZero Category")]
        public string category { get; set; }

        [MinLength(3)]
        [Display(Name = "Discussion Title")]
        public string title { get; set; }


        /* These settings control public display of discussions */
        [Display(Name = "Allow the general public to observe the discussion")]
        public bool AllowPublicObservers { get; set; }
        [Display(Name = "List as an ongoing discussion on the NearZero.org homepage")]
        public bool ListOnHomepage { get; set; }
        [Display(Name = "Twitter WidgetID to display as a feed (for publicly observable discussions)")]
        public string TwitterHashtag { get; set; }

        public int LastFigureNum { get; set; }
        public int getNextFigureNum() {
            return ++LastFigureNum;
        }

        // Maximumum number of DB objects in many instances
        public static int MAX_NUM_DB_OBJECTS = 10000;
        public virtual ICollection<DiscussionMembership> memberships { get; set; }
        public virtual ICollection<Topic> topics { get; set; }
        public virtual ICollection<Message> messages { get; set; }
        public virtual ICollection<Task> tasks { get; set; }

        public virtual DateTime Created { get; set; }
        public virtual DateTime LastActivity { get; set; } // anything... elicitation, changed description, response, message, etc
        public virtual DateTime LastMessage { get; set; } // only a message being posted

        [InverseProperty("Discussion")]
        public virtual ICollection<EmailToDiscussion> EmailsToDiscussion { get; set; }

        [NotMapped]
        public IEnumerable<Elicitation> Elicitations {
            get {
                return this.tasks.Where(task => task is Elicitation).Cast<Elicitation>();
            }
        }

        public Discussion() {
            this.AllowPublicObservers = false;
            this.ListOnHomepage = false;
            this.TwitterHashtag = "";

            this.messages = new List<Message>();
            this.tasks = new List<Task>();
            this.topics = new List<Topic>();
            this.memberships = new List<DiscussionMembership>();

            this.Created = this.LastActivity = this.LastMessage = DateTime.Now;
        }

        public ICollection<Message> sortedMessages(NearZeroContext db, string SortMessagesBy = null, bool? desc = null, DateTime? newerThan = null, Topic topic = null) {
            // F this: http://stackoverflow.com/questions/41244/dynamic-linq-orderby
            // Right now this is super specific

            if (SortMessagesBy == null) {
                SortMessagesBy = "date";
                desc = false;
            }
            if (desc == null) desc = true;

            var msgs = db.Messages.Include("sections.responses").Where(m => m.discussion_ID == this.ID && m.readyToUse == true);

            // Annoyingly, one form generates TOPIC_ID = ____ and the other TOPIC_ID IS NULL
            // just setting int? topic_ID = null doesn't work properly in SQL
            if (topic == null) {
                msgs = msgs.Where(m => m.Topic_ID == null);
            } else {
                msgs = msgs.Where(m => m.Topic_ID == topic.ID);
            }

            if (newerThan != null) {
                msgs = msgs.Where(m => m.lastUpdated > newerThan);
            }

            if (SortMessagesBy.Equals("expert")) {
                if (desc == true) {
                    msgs = msgs.OrderByDescending(message => message.from.FirstName).ThenByDescending(message => message.date);
                } else {
                    msgs = msgs.OrderBy(message => message.from.FirstName).ThenByDescending(message => message.date);
                }
            } else {
                // "date" is the default
                if (desc == true) {
                    msgs = msgs.OrderByDescending(message => message.date);
                } else {
                    msgs = msgs.OrderBy(message => message.date);
                }
            }

            return new List<Message>(msgs);
        }

        /*
        [NotMapped]
        public virtual IEnumerable<Message> readyMessages { 
            get {
                return (messages != null) ? messages.Where(m => m.readyToUse == true) : new List<Message>();
            }
        }
         */

        [NotMapped]
        public List<Person> People {
            get {
                if (memberships != null) {
                    return memberships.Select(m => m.Person).ToList();
                } else {
                    return null;
                }
            }
        }

        [NotMapped]
        public List<Person> DisabledPeople {
            get {
                return memberships.Where(m => m.Disabled).Select(m => m.Person).ToList();
            }
        }


        [NotMapped]
        public IEnumerable<Person> Participants {
            get {
                return this.memberships.Where(m => m.HasParticipated && m.ShowInParticipantsList && !m.Disabled).Select(m => m.Person);
            }
        }

        [NotMapped]
        public IEnumerable<Person> NonParticipants {
            get {
                return this.memberships.Where(m => !m.HasParticipated && m.ShowInParticipantsList && !m.Disabled).Select(m => m.Person);
            }
        }

        public string getEmailAddress(string domainName) {
            return name + "@" + domainName;
        }

        public MailAddress getMailAddress(string domainName) {
            return new MailAddress(this.getEmailAddress(domainName), this.title + " Discussion");
        }

        [NotMapped]
        static public string DomainName {
            get {
                return NearZero.Models.NZConfiguration.DomainName;
            }
        }

        // extraArgs must be of the form &blah=5&foo=4, etc.... starting & must be present
        static public string MakeURL(DiscussionMembership membership, string path, string extraArgs="") {
            // if we ever drop ?login, make sure to add a dummy argument ?dummy, so extraArgs can still start with a &
            return "http://" + Discussion.DomainName + path + "?login=" + membership.GetAnAccessToken() + extraArgs;
        }

        public string URL(DiscussionMembership membership, string subPath = "", string extraArgs = "") {
            return Discussion.MakeURL(membership, "/discussion/" + this.name + subPath, extraArgs);
        }

        public string URL(DiscussionMembership membership, Message message) {
            return URL(membership, subPath: "#Message-" + message.ID);
        }

        public void AddLogEntry(NearZeroContext db, Person Person, string EventType, string Text, string RequestArgs, bool InternalEvent, string PageInstance) {
            db.LogEntries.Add(new LogEntry {
                InternalEvent = InternalEvent,
                Person = Person,
                Discussion = this,
                PageInstance = PageInstance,
                Date = DateTime.Now,
                EventType = EventType,
                Text = Text,
                RequestArgs = RequestArgs
            });
        }

        [NotMapped]
        public IEnumerable<Person> Moderators {
            get {
                return this.memberships.Where(m => m.Moderator == true && !m.Disabled).Select(m => m.Person).Take(Discussion.MAX_NUM_DB_OBJECTS);
            }
        }

        public DiscussionMembership getMembershipFor(Person person, NearZeroContext db) {
            var membership = db.DiscussionMemberships.FirstOrDefault(m => m.discussion_ID == this.ID && m.Person_ID == person.ID);
            if (membership == null && person.IsAdministrator) {
                /* I'd really prefer to do this with inheritance, but that confuses EF's lil' brain */
                membership = new DiscussionMembership() {
                    Virtual = true,
                    Moderator = true,
                    ReadOnly = true
                };
            }
            return membership;
        }

        // See also: Validations.CATEGORY
        public static IEnumerable<string> CATEGORIES {
            get {

                string[] foo = { "Biomass", "Buildings", "Climate", "CCS", "Fossil", "Geothermal", "Hydro", "Industry", "Innovation", "Nuclear", "Other", "Solar", "Storage-and-transmission", "Transportation", "Wind" };
                return new List<string>(foo);
            }
        }

        public Discussion Clone(NearZeroContext thisDB, NearZeroContext otherDB) {
            var timeStarted = DateTime.Now;
            System.Diagnostics.Debug.WriteLine("Discussion.Clone" + this.name + " started at " + timeStarted.ToShortTimeString());

            bool sameDB = thisDB == otherDB;

            if (!sameDB) {
                throw new NotImplementedException("Everything is implemented EXCEPT cloning the people, and linking them in every which place (ugh). Need to implement that to do crossDB cloning");
                // Note that you should do a smart clone here, the target DB could include the people already, so first you look for them, and only
                // create them if they are a truly new entry in otherDB
            }

            Discussion other = otherDB.Discussions.Create();
            otherDB.Discussions.Add(other);

            var timestamp = DateTime.Now.ToString("MMM-d");

            other.name = sameDB ? this.name + "-Copy-" + timestamp : this.name;
            other.category = this.category;
            other.title = sameDB ? this.title + " Copy " + timestamp : this.title;
            other.AllowPublicObservers = this.AllowPublicObservers;
            other.ListOnHomepage = false; // NB: we do NOT clone this property for risk of negative effects!!!
            other.TwitterHashtag = this.TwitterHashtag;
            other.LastFigureNum = LastFigureNum;

            other.Created = this.Created;
            other.LastActivity = this.LastActivity;
            other.LastMessage = this.LastMessage;

            System.Diagnostics.Debug.WriteLine("\tmemberships");
            // memberships
            var memberships = this.memberships.ToList().Select(m => m.Clone(thisDB, otherDB));
            foreach (var m in memberships) {
                other.memberships.Add(m);
            }

            System.Diagnostics.Debug.WriteLine("\tmessages");
            // messages
            var oldMessagesToNew = this.messages.ToList().Select(m => new Tuple<Message,Message>(m, m.Clone(thisDB, otherDB))).ToDictionary(x => x.Item1, x => x.Item2);
            foreach (var newMessage in oldMessagesToNew.Values) {
                other.messages.Add(newMessage);
            }

            System.Diagnostics.Debug.WriteLine("\ttopics");
            // topics
            var oldTopicsToNew = this.topics.ToList().Select(t => new Tuple<Topic, Topic>(t, t.Clone(thisDB, otherDB))).ToDictionary(x => x.Item1, x => x.Item2);
            foreach (var t in oldTopicsToNew.Values) {
                other.topics.Add(t);
            }

            System.Diagnostics.Debug.WriteLine("\ttasks");
            // tasks & elicitations
            var oldTasksToNew = this.tasks.ToList().Select(m => new Tuple<Task, Task>(m, m.Clone(thisDB, otherDB, other))).ToDictionary(x => x.Item1, x => x.Item2);
            foreach (var newTask in oldTasksToNew.Values) {
                other.tasks.Add(newTask);
            }

            System.Diagnostics.Debug.WriteLine("\temails");
            // messages to the discussion...
            var emailsToDiscussion = this.EmailsToDiscussion.ToList().Select(email => email.Clone(thisDB, otherDB));
            foreach (var email in emailsToDiscussion) {
                other.EmailsToDiscussion.Add(email);
                if (email.AboutElicitation != null) {
                    email.AboutElicitation = (Elicitation)oldTasksToNew[email.AboutElicitation];
                }
                if (email.AboutMessage != null) {
                    email.AboutMessage = oldMessagesToNew[email.AboutMessage];
                }
            }

            otherDB.SaveChanges();


            System.Diagnostics.Debug.WriteLine("\trelinking messages...");
            other.RelinkMessagesAfterClone(oldMessagesToNew, oldTopicsToNew);

            otherDB.SaveChanges();

            System.Diagnostics.Debug.WriteLine("\tlogs");
            // log entries
            var oldLogs = thisDB.LogEntries.Where(log => log.Discussion_ID == this.ID).ToList();
            System.Diagnostics.Debug.WriteLine("\t\ttook logs");

            otherDB.Configuration.AutoDetectChangesEnabled = false;
            var i = 0;
            var total = oldLogs.Count();
            foreach (var oldLog in oldLogs) {
                var log = oldLog.Clone(thisDB, otherDB);
                log.Discussion = other;
                System.Diagnostics.Debug.WriteLine("\t\tsaving log #" + i + " of " + total + ", time elapsed is " + (DateTime.Now - timeStarted).TotalMinutes + " minutes");
                if (i % 1000 == 0) {
                    otherDB.SaveChanges();
                    System.Diagnostics.Debug.WriteLine("\t\tdb.SaveChanges()");
                }
                i++;
            }
            otherDB.SaveChanges();
            otherDB.Configuration.AutoDetectChangesEnabled = true;

            System.Diagnostics.Debug.WriteLine("\tdone!");
            return other;
        }

        private void RelinkMessagesAfterClone(Dictionary<Message, Message> oldMessagesToNew, Dictionary<Topic, Topic> oldTopicsToNew) {
            foreach (var msg in oldMessagesToNew.Values) {
                if (msg.inResponseTo != null) {
                    msg.inResponseTo = oldMessagesToNew[msg.inResponseTo];
                }

                foreach (var response in msg.ResponsesToMe) {
                    if (response.createdByMessage != null) {
                        response.createdByMessage = oldMessagesToNew[response.createdByMessage];
                    }
                }

                if (msg.Topic != null) {
                    msg.Topic = oldTopicsToNew[msg.Topic];
                }
            }
        }

        public string EmailPostscriptFor(DiscussionMembership membership) {
            return "Unsubscribe from email about this discussion: " + this.URL(membership, "/Unsubscribe");
        }
    }

    // This allows us to sort topics and messages together
    public interface IDiscussionMember {
        DateTime SortByDate { get; }
    }
}
