using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using System.Web.Security;

namespace NearZero.Models {
    /* This is our Person class */
    [Table("People")]
    public class Person {
        public int ID { get; set; }

        [NotMapped]
        public bool Virtual = false; // Means "this person doesn't really exist", we made the bastard up!

        [NotMapped]
        public string name {
            get {
                return this.FullName;
            }
            set {
                char[] splitBy = { ' ' };
                var names = value.Split(splitBy, count: 2);
                if (names.Length > 1) {
                    FirstName = names[0];
                    LastName = names[1];
                } else {
                    FirstName = "";
                    LastName = names[0];
                }
            }
        }

        [Required]
        [Display(Name = "First Name")]
        public string FirstName { get; set; }
        [Required]
        [Display(Name = "Last Name")]
        public string LastName { get; set; }

        public string Title { get; set; }

        [Required]
        [Display(Name = "Affiliation")]
        public string affiliation { get; set; }

        [Required, StringLength(254) /* this is indexed + set as Unique in the DB by migration People_email_Unique, length is required for index */]
        [Display(Name = "Email Address")]
        public string email { get; set; }

        /* This means... DO NOT EMAIL ME. EVER. */
        [Display(Name = "Do not email this person about NZ. Ever.")]
        public bool DoNotEmail { get; set; }

        /* Did the user take the action that set DoNotEmail? remember the action in case we change semantics later */
        [Display(Name = "Person actively opted out of all NZ email.")]
        public bool DoNotEmailActiveOptOut { get; set; }

        [NotMapped]
        public string FormalName {
            get {
                if (this.Title == null || this.Title == "" || this.Title == " ") {
                    return this.FullName;
                } else {
                    return this.Title + " " + this.LastName;
                }
            }
        }

        [NotMapped]
        public string FullName {
            get {
                return this.FirstName + " " + this.LastName;
            }
        }

        [NotMapped]
        public string EmailWithName {
            get {
                return '"' + this.name + '"' + " <" + this.email + ">";
            }
        }

        // Sufficient for passwords for now?
        public string access_token { get; set; }

        public virtual ICollection<DiscussionMembership> memberships { get; set; }
        public virtual ICollection<Report> Reports { get; set; }

        public virtual Profile Profile { get; set; }

        public void ResetAccessToken() {
            this.access_token = Sloppycode.AlphaNumericPasswordGenerator.Generate(14);
        }

        [NotMapped]
        public bool DisallowLoginViaAccessToken {
            get {
                return access_token == null;
            }
        }

        [NotMapped]
        public bool IsAdministrator {
            get {
                return Roles.IsUserInRole(this.email, "Administrator");
            }
        }
    }

    /* This is currently unused, but it will contain extended profile information */
    public class Profile {
        public int ID { get; set; }
        public string title { get; set; }
        public string bio { get; set; }
    }

}
