module.exports = function(sequelize, DataTypes) {
  return {
    webpages_Roles: sequelize.define('webpages_Roles', {
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
    webpages_UsersInRoles: sequelize.define('webpages_UsersInRoles', {
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
    EmailToDiscussions: sequelize.define('EmailToDiscussions', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      MessageSubject: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      MessageBody: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      Sent: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      From_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      Discussion_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      AboutElicitation_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      AboutMessage_ID: {
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
      DateSent: {
        type: DataTypes.DATE,
        allowNull: true
      },
      To: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      ToElicitationSubset: {
        type: DataTypes.STRING(-1),
        allowNull: true
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    EmailsToOnePerson: sequelize.define('EmailsToOnePerson', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      ReadyToSend: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      Sent: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      MessageFrom: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      MessageTo: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      MessageSubject: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      MessageBody: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      RawEmailSent: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      ToPerson_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      EmailToDiscussion_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      Discussion_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      DateSent: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    Discussions: sequelize.define('Discussions', {
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
    DiscussionMemberships: sequelize.define('DiscussionMemberships', {
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
    People: sequelize.define('People', {
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
      updatedAt: false
    }),
    LogEntries: sequelize.define('LogEntries', {
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
    Messages: sequelize.define('Messages', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      lastUpdated: {
        type: DataTypes.DATE,
        allowNull: false
      },
      messageBodyStore: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      readyToUse: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      delivered: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      attemptedDelivery: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      deliveryError: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      EmailMessageID: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      summaryPoint: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      raw_body: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      from_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      inResponseTo_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      discussion_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      inResponseTosNotified: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      Topic_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      discussionPrompt: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    MessageSections: sequelize.define('MessageSections', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      bodyRawIndexStart: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      bodyRawIndexEnd: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      wholeMessage: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      Message_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      highlight: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    Profiles: sequelize.define('Profiles', {
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
    RawEmailMessages: sequelize.define('RawEmailMessages', {
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
    Responses: sequelize.define('Responses', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      reason: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      Discriminator: {
        type: DataTypes.STRING(128),
        allowNull: false
      },
      messageSection_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      from_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      responseToMessage_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdByMessage_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      inResponseTosNotified: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    MediaCoverages: sequelize.define('MediaCoverages', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      MediaOutlet: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      ArticleTitle: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      URL: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      ArticleDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      DisplayOnReportPage: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      DisplayOnHomePage: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      Report_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      Importance: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    ElicitationDefinitions: sequelize.define('ElicitationDefinitions', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
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
    Reports: sequelize.define('Reports', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      Name: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      Category: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      Title: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      Subtitle: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      ModeratorName: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      ExecutiveSummary: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      IsPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      PublicationDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      Discussion_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      ListSizedImage_ID: {
        type: DataTypes.UUID,
        allowNull: true
      },
      ReportSizedImage_ID: {
        type: DataTypes.UUID,
        allowNull: true
      },
      PDF_ID: {
        type: DataTypes.UUID,
        allowNull: true
      },
      DescriptionForList: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      ExecutiveSummaryIntro: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      Modified: {
        type: DataTypes.DATE,
        allowNull: false
      },
      ParticipantCountCached: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      TranscriptURL: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      ExternalReportURL: {
        type: DataTypes.STRING(-1),
        allowNull: true
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    ReportAsset: sequelize.define('ReportAsset', {
      ID: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      },
      MimeType: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      NumBytes: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      Modified: {
        type: DataTypes.DATE,
        allowNull: false
      },
      ImageWidth: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      ImageHeight: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      ImageCaption: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      bytes: {
        type: DataTypes.STRING.BINARY,
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    ReportPersons: sequelize.define('ReportPersons', {
      Report_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      Person_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    ImageInMessages: sequelize.define('ImageInMessages', {
      ID: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      },
      Date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      Image: {
        type: DataTypes.STRING.BINARY,
        allowNull: true
      },
      MimeType: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      NumBytes: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      Message_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      ImageWidth: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ImageHeight: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ImageLargeSized: {
        type: DataTypes.STRING.BINARY,
        allowNull: true
      },
      ImageLargeSizedWidth: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ImageLargeSizedHeight: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ImageLargeSizedMimeType: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      ImagePageSized: {
        type: DataTypes.STRING.BINARY,
        allowNull: true
      },
      ImagePageSizedWidth: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ImagePageSizedHeight: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ImagePageSizedMimeType: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      ImageMobileSized: {
        type: DataTypes.STRING.BINARY,
        allowNull: true
      },
      ImageMobileSizedWidth: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ImageMobileSizedHeight: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ImageMobileSizedMimeType: {
        type: DataTypes.STRING(-1),
        allowNull: true
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    EmailAboutReportPublications: sequelize.define('EmailAboutReportPublications', {
      ID: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      },
      Email: {
        type: DataTypes.STRING(-1),
        allowNull: false
      },
      IPAddress: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      Created: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    MessageDrafts: sequelize.define('MessageDrafts', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      lastUpdated: {
        type: DataTypes.DATE,
        allowNull: false
      },
      body: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      membership_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      topic_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    }, {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }),
    Topics: sequelize.define('Topics', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      Created: {
        type: DataTypes.DATE,
        allowNull: false
      },
      Updated: {
        type: DataTypes.DATE,
        allowNull: false
      },
      Description: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      Cached_PersonNames: {
        type: DataTypes.STRING(-1),
        allowNull: true
      },
      Cached_NumMessages: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      Discussion_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      SummaryPoint_ID: {
        type: DataTypes.INTEGER,
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
    TaskAssignments: sequelize.define('TaskAssignments', {
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
    ElicitationDatas: sequelize.define('ElicitationDatas', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
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
    Tasks: sequelize.define('Tasks', {
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
};
