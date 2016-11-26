import Ember from 'ember'
import ElicitationUtils from './elicitation-utils'


// This is helper code for supporting Acceptance Tests, run in a different process using WebDriver/Selenium2

var TestClass = Ember.Object.extend({
    _emberIsDone: true,
    notifyWhenEmberIsDone: function () {
        var self = this;
        this.set('_emberIsDone', false);
        // console.log("_emberIsDone = false");
        Ember.run.later(this, function () {
            // FIXME: this is relying on a certain SPEED of ember, we want
            // to ensure that everything has been synced and redrawn (a couple times?)
            // before we feel safe

            // console.log("_emberIsDone = true");
            this.set('_emberIsDone', true);
        }, 100);
        return this;
    },
    isEmberDone: function () {
        //console.log("isEmberDone? ", this.get('_emberIsDone'));
        return this.get('_emberIsDone');
    },
    elicitation: function () {
        return debug.elicitation;
    }.property(),
    $: function (arg) {
        return $(arg);
    },
    ping: function (arg) {
        console.log("Test.ping: ", arg);
        return this.get('elicitation').ping(arg);
    },

    gotoPageNamed: function (pageName) {
        console.log("Test.gotoPageNamed: ", pageName);
        var pages = this.get('elicitation.pagesController');
        var page = pages.findProperty('title', pageName);

        if (!Ember.isNone(page)) {
            pages.gotoPage(page);
            return true;
        } else {
            return false;
        }
    },

    getWidgetID: function (indexOnPage) {
        console.log("Test.getWidgetID: ", indexOnPage);
        try {
            return this.get('elicitation.pagesController.currentPage.widgets').get(indexOnPage).get('dataKey');
        } catch (e) {
            console.log("Exception in Test.getWidgetID: ", e);
            return null;
        }
    },

    clearElicitationData: function () {
        console.log("Test.clearElicitationData: FIXME NOT IMPLEMENTED");
    },
    gotoNextPage: function () {
        console.log("Test.gotoNextPage");
        this.get("elicitation.pagesController").gotoNextPage();
        console.log("Going to next page!");
        return true;
    },
    gotoPrevPage: function () {
        console.log("Test.gotoPrevPage");
        this.get("elicitation.pagesController").gotoPrevPage();
        console.log("Going to previous page!");
        return true;
    },
    getWidgetData: function (widgetID) {
        var data = this.get('elicitation.serializedData').getDataForWidgetID(widgetID);
        return JSON.stringify(data);
    }

});

var Test = TestClass.create();

import EAT from './eat'
EAT.Test = Test;

export default Test;