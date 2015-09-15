module.exports = function(sequelize, DataTypes) {
  var m = {
    
    Discussion: sequelize.define('Discussions', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      category: {
        type: DataTypes.STRING(-1),
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),  
    DiscussionMembership: sequelize.define('DiscussionMemberships', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      Moderator: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },      
      /*
        [ForeignKey("discussion")]
        public int discussion_ID { get; set; }
        public virtual Discussion discussion { get; set; }

        [ForeignKey("Person")]
        public int Person_ID { get; set; }
        public virtual Person Person { get; set; }

        public bool AllowModerator {
            get {
                return this.Moderator || this.Person.IsAdministrator;
            }
        }
      */
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),      
    webpages_Role: sequelize.define('webpages_Roles', {
      RoleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      RoleName: {
        type: DataTypes.STRING(256),
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    webpages_UsersInRole: sequelize.define('webpages_UsersInRoles', {
      UserId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      RoleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    ImageInElicitation: sequelize.define('ImageInElicitation', {
      ID: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      },
      Date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      LargeWidth: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      LargeHeight: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      LargeMimeType: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      NormalWidth: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      NormalHeight: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      NormalMimeType: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      MobileWidth: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      MobileHeight: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      MobileMimeType: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      Elicitation_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      UploadedBytes: {
        type: DataTypes.STRING.BINARY,
        allowNull: false
      },
      UploadedBytesSize: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      UploadedBytesMimeType: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      LargeBytes: {
        type: DataTypes.STRING.BINARY,
        allowNull: false
      },
      NormalBytes: {
        type: DataTypes.STRING.BINARY,
        allowNull: false
      },
      MobileBytes: {
        type: DataTypes.STRING.BINARY,
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    Discussion: sequelize.define('Discussions', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(128),
        allowNull: false
      },
      category: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      title: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      LastFigureNum: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      AllowPublicObservers: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      ListOnHomepage: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      TwitterHashtag: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      Created: {
        type: DataTypes.DATE,
        allowNull: false
      },
      LastActivity: {
        type: DataTypes.DATE,
        allowNull: false
      },
      LastMessage: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    DiscussionMembership: sequelize.define('DiscussionMemberships', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      invited: {
        type: DataTypes.DATE,
        allowNull: false
      },
      Moderator: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      ShowInParticipantsList: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      HasParticipated: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      discussion_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      Person_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      ReadOnly: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      HighlightLatestSummaryPoint: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      LastAccessed: {
        type: DataTypes.DATE,
        allowNull: true
      },
      HasCompletedATask: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      HasPostedAMessage: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      HasAgreeDisagreed: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      ModeratorNotesAboutPerson: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      LastParticipated: {
        type: DataTypes.DATE,
        allowNull: true
      },
      DoNotEmail: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      DoNotEmailActiveOptOut: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      DoNotEmailAboutComments: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      Disabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    Person: sequelize.define('People', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      affiliation: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: false
      },
      access_token: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      Profile_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      FirstName: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      LastName: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      Title: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      DoNotEmail: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      DoNotEmailActiveOptOut: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      instanceMethods: {
        DisallowLoginViaAccessToken: function () {
          return this.access_token == null;
        }
      }
    }),
    LogEntry: sequelize.define('LogEntries', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      InternalEvent: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      PageInstance: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      Date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      EventType: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      Text: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      RequestArgs: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      Person_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      Discussion_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    Profile: sequelize.define('Profiles', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      bio: {
        type: DataTypes.STRING(-1),
        allowNull: true
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    RawEmailMessage: sequelize.define('RawEmailMessages', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      raw: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      Message_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    ElicitationDefinition: sequelize.define('ElicitationDefinitions', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true 
      },
      Definition: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      Elicitation_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      CreatedBy_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      Created: {
        type: DataTypes.DATE,
        allowNull: false
      },
      Modified: {
        type: DataTypes.DATE,
        allowNull: false
      },
      ChangeSummary: {
        type: DataTypes.STRING(-1),
        allowNull: true
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    TaskResults: sequelize.define('TaskResults', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      Task_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      Modified: {
        type: DataTypes.DATE,
        allowNull: false
      },
      JSON: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      numResultsInJSON: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      WidgetInstance_ID: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      WidgetType: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      WidgetQuestionText: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      Discriminator: {
        type: DataTypes.STRING(128),
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    TaskAssignment: sequelize.define('TaskAssignments', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      Task_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      Person_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      Completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      Created: {
        type: DataTypes.DATE,
        allowNull: false
      },
      Modified: {
        type: DataTypes.DATE,
        allowNull: false
      },
      CompletedElicitationData_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      Discriminator: {
        type: DataTypes.STRING(128),
        allowNull: false
      },
      LastAccessed: {
        type: DataTypes.DATE,
        allowNull: true
      },
      LastBrowserUserAgent: {
        type: DataTypes.STRING(-1),
        allowNull: true
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    ElicitationData: sequelize.define('ElicitationDatas', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true        
      },
      ElicitationTask_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      JSON: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      Completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      Created: {
        type: DataTypes.DATE,
        allowNull: false
      },
      Modified: {
        type: DataTypes.DATE,
        allowNull: false
      },
      ElicitationDefinition_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      BrowserUserAgent: {
        type: DataTypes.STRING(-1),
        allowNull: true
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    Task: sequelize.define('Tasks', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      Discussion_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      Creator_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      Created: {
        type: DataTypes.DATE,
        allowNull: false
      },
      ElicitationName: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      Discriminator: {
        type: DataTypes.STRING(128),
        allowNull: false
      },
      ElicitationDefinition_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      Modified: {
        type: DataTypes.DATE,
        allowNull: false
      },
      IntroMessage: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      CompleteTaskInPopup: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      ShowResultsInDiscussion: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      NumCompleted: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      NumAssigned: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ReviewToken: {
        type: DataTypes.UUID,
        allowNull: false
      },
      CompletePageMessage: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      CompletePageIncludeLinkToDiscussion: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      CompleteTaskBeforeDiscussion: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      CompleteTaskInline: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      LastCompleted: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    webpages_OAuthMembership: sequelize.define('webpages_OAuthMembership', {
      Provider: {
        type: DataTypes.STRING(30),
        primaryKey: true,
        allowNull: false
      },
      ProviderUserId: {
        type: DataTypes.STRING(100),
        primaryKey: true,
        allowNull: false
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    webpages_Membership: sequelize.define('webpages_Membership', {
      UserId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      CreateDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      ConfirmationToken: {
        type: DataTypes.STRING(128),
        allowNull: true
      },
      IsConfirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      LastPasswordFailureDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      PasswordFailuresSinceLastSuccess: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      Password: {
        type: DataTypes.STRING(128),
        allowNull: false
      },
      PasswordChangedDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      PasswordSalt: {
        type: DataTypes.STRING(128),
        allowNull: false
      },
      PasswordVerificationToken: {
        type: DataTypes.STRING(128),
        allowNull: true
      },
      PasswordVerificationTokenExpirationDate: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    })
  };
  
  m.Discussion.belongsToMany(m.Person, {through: 'DiscussionMemberships', foreignKey: 'Person_ID'  });
  m.Person.belongsToMany(m.Discussion, {through: 'DiscussionMemberships', foreignKey: 'discussion_ID' });
  
  return m;
};
