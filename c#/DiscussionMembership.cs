using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations;
using System.Net.Mail;
using System.ComponentModel.DataAnnotations.Schema;

namespace NearZero.Models {

    /* Every Person<->Discussion pair has a DiscussionMembership */
    public class DiscussionMembership {

        public DiscussionMembership() {
            this.Moderator = false;
            this.ShowInParticipantsList = true;
            this.ReadOnly = false;
            this.HighlightLatestSummaryPoint = false;
            this.invited = DateTime.Now;
            this.HasParticipated = false;
            this.HasCompletedATask = false;
            this.HasPostedAMessage = false;
            this.HasAgreeDisagreed = false;
            this.LastAccessed = null;
            this.Virtual = false;
            this.ModeratorNotesAboutPerson = "";

            this.DoNotEmail = false;
            this.DoNotEmailAboutComments = true;
            this.Disabled = false;
        }

        public int ID { get; set; }

        [ForeignKey("discussion")]
        public int discussion_ID { get; set; }
        public virtual Discussion discussion { get; set; }

        [ForeignKey("Person")]
        public int Person_ID { get; set; }
        public virtual Person Person { get; set; }

        /* When were they sent an invite? */
        public DateTime invited { get; set; }

        /* Do not send this person email about this discussion */

        [Display(Name = "Do not email this person about this discussion")]
        public bool DoNotEmail { get; set; }

        /* Did the user take the action that set DoNotEmail? remember the action in case we change semantics later */
        [Display(Name = "Person actively opted out of all email about this discussion")]
        public bool DoNotEmailActiveOptOut { get; set; }

        /* Do not send this person auto-email when comments are posted */
        [Display(Name = "Do not email this person when somebody adds a comment")]
        public bool DoNotEmailAboutComments { get; set; }

        /* Do not allow this person to access the discussion at all (aka soft-delete) */
        public bool Disabled { get; set; }

        /* Allow this person to use moderator features? */
        [NotMapped]
        public bool AllowModerator {
            get {
                return this.Moderator || this.Person.IsAdministrator;
            }
        }

        /* Is this Person marked as a Moderator? */
        /* NB: You should generally use AllowModerator to access this property,
         * unless you are explicitly trying to Read/Write it, as AllowModerator
         * will enable any "moderator like person" (e.g. Admins too) */
        public bool Moderator { get; set; }

        /* Allow this person to show up in Participants list? */
        [Display(Name = "Include in the participants list")]
        public bool ShowInParticipantsList { get; set; }

        /* Allow this person to submit things to the discussion? */
        public bool ReadOnly { get; set; }

        public bool HighlightLatestSummaryPoint { get; set; }

        public string GetAnAccessToken() {
            return this.Person.access_token;
        }

        // Has this Person done something to participate? Or were they only invited...
        // HasParticipated includes elicitatation, discussion, messages, agree/disagree.... really ANYTHING
        public bool HasParticipated { get; set; }

        public bool HasCompletedATask { get; set; }
        public bool HasPostedAMessage { get; set; }
        public bool HasAgreeDisagreed { get; set; }

        public bool HasDiscussed {
            get {
                return this.HasAgreeDisagreed || this.HasPostedAMessage;
            }
        }

        public DateTime? LastAccessed { get; set; }
        public DateTime? LastParticipated { get; set; } // any form of participation

        // Allows the moderator to record notes about this person
        [Display(Name = "Moderator-only notes about this expert")]
        [DataType(DataType.MultilineText)]
        public string ModeratorNotesAboutPerson { get; set; }

        [NotMapped]
        public bool HasAccessed {
            get {
                return this.LastAccessed != null;
            }
        }

        [NotMapped]
        public bool Virtual;



        public DiscussionMembership Clone(NearZeroContext thisDB, NearZeroContext otherDB) {
            var other = otherDB.DiscussionMemberships.Create();
            other.discussion = this.discussion;
            otherDB.DiscussionMemberships.Add(other);

            other.Person = this.Person;
            other.invited = this.invited;
            other.DoNotEmail = this.DoNotEmail;
            other.DoNotEmailAboutComments = this.DoNotEmailAboutComments;
            other.Disabled = this.Disabled;
            other.Moderator = this.Moderator;
            other.ShowInParticipantsList = this.ShowInParticipantsList;
            other.ReadOnly = this.ReadOnly;
            other.HighlightLatestSummaryPoint = this.HighlightLatestSummaryPoint;
            other.HasParticipated = this.HasParticipated;
            other.HasPostedAMessage = this.HasPostedAMessage;
            other.HasAgreeDisagreed = this.HasAgreeDisagreed;
            other.LastAccessed = this.LastAccessed;
            other.LastParticipated = this.LastParticipated;
            other.ModeratorNotesAboutPerson = this.ModeratorNotesAboutPerson;

            return other;
        }
    }
}
