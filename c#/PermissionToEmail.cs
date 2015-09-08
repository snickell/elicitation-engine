using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NearZero.Models {
    public class PermissionToEmail {
        public static Func<TypeOfEmail, Person, bool> EmailToPersonIsForbidden =
            (t, p) => p.DoNotEmail;

        public static Func<TypeOfEmail, DiscussionMembership, bool> EmailIsForbidden =
            (t, m) =>
                m.DoNotEmail
                || m.Disabled
                || EmailToPersonIsForbidden(t,m.Person)
                || t == TypeOfEmail.NEW_DISCUSSION_COMMENT_NOTIFICATION && m.DoNotEmailAboutComments;


        // Only use this convenience version if you don't have a discussion membership in hand already... its relatively slow.
        public static bool MayISendThisEmail(TypeOfEmail typeOfEmail, Person toPerson, Discussion aboutDiscussion, NearZeroContext db) {
            return MayISendThisEmail(typeOfEmail, aboutDiscussion.getMembershipFor(toPerson, db));
        }
        public static bool MayISendThisEmail(TypeOfEmail typeOfEmail, DiscussionMembership toMembership) {
            return !EmailIsForbidden(typeOfEmail, toMembership);
        }

        public static bool MayISendThisEmailOutsideADiscussion(TypeOfEmail typeOfEmail, Person person) {
            return !EmailToPersonIsForbidden(typeOfEmail, person);
        }

        
        public static IEnumerable<DiscussionMembership> GetPermittedEmailListFor(Discussion discussion, TypeOfEmail typeOfEmail) {
            
            return discussion.memberships.Where(m => !EmailIsForbidden(typeOfEmail, m));
        }

        public static IEnumerable<DiscussionMembership> GetDoNotEmailListFor(Discussion discussion, TypeOfEmail typeOfEmail) {
            return discussion.memberships.Where(m => EmailIsForbidden(typeOfEmail, m));
        }

        public enum TypeOfEmail {
            FROM_DISCUSSION_MODERATOR,
            NEW_DISCUSSION_COMMENT_NOTIFICATION,
            SOMEONE_REPLIED_TO_YOU_NOTIFICATION
        }

        public class NotPermittedException : Exception { }

    }
}
