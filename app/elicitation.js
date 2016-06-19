(function (EAT, Ember, ElicitationUtils, window, undefined) {
    "use strict";

    EAT.Elicitation = Ember.Object.extend({
        /* BEGIN: initialization properties: These properties should probably be initialized or bound upon creation */
        elicitationDefinition: null, // bind this to a string to load the elicitation definition XML
        priorSessionData: null, // serialized data from a previous session of eliciting
        priorDataRaw: null, // elicitation author defined per-person data, will be bound into variables
      
        resumedFromPriorSessionData: false,
        resumedStartingOnPageNum: null,

        embedded: false,
        allowEditing: false,
        editorWithoutAssignment: false, // if true, can edit, but can't submit responses
        switchToEditModeAfterLoading: false, // this property is a bad hack, but something goes wrong if we default to editMode: true
        switchToReviewModeAfterLoading: false,

        email: null,
        notTheLatestRevision: null,
        elicitationDefinitionID: null,
        cannotReachServer: false,

        saveDataURL: null,
        discussionURL: null,
        saveDefinitionURL: null,
        redirectAfterSubmitURL: null,
        imageURL: null,
        uploadImageURL: null,

        /* admin urls */
        reviewAdminURL: null,
        assignedToAdminURL: null,
        dataAdminURL: null,
        changeHistoryAdminURL: null,

        completePageMessage: null,
        completePageIncludeLinkToDiscussion: null,

        personID: null,
      

        /* END: initialization properties */

        init: function () {
            this._super();

            window.debug.elicitation = this;

            // restore serialized data from a previous run of eliciting, if it exists
            var priorSessionData = {};
            var resumeFromPriorSessionData = false;
            try {
                priorSessionData = JSON.parse(this.get('priorSessionData'));
                resumeFromPriorSessionData = true;
            } catch (e) { }

            // First setup the various controllers and objects
            this.set('pageFooter', EAT.PageFooterController.create());
            this.set('customWidgets', EAT.CustomWidgetsController.create());
            this.set('phraseDefinitions', EAT.PhraseDefinitionsController.create());
            this.set('pagesController', EAT.PagesController.create({ elicitation: this }));
            this.set('serializedData', EAT.RootSerializedData.create(priorSessionData));
            this.set('markdownConverter', EAT.CreateMarkdownConverter(this));

            // Now load the serialized elicitation from an XML string
            this.loadFromXML(this.get('elicitationDefinition'));
            
            var customScriptingVariables = Ember.ArrayController.create();
            this.set('customScriptingVariables', customScriptingVariables);
            
            // parse priorDataRaw into custom scripting variables
            try {
                var priorData = JSON.parse(this.get('priorDataRaw'));
                for (var key in priorData) {
                    if (priorData.hasOwnProperty(key)) {
                        customScriptingVariables.pushObject(Ember.Object.create({
                            name: key,
                            value: priorData[key]
                        }));
                    }
                }
            } catch (e) {
              console.error("Couldn't parse priorData: ", e);
            };            
            
            if (resumeFromPriorSessionData) {
                this.resumeFromPriorSessionData();
            }

            // Run BeforeEntering scripts on the initial page (=page1 unless we resumed on a later page)
            Ember.run.next(this, function () {
                // we do this in the next run loop so variable bindings have been resolved
                this.get('pagesController').runBeforeEnteringOnCurrentPage();
            });

            var self = this;

            // FIXME: bad hack, mysterious "inBuffer" problem if editMode defaults to 'true'
            if (this.get('switchToEditModeAfterLoading')) {
                window.setTimeout(function () {
                    self.set('editMode', true);
                }, 500);
            } else if (this.get('switchToReviewModeAfterLoading')) {
                window.setTimeout(function () {
                    self.set('reviewMode', true);
                }, 500);
            }

            // FIXME: this should probably be unbound to clean up the resources
            // see: https://github.com/emberjs/ember.js/issues/1603
            $(window).bind('beforeunload', function () {
                return self.beforeUnload();
            });

            confidentialityIndicator.initialize($("#confidentiality-indicator-box"));
            confidentialityIndicator.setPolicy({
                "Your Participation": "Public",
                "Your Responses (not attributed)": "Panel Only",
                "Your Responses (attributed)": "Confidential"
            });
        },
        resumeFromPriorSessionData: function () {
            var currentPageNum;
            if (currentPageNum = this.get('serializedData.metadata.currentPageNum')) {
                console.log("elicitation.resumeFromPriorSessionData(): setting page num to ", currentPageNum);
                this.set('pagesController.currentPageNum', currentPageNum);
                this.set('resumedFromPriorSessionData', true);
                this.set('resumedStartingOnPageNum', currentPageNum);
            }
        },
        loadFromXML: function (elicitationDefinitionString) {
            var xml = $($.parseXML(elicitationDefinitionString));
            var elicitationXML = xml.find("elicitation");

            this.get('customWidgets').loadFromXML(elicitationXML.children("custom-widget"));

            // Load pages from XML
            this.get('pagesController').loadPagesFromXML(elicitationXML.children("page"));

            // Load phrase definitions from XML file
            this.get('phraseDefinitions').loadPhrasesFromXML(elicitationXML.children("definition"));

            this.get('pageFooter').loadFromXML(elicitationXML.children("page-footer"));
        },

        numPages: Ember.computed.alias('pagesController.numPages'),
        currentPageBinding: 'pagesController.currentPage',
        widgets: Ember.computed.alias('pagesController.allWidgets'),

        editMode: false,
        reviewMode: false,
        widgetGalleryIsOpen: false,
        widgetGalleryAddsToPage: null,
        hideScrollbarsWhenWidgetGalleryIsShown: function () {
            if (this.get('widgetGalleryIsOpen')) {
                $("html").css('overflow-y', 'hidden');
            } else {
                $("html").css('overflow-y', 'auto');
            }
        }.observes('widgetGalleryIsOpen'),

        hasBeenEdited: false,
        saveInProgress: false,
        saveMessage: null,
        widgetBeingEdited: null,
        markdownConverter: null, // set in ready()
        customScriptingVariables: undefined,        
        closeWidgetBeingEditedOnEditModeChange: function () {
            this.set('widgetBeingEdited', null);
        }.observes('editMode'),
        beforeUnload: function () {
            var firefox = /Firefox[\/\s](\d+)/.test(navigator.userAgent);

            if (this.get('allowEditing') && !this.get('definitionIsSaved')) {
                return "You may have unsaved changes to the elicitation.";
            } else if (!(this.get('submitted') || this.get('serializedDataIsEmpty') || firefox)) {
                return "You can resume where you left off by visiting this elicitation again at a later time. You won't be able to go backward from this point, but all your previous responses will be preserved if you resume later.";
            }
        },        
        print: function () {
            window.print();
        },
        saveChangesAs: function () {
            var newName = prompt("Title for new elicitation?");
            if (Ember.isNone(newName)) {
                // cancel, nothing to do
            } else if (newName.length < 4) {
                alert("WARNING: The title for the new elicitation was too short, not saving, please try again.");
            } else {
                this.saveChanges(newName);
            }
        },
        saveChanges: function (saveAsNewElicitationName) {
            var saveAsNewElicitation = (saveAsNewElicitationName != undefined);

            this.set('saveInProgress', true);
            this.set('saveMessage', undefined);

            var url = this.get('saveDefinitionURL');

            var serialized = this.serializeDefinition()[0];
            ElicitationUtils.removeXMLInvalidCharacters(serialized);
            serialized = ElicitationUtils.outerXML(serialized);

            if (this.get('notTheLatestRevision')
                && !confirm("Warning: you are editing a revision, saving"
                + " changes will replace the latest version.")) {
                return;
            }

            // FIXME: disabled until we can make it optional
            // nobody except seth actually summarizes anyway, so its just a hassle, right?
            //
            //var changeSummary = prompt("Saving Elicitation. Summarize what you changed:");
            var changeSummary = "";

            if (Ember.isNone(changeSummary)) return;

            // console.log("saveChanges(), saving: ", serialized);

            var dataToSubmit = {
                ElicitationDefinition: serialized,
                ChangeSummary: changeSummary,
                SaveAsNewElicitation: saveAsNewElicitation,
                SaveAsNewElicitationName: saveAsNewElicitationName
            };

            // We set this here instead of after successfully saving because they may
            // start editing between, and we don't want to overwrite that state
            // but if we fail, we'll mark this true again
            this.set('definitionHasBeenEdited', false);

            var self = this;
            jQuery.post(url, dataToSubmit, function (data, textStatus, jqXHR) {
                var date = new Date();
                var hours = date.getHours();
                var suffix = hours > 12 ? "p" : "a";
                hours = hours > 12 ? hours - 12 : hours;
                var minutes = date.getMinutes();
                minutes = minutes < 10 ? " " + minutes.toString() : minutes.toString();
                var timeSaved = hours + ":" + minutes + suffix;

                var saveMessage = "Last save: " + timeSaved;
                if (saveAsNewElicitation) {
                    saveMessage = "Saved a copy";
                    alert("A new elicitation named '" + saveAsNewElicitationName + "' has been created. You can access it from the discussion.");
                }
                self.set('saveMessage', saveMessage);

                console.log("saveChanges(), server response:", data);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                window.debug.JqXHR = jqXHR;
                window.debug.TextStatus = textStatus;
                window.debug.ErrorThrown = errorThrown;

                // We didn't save, so the definition is (probably, might as well be safe) dirty
                self.set('definitionHasBeenEdited', true);

                alert("Error saving elicitation, is your internet still connected? Please try to save again.\n\n\t" + jqXHR.responseText);
                self.set('saveMessage', "Problem saving!");
                console.error("elicitation.saveChanges(), window.debug.definition=");
                window.debug.definition = serialized;                
                console.warn(window.debug.definition);
                console.error("Error was:", jqXHR.responseText);
            }).always(function () {
                self.set('saveInProgress', false);
            });
        },
        definitionIsSaved: function () {
            return !(this.get('definitionHasBeenEdited') || this.get('saveInProgress'));
        }.property('definitionHasBeenEdited', 'saveInProgress'),
        definitionHasBeenEdited: false,
        watchWhenDefinitionIsEdited: function () {
            this.set('definitionHasBeenEdited', true);
        }.observes('widgetBeingEdited'),
        serializeDefinition: function () {
            // This is required because the javascript data output format
            // can't have duplicate page keys (title).
            // Oops. Can be fixed by giving each page a UUID
            this.get('pagesController').renameDuplicatePageTitles();

            var doc = $.parseXML("<elicitation></elicitation>");
            var serialized = $(doc).find("elicitation");

            this.get('pagesController').forEach(function (page) {
                serialized.append(page.serializeDefinition(doc));
            });

            serialized.append(this.get('phraseDefinitions').serializeDefinition(doc));
            serialized.append(this.get('pageFooter').serializeDefinition(doc));
            serialized.append(this.get('customWidgets').serializeDefinition(doc));

            return serialized;
        },
        variables: function () {
            var variables = [];
            var widgets = this.get('widgets');
            if (!Ember.isNone(widgets)) {
                widgets.forEach(function (widget) {
                    widget.get('definition.variables').forEach(function (variable) {
                        variables.push(variable);
                    });
                });
            }
            
            // merge in customScriptingVariables
            var customScriptingVariables = this.get('customScriptingVariables');
            customScriptingVariables.forEach(function (variable) {
                variables.push(variable); 
            });
            
            return variables;
        }.property('widgets.@each.definition.variables.@each', 'customScriptingVariables.@each'),
        variableScope: function () {
            var scope = {};
            this.get('variables').forEach(function (variable) {
              try {
                scope[variable.get('name')] = variable.get('value');
              } catch (e) {
                console.error("\tvariableScope(): error getting a variable", variable, e);
              }
            });
            return scope;
        }.property('variables', 'variables.@each', 'variables.@each.name', 'variables.@each.value'),
        submitted: false,
        pendingSubmitDataRequest: null,
        submitData: function (finalSubmission) {
            var data = this.get('serializedData');
            window.debug.lastSubmitData = data;
            
            if (finalSubmission)
              console.log("submitData(): ", data);


            var email = this.get('email');
            var dataToSubmit = [
                {
                    name: 'email',
                    value: email
                },
                {
                    name: "elicitation_definition_id",
                    value: this.get('elicitationDefinitionID')
                }
            ];

            if (finalSubmission) {
                dataToSubmit.push({ name: 'completed', value: '1' });
                $("input#next").val("Submitting...").attr("disabled", "disabled");
            }

            var json = JSON.stringify(data);
            dataToSubmit.push({
                name: 'json',
                value: json
            });

            var pendingSubmitDataRequest = this.get('pendingSubmitDataRequest');
            if (pendingSubmitDataRequest) {
                pendingSubmitDataRequest.abort();
            }

            var url = this.get('saveDataURL');
            if (url == undefined) url = '/';

            if (finalSubmission)
              console.log(json);
            window.debug.lastSubmitJSON = json;
            
            if (this.get('editorWithoutAssignment')) {
                console.warn("submitData(): moderator/admin without assignment, not submitting. see window.debug.lastSubmitJSON");
                return;
            }

            var elicitation = this;
            pendingSubmitDataRequest = jQuery.post(url, dataToSubmit, function (data, textStatus, jqXHR) {
                elicitation.set('pendingSubmitDataRequest', null);
                elicitation.set('errorSubmittingToServer', false);

                if (finalSubmission) {
                    /* FIXME: ollllllld relic, this should be emberified! */
                    elicitation.set('submitted', true);
                    $("div#footer").fadeOut();
                    $(".elicitation").fadeOut('fast', function () {
                        var onSubmit = $("div.post-submit").attr("onSubmit");
                        if (onSubmit != null && onSubmit.length > 0) {
                            eval(onSubmit);
                        } else if (elicitation.get('redirectAfterSubmitURL')) {
                            window.location = elicitation.get('redirectAfterSubmitURL');
                        } else {
                            $("div.post-submit").fadeIn('fast');
                        }
                    });
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                window.debug.JqXHR = jqXHR;
                window.debug.TextStatus = textStatus;
                window.debug.ErrorThrown = errorThrown;
                window.debug.ResponseText = jqXHR.responseText;

                console.warn("window.debug.lastSubmitData = ", window.debug.lastSubmitData);
                console.warn("window.debug.lastSubmitJSON = ", window.debug.lastSubmitJSON);
                console.error("submitData() failed, server responded with an error:\n\n", debug.ErrorThrown, "\n", debug.ResponseText, "\n");

                elicitation.set('errorSubmittingToServer', true);

                if (finalSubmission) {
                    $("input#next").val("Try to Submit Again").attr("disabled", false);
                    alert("Uhoh! We couldn't connect to the server to save your response data. Try submitting again?\n\nIf that doesn't work, please follow the instructions at the bottom of the page to submit by email.");
                    elicitation.set('showSerializedData', "URL: " + url + "\n" + "Email: " + email + "\n" + "Date: " + new Date().toString() + "\nData:\n" + json);
                }
            });

            this.set('pendingSubmitDataRequest', pendingSubmitDataRequest);
        },
        stateSave: function () {
            var widgetState = {};
            this.get('widgets').forEach(function (widget) {
                try {
                    widgetState[widget.get('dataKey')] = widget.stateSave();
                } catch (e) {
                    console.log("Error saving state of widget ", widget.get('dataKey'), e);
                }
                
            });
            return {
                widgets: widgetState
            };
        },
        stateResume: function (state) {
            var widgets = this.get('widgets');
            var widgetState = state.widgets;
            Ember.keys(widgetState).forEach(function (widgetID) {
                try {
                    var widget = widgets.findBy('dataKey', widgetID);
                    widget.stateResume(widgetState[widgetID]);
                    widget.redraw();
                } catch (e) {
                    console.log("Error restoring state of widget ", widgetID, e);
                }
            });
        },

        getSerializedData: function () {
            return JSON.parse(JSON.stringify(this.get('serializedData')));
        },
        getSerializedDataFor: function (widgetID) {
            var allData = this.getSerializedData();
            var keys = Ember.keys(allData);
            for (var i = 0; i < keys.length; i++) {
                var page = allData[keys[i]];
                var widget = page[widgetID];
                if (widget) {
                    return widget.data;
                }
            }
            return undefined;
        },

        // Used by EAT.Test.ping to ensure we've loaded an elicitation
        ping: function (message) {
            console.log("Elicitation.ping: ", message);
            return "ping: " + message;
        },

        /*
        debugWatchVariables: function () {
            console.log("Variables changed:");
            this.get('variables').forEach(function (variable) {
                console.log("\t", variable);
            });
        }.observes('variables'),
        */

        firstWidget: function () {
            return this.get('pagesController.firstObject.widgets.firstObject');
        }.property().volatile(), // volatile because this is mostly a debug method
        showAllPages: function () {
            return this.get('editMode') || this.get('reviewMode');
        }.property('editMode', 'reviewMode'),

        serializedDataIsEmpty: true,

        // Initialized in init()
        pageFooter: null,
        customWidgets: null,
        serializedData: null,
        setSerializedDataForPage: function (pageDataKey, dataForPage) {
            var data = this.get('serializedData');
            data[pageDataKey] = dataForPage;
            
            this.notifyPropertyChange('serializedData');
        },
        updateSerializedDataMetadata: function (elicitationComplete) {
            this.get('serializedData')['metadata'] = {
                currentPageNum: this.get('pagesController.currentPageNum'),
                elicitationIsComplete: elicitationComplete,
                resumedFromPriorSessionData: this.get('resumedFromPriorSessionData')
            };

            this.notifyPropertyChange('serializedData');
        },
        phraseDefinitions: null,
        pagesController: null
    });
})(EAT, Ember, ElicitationUtils, window);

