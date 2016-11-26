import Ember from 'ember'
import ElicitationUtils from './elicitation-utils'

import { Page, PageView } from './page'

var PagesView = ElicitationUtils.CurrentCollectionView.extend({
    elicitationBinding: 'controller.elicitation',
    classNames: ['pages'],
    itemViewClass: PageView,
    contentBinding: 'elicitation.pagesController',
    currentContentBinding: 'elicitation.pagesController.currentPage',
    showAllContentBinding: 'elicitation.showAllPages'
});

var PagesController = Ember.ArrayController.extend({
    elicitation: undefined, // this needs to be set when initializing
    content: [],
    pageHistory: undefined,
    init: function () {
        this._super();
        this.set('pageHistory', Ember.A());
    },
    numPages: function () {
        return this.get('content').length;
    }.property('@each'),
    currentPage: null,
    currentPageNum: function (key, value) {
        if (arguments.length > 1) {
            var newPageNum = value - 1;
            var newPage = this.get('content')[newPageNum];
            if (!Ember.isNone(newPage)) {
                this.set('currentPage', newPage);
            }
        }

        var currentPage = this.get('currentPage');
        return this.indexOf(currentPage) + 1;
    }.property('currentPage'),
    redrawWidgetsOnShowAllPagesChange: function () {
        if (this.get('elicitation.showAllPages')) {
            var self = this;
            // FIXME: we use setTimeout to make sure the DOM has re-rendered
            // this should really be pushed into the PageView, but I can't figure
            // out what event hook to use??? there's no "afterRender" hook
            window.setTimeout(function () {
                self.forEach(function (page) {
                    page.redraw();
                });
            }, 50);
        } else {
            this.redrawWidgetsOnPageChange();
        }
    }.observes('elicitation.showAllPages'),
    informPageExpertIsLeaving: function () {
        var leavingPage = this.get('currentPage');
        if (!Ember.isNone(leavingPage)) {
            leavingPage.set('expertOnPage', false);
        }
    }.observesBefore('currentPage'),
    informPageExpertIsEntering: function () {
        var page = this.get('currentPage');
        if (!Ember.isNone(page)) {
            if (this.get('elicitation.editMode')) {
                page.set('expertOnPage', false);
            } else {
                page.set('expertOnPage', true);
            }
        }
    }.observes('currentPage', 'elicitation.editMode'),
    redrawWidgetsOnPageChange: function () {
        var page = this.get('currentPage');
        // FIXME: we use setTimeout to make sure the DOM has re-rendered
        // this should really be pushed into the PageView, but I can't figure
        // out what event hook to use??? there's no "afterRender" hook
        
        var self = this;
        window.setTimeout(function () {
            if (!self.get('elicitation.showAllPages')) {
                $(window).scrollTop(0);
            }
            page.redraw();
        }, 50);
    }.observes('currentPage'),
    thePageBefore: function (page) {
        var content = this.get('content');
        var pageBeforeIndex = content.indexOf(page) - 1;
        if (pageBeforeIndex < 0) return null;
        return content[pageBeforeIndex];
    },
    thePageAfter: function (page) {
        var content = this.get('content');
        var pageAfterIndex = content.indexOf(page) + 1;
        if (pageAfterIndex >= content.length) return null;
        return content[pageAfterIndex];
    },
    gotoPage: function (page) {
        console.log("gotoPage(), pageNum: ", page.get('pageNum'));
        this.set('currentPage', page);
        this.runBeforeEnteringOnCurrentPage();
    },
    gotoNextPage: function () {
        var elicitation = this.get('elicitation');
        var currentPage = this.get('currentPage');
        if (Ember.isNone(currentPage)) return;

        var result = currentPage.get('serializedData');
        if (result) {
            var errors = result.get('errors');
            if (errors.length > 0) {
                if (!confirm("This page isn't fully filled out, continue anyway?\n"
                    + errors.join("\n"))) return;
            }
            elicitation.set('serializedDataIsEmpty', false);
            var dataKey = currentPage.get('dataKey');
            if (!dataKey && elicitation.get('allowEditing')) {
                alert("WARNING: page without a valid dataKey, probably no title defined");
            }

            elicitation.setSerializedDataForPage(dataKey, result.get('data'));
        }

        var isLastPage = currentPage.get('isLastPage');

        // We always try to submit data, even if flipping pages throws an exception
        try {
            if (currentPage.get('isLastPage')) {
                currentPage.set('nextButtonDisabled', true);
            } else {
                currentPage.beforeExitingPage();
                this.get('pageHistory').push(currentPage);

                var scriptChangedPages = currentPage !== this.get('currentPage');

                // Advance to next page (unless the beforeexitingpage script already did)
                if (!scriptChangedPages) {
                    this.gotoPage(this.thePageAfter(currentPage));
                }

                //this.runBeforeEnteringOnCurrentPage();
            }
        } finally {
            // update current page number & variables
            elicitation.updateSerializedDataMetadata(isLastPage);
            elicitation.submitData(isLastPage);
        }
    },
    runBeforeEnteringOnCurrentPage: function () {
        this.get('currentPage').beforeEnteringPage();
        
                /* OUTDATED: now gotoPage() calls before entering script, so customScripting.api.gotoPage() will recursively
        executed before entering scripts too.... rendering do loop unnecessary.

        var currentPage;
        do {
            currentPage = this.get('currentPage');
            currentPage.beforeEnteringPage();
        } while (currentPage != this.get('currentPage')) // keep going until the page stops changing
        */
    },
    gotoPrevPage: function () {
        var prevPage = this.get('pageHistory').pop();

        if (Ember.isNone(prevPage)) {
            console.warn("pages.gotoPrevPage(): page history stack is empty, going to previous page by number instead");
            var currentPage = this.get('currentPage');
            if (Ember.isNone(currentPage)) return;
            prevPage = this.thePageBefore(currentPage);
        }

        this.gotoPage(prevPage);
    },
    ensureCurrentPageIsValid: function () {
        if (!this.get('content').contains(this.get('currentPage'))) {
            this.set('currentPage', this.get('content').get('firstObject'));
        }
    }.observes('content', 'currentPage'),
    allWidgets: function () {
        var widgets = [];
        this.forEach(function (page) {
            page.get('widgets').forEach(function (widget) {
                widgets.push(widget);
            });
        });
        return widgets;
    }.property('@each.fixmeAvoidEachBugNumWidgets'),
    loadPagesFromXML: function (pagesXML) {
        var self = this;

        pagesXML.each(function () {
            self.pushObject(
                Page.create({
                    serializedDefinition: $(this),
                    title: $(this).attr("title"),
                    pagesController: self
                })
            );
        });

        // If we're not already somewhere, start on the first page
        if (Ember.isNone(this.get('currentPage'))) {
            this.set('currentPage', this.get('firstObject'));
        }
    },
    addNewPage: function (index) {
        var newPage = Page.create({
            pagesController: this
        });
        if (Ember.isNone(index)) {
            this.addObject(newPage);
        } else {
            this.insertAt(index, newPage);
        }
    },
    pageRangeForSelect: function () {
        var pageRange = [];
        var numPages = this.get('numPages');
        for (var i = 1; i <= numPages; i++) {
            pageRange.push(i);
        }
        return pageRange;
    }.property('numPages'),
    renameDuplicatePageTitles: function () {
        var pageKeys = Ember.Set.create();
        pageKeys.add('metadata'); // reserved word
        var cancelSave = false;
        this.forEach(function (page) {
            var pageKey = page.get('dataKey');
            if (pageKeys.contains(pageKey)) {
                var oldTitle = page.get('title');
                var newTitle = oldTitle + " " + Math.floor(Math.random() * 1e6).toString();
                page.set('title', newTitle);
            }
            pageKeys.add(page.get('dataKey'));
        });
    }
});

export { PagesView, PagesController };