(function (EAT, window, undefined) {
    "use strict";

    EAT.EditableWidgetView = Ember.View.extend({
        content: null,
        elicitationBinding: 'controller.elicitation',
        widgetBinding: 'content',
        classNameBindings: [':editable-widget', ':could-be-edited', 'beingEdited'],
        templateName: 'editable-widget',
        pageBinding: 'parentView.page',
        actions: {
            editWidget: function () {
                this.set('elicitation.widgetBeingEdited', this.get('widget'));
            },
            moveWidgetUp: function () {
                var page = this.get('page');
                var widgets = page.get('widgets');
                var widget = this.get('widget');
                var index = widgets.indexOf(widget);
                var firstWidget = index == 0;

                if (firstWidget) {
                    var prevPage = this.get('elicitation.pagesController').thePageBefore(page);
                    if (prevPage) {
                        widgets.removeObject(widget);
                        prevPage.get('widgets').pushObject(widget);
                    }
                } else {
                    widgets.removeAt(index);
                    widgets.insertAt(index - 1, widget);
                }
                widget.scrollTo();
            },
            moveWidgetDown: function () {
                var page = this.get('page');
                var widgets = page.get('widgets');
                var widget = this.get('widget');
                var index = widgets.indexOf(widget);
                var lastWidget = index == widgets.length - 1;

                if (lastWidget) {
                    var nextPage = this.get('elicitation.pagesController').thePageAfter(page);
                    if (!Ember.isNone(nextPage)) {
                        widgets.removeObject(widget);
                        nextPage.get('widgets').unshiftObject(widget);
                    }
                } else {
                    widgets.removeAt(index);
                    widgets.insertAt(index + 1, widget);
                }
                widget.scrollTo();
            },
            removeWidget: function () {
                if (!confirm("Delete widget?")) return;

                var page = this.get('page');
                var widgets = page.get('widgets');
                var widget = this.get('widget');
                widgets.removeObject(widget);

                if (this.get('elicitation.widgetBeingEdited') === widget) {
                    console.log("Unsetting the widgetBeingEdited as it is being deleted");
                    this.set('elicitation.widgetBeingEdited', null);
                }
            },
        },
        beingEdited: function () {
            return this.get('elicitation.widgetBeingEdited') === this.get('widget');
        }.property('elicitation.widgetBeingEdited'),
        scrollToMeIfImBeingEdited: function () {
            if (this.get('beingEdited')) {
                this.get('widget').scrollTo();
            }
        }.observes('beingEdited')
    });

    EAT.WidgetViewWrapper = Ember.ContainerView.extend({
        currentView: null,
        contentBinding: 'currentView',
        classNames: ['widget-view-wrapper'],
        // THIS IS A BAD HACK TO KEEP FROM DESTROYING THE WIDGET WHEN
        // WE DO A MOVE (remove, followed by add)
        // REALLY.... widgets should be built from models, and not be
        // a view in and of themselves, which would remove the need
        // to prevent the widgetView from being destroyed in the first place
        willDestroyElement: function () {
            var widget = this.get('currentView');
            this.removeObject(widget);
            this._super();
        }
    });

    EAT.PageFooterView = Ember.View.extend({
        templateName: 'page-footer',
        classNames: ['page-footer']
    });

    EAT.CustomWidgetsView = Ember.View.extend({
        templateName: 'custom-widgets',
        classNames: ['custom-widgets'],
        actions: {
            injectCSSAndJavascript: function () {
                console.log("Applying custom css and javascript");
                this.get('content').injectCSSAndJavascript();
            }
        }
    });

    EAT.EditSidebarView = Ember.View.extend({
        elicitation: Ember.computed.alias('controller.elicitation'),
        templateName: 'edit-sidebar',
        classNames: ['edit-sidebar', 'slim-scrollbars'],
        onInit: function () {
            this.set('elicitation.hasBeenEdited', true);
        }.on('init'),
        actions: {
            closeWidgetEditor: function () {
                this.set('elicitation.widgetBeingEdited', null);
            },
        },
        scrollToTopWhenWidgetChanges: function () {
            this.$().scrollTop(0);
        }.observes('elicitation.widgetBeingEdited'),
        connectWidgetBeingEditedOutlet: function () {
            var widgetBeingEdited = this.get('elicitation.widgetBeingEdited');

            console.log("EAT.EditSidebarView, widgetBeingEdited is now: ", widgetBeingEdited);
            debug.widgetBeingEdited = widgetBeingEdited;

            if (!Ember.isNone(widgetBeingEdited)) {
                this.disconnectOutlet('widgetBeingEdited'); // Added this line to avoid deprecation warning: DEPRECATION: Using the defaultContainer is no longer supported. [defaultContainer#lookup] see: http://git.io/EKPpnA

                // We do this in the Ember.run.next() to workaround a mysterious bug where editing a widget, then editing another widget, then switching back
                // to edit widget one would result in the editor pane "sticking" to widget 2.
                // see: https://app.asana.com/0/117084615272/7853252127811
                var self = this;
                Ember.run.next(function () {
                    self.connectOutlet('widgetBeingEdited', widgetBeingEdited.get('definitionEditorView'));
                });
                
            } else {
                this.disconnectOutlet('widgetBeingEdited');
            }
        }.observes('elicitation.widgetBeingEdited')
    });

    EAT.EditControlsView = Ember.View.extend({
        elicitationBinding: 'controller.elicitation', // bind at creation,
        classNames: ["edit-controls"],
        templateName: 'edit-controls',
        actions: {
            addNewPage: function () {
                this.get('elicitation.pagesController').addNewPage();
            },
            saveChanges: function () {
                this.get('elicitation').saveChanges();
            },
            returnToDiscussion: function () {
                if (confirm("Return to discussion? Make sure you've saved!")) {
                    window.location.href = this.get('elicitation.discussionURL');
                }
            },
            toggleEditMode: function (event) {
                this.toggleProperty('elicitation.editMode');
            },
        },
        editedSinceSavingBinding: 'elicitation.hasBeenEdited',
        toggleEditModeLabel: function () {
            if (this.get('elicitation.editMode')) {
                return "Preview";
            } else if (this.get('editedSinceSaving')) {
                return "Done...";
            } else {
                return "Edit";
            }
        }.property('elicitation.editMode', 'editedSinceSaving')
    });


    EAT.PostSubmitView = Ember.View.extend({
        templateName: "post-submit",
        classNames: ['post-submit'],
        actions: {
            gotoDiscussion: function () {
                window.location.href = this.get('elicitation.discussionURL');
            }
        }
    });

    EAT.CloseEmbeddedView = Ember.View.extend({
        actions: {
            closeEmbeddedViewConfirm: function () {
                if (confirm("Close this elicitation before submitting?\n\nYour responses will NOT be saved.")) {
                    parent.hideElicitationPopup();
                }
            },
            closeEmbeddedViewPostSubmit: function () {
                parent.hideElicitationPopupPostSubmit();
            }
        }
    });

})(EAT, window);