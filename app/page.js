import Ember from 'ember'
import EAT from './eat'
import ElicitationUtils from './elicitation-utils'

import StoreDataResult from './store-data-result'

var Page = Ember.Object.extend({
    pagesController: undefined, // define this in when creating
    elicitationBinding: 'pagesController.elicitation',
    widgets: null,
    authorNotes: "",
    init: function () {
        this._super();

        var widgets = Ember.A(this.get('widgets'));
        this.set('widgets', widgets);

        var page = this;

        var serializedDefinition = this.get('serializedDefinition');
        if (serializedDefinition) {
            serializedDefinition.children().each(function () {
                var widgetName = this.nodeName.toLowerCase();
                if (widgetName in EAT.Widgets) {
                    var widgetClass = EAT.Widgets[widgetName];
                    widgets.pushObject(widgetClass.create({
                        serializedDefinition: $(this),
                        elicitation: page.get('elicitation')
                    }));
                } else if (widgetName == "author-notes") {
                    page.set('authorNotes', $(this).text());
                } else {
                    console.log("Cannot de-serialize unknown widget named: " + widgetName);
                }
            });
        }
    },
    createNewWidget: function (widgetNameToAdd) {
        if (Ember.isNone(widgetNameToAdd)) return;

        var widgetClass = EAT.Widgets[widgetNameToAdd];
        var widget = widgetClass.create({
            elicitation: this.get('elicitation')
        });
        this.get('widgets').pushObject(widget);
        this.set('elicitation.widgetBeingEdited', widget);
    },
    redraw: function () {
        this.get('widgets').forEach(function (widget) {
            widget.redraw();
        });
    },
    // Work around: https://github.com/emberjs/ember.js/issues/541
    fixmeAvoidEachBugNumWidgets: function () {
        return this.get('widgets.length');
    }.property('widgets.length'),
    title: 'Click Here to Edit the Page Title',
    pageNum: function (key, value) {
        // Note: pageNum is "1-indexed"

        var pages = this.get('pagesController');
        var currentIndex = pages.indexOf(this);
        if (arguments.length === 1) {
            return currentIndex + 1;
        } else {
            var newIndex = value - 1;

            if (newIndex != currentIndex) {
                pages.removeAt(currentIndex);
                pages.insertAt(newIndex, this);
            }
            return value;
        }
    }.property('pagesController.@each'),
    firstPageAfterResume: function () {
        return this.get('pageNum') == this.get('elicitation.resumedStartingOnPageNum');
    }.property('pageNum', 'elicitation.resumedStartingOnPageNum'),
    isFirstPage: function () {
        return this.get('pageNum') == 1;
    }.property('pageNum'),
    isLastPage: function () {
        return this.get('pagesController.numPages') == this.get('pageNum');
    }.property('pageNum', 'pagesController.numPages'),
    isCurrentPage: function() {
        var currentPage = this.get("pagesController.currentPage");
        return currentPage === this;
    }.property('pagesController.currentPage'),        
    serializeDefinition: function (doc) {
        var serialized = $(doc.createElement("page"));
        serialized.attr('title', this.get('title'));

        this.get('widgets').forEach(function (widget) {
            serialized.append(widget.serializeDefinition(doc));
        });

        var authorNotes = this.get('authorNotes');
        if (!Ember.isNone(authorNotes)) {
            var notes = $(doc.createElement("author-notes"));
            notes.text(authorNotes);
            serialized.append(notes);
        }

        return serialized;
    },
    dataKeyBinding: 'title',
    serializedData: function () {
        var data = EAT.SerializedData.create();
        var validationErrors = [];

        var pageTitle = this.get('title');

        var savedSomeData = false;

        var allowEditing = this.get('elicitation.allowEditing');
        this.get('widgets').forEach(function (widget) {
            var result = widget.get('serializedData');
            if (result) {
                savedSomeData = true;
                jQuery.extend(validationErrors, result.get('errors'));
                var dataKey = widget.get('dataKey');
                if (allowEditing && !dataKey) {
                    alert("WARNING: widget without a valid dataKey, probably no title defined," +
                        "data may be lost");
                }
                data[dataKey] = {
                    data: result.get('data'),
                    dataKeyText: widget.get('dataKeyText')
                };
            }
        });

        data['metadata'] = {
            secondsExpertOnPage: this.get('secondsExpertOnPage')
        };

        // Not really valid if we're always setting metadata...
        // if (!savedSomeData) return null;

        return EAT.StoreDataResult.create({
            data: data,
            errors: validationErrors
        });
    }.property().volatile(),
    expertOnPage: false, // set by the pagesController
    beforeEnteringPage: function () {
        var page = this;
        this.get('widgets').forEach(function (widget) {
                widget.beforeEnteringPage(page);    
        });
    },
    beforeExitingPage: function () {
        var page = this;
        this.get('widgets').forEach(function (widget) {
            widget.beforeExitingPage(page);    
        });
    },
    _msExpertOnPage: 0.0,
    timeExpertEnteredPage: null,
    accumulateTimeOnPage: function () {
        var timeExpertEnteredPage = this.get('timeExpertEnteredPage');
        if (!Ember.isNone(timeExpertEnteredPage)) {
            var now = Date.now();
            var msToAccumulate = now - timeExpertEnteredPage;
            this.set('_msExpertOnPage', this.get('_msExpertOnPage') + msToAccumulate);
            this.set('timeExpertEnteredPage', now);
        }
    },
    startOrStopTiming: function () {
        var expertOnPage = this.get('expertOnPage');
        if (expertOnPage) {
            // Start timing
            this.set('timeExpertEnteredPage', Date.now());
            // console.log("Started timer on: ", this.get('title'));
        } else {
            // Stop timing
            this.accumulateTimeOnPage();
            this.set('timeExpertEnteredPage', null);
            // console.log("Stopped timer on: ", this.get('title'), " at ", this.get('secondsExpertOnPage'));
        }
    }.observes('expertOnPage'),
    secondsExpertOnPage: function () {
        this.accumulateTimeOnPage();
        return this.get('_msExpertOnPage') / 1000;
    }.property('_msExpertOnPage').volatile()
});


var AddWidgetToPage = Ember.View.extend({
    page: undefined, // should be set when creating
    elicitationBinding: 'page.elicitation',
    classNames: ['add-widget-to-page'],
    change: function (event) {
        // This fires when the select/dropdown changes, we detect which action
        // to perform, and set the select back to the "Add widget:" prompt

        var page = this.get('page');
        var elicitation = this.get('elicitation');

        var selectElement = this.$("select");
        var selected = selectElement.val();
        if (selected === "prompt-no-action-required") {
            return; // important to return here so we don't get an infinite loop
        } else if (selected === "show-gallery") {
            elicitation.set('widgetGalleryIsOpen', true);
            elicitation.set('widgetGalleryAddsToPage', page);
        } else {
            var widgetName = selected;
            page.createNewWidget(widgetName);
        }
        selectElement.val("prompt-no-action-required");
    },
    widgetNames: function () {
        var widgetNames = Ember.A();
        for (var widgetName in EAT.Widgets) {
            widgetNames.pushObject(Ember.Object.create({
                widgetName: widgetName,
                prettyName: EAT.Widgets[widgetName].prettyName
            }));
        }
        widgetNames = widgetNames.sort(function (a, b) {
            return a.get('prettyName') <= b.get('prettyName') ? -1 : 1;
        });
        return widgetNames;
    }.property()
});

var PageView = Ember.View.extend({
    /* isVisible begins false, with no templates rendered, but once a page is made visible,
       we set templateName and rerender. This way, pages are not rendered until they are needed
       but once rendered, they are never re-rendered (which would lose HTML state!)
       */
    isVisible: false,
    templateName: null, // templateName only gets set once the element is visible
    setTemplateOnceVisible: function () {
        if (this.get('isVisible') && Ember.isNone(this.get('templateName'))) {
            this.set('templateName', 'page');
            this.rerender();
        }
    }.observes('isVisible'),
    pageBinding: 'content',
    pagesControllerBinding: 'content.pagesController',
    classNames: ['page-view'],
    nextButtonDisabled: false,
    pageDOM: function () {
        return this.$().closest('.page');
    }.property(),
    nextButtonLabel: function () {
        var page = this.get('page');
        if (Ember.isNone(page)) return "Next";

        if (page.get('isLastPage')) {
            return "Submit Elicitation";
        } else {
            return "Next »";
        }
    }.property("page.pageNum"),
    actions: {
        gotoNextPage: function (event) {
            this.get('pagesController').gotoNextPage();
        },
        gotoPrevPage: function (event) {
            this.get('pagesController').gotoPrevPage();
        },
        restartElicitationWithoutPriorData: function (e) {
            function insertParam(key, value) {
                key = encodeURI(key); value = encodeURI(value);

                var kvp = document.location.search.substr(1).split('&');

                var i = kvp.length; var x; while (i--) {
                    x = kvp[i].split('=');

                    if (x[0] == key) {
                        x[1] = value;
                        kvp[i] = x.join('=');
                        break;
                    }
                }

                if (i < 0) { kvp[kvp.length] = [key, value].join('='); }

                //this will reload the page, it's likely better to store this until finished
                document.location.search = kvp.join('&');
            }

            if (confirm("Are you sure you want to start over from scratch?\n\nPLEASE NOTE: clicking ok will ABANDON ANY PREVIOUS RESPONSES and you'll have to reenter them.")) {
                insertParam("resumePriorSessionData", "false");
            }
        },
        removePage: function () {
            if (!confirm("Delete the entire page? This will delete all the widgets on the page too.")) return;
            this.get('pagesController').removeObject(this.get('page'));
        },
        movePageUp: function () {
            var pages = this.get('pagesController');
            var page = this.get('page');
            var index = pages.indexOf(page);
            var firstPage = index == 0;
            if (!firstPage) {
                pages.removeAt(index);
                pages.insertAt(index - 1, page);
            }
        },
        movePageDown: function () {
            var pages = this.get('pagesController');
            var page = this.get('page');
            var index = pages.indexOf(page);
            var lastPage = index == (pages.get('length') - 1);
            if (!lastPage) {
                pages.removeAt(index);
                pages.insertAt(index + 1, page);
            }
        },
        insertNewPageAfter: function () {
            var pages = this.get('pagesController');
            var page = this.get('page');
            var index = pages.indexOf(page);
            pages.addNewPage(index + 1);
        },
    },
    addWidgetToPageView: AddWidgetToPage
});

EAT.Page = Page;
EAT.PageView = PageView;

export { Page, PageView };
export default Page;
