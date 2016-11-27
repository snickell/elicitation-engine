import Ember from 'ember'
import EAT from './app'
import { WidgetRegistry, WidgetResultViewRegistry } from './widget-registry'
import definitionDOMElements from './definition-dom-elements'

EAT.reopen({
    Widgets: WidgetRegistry,
    isMobileDevice: function () {
        return window.isMobileDevice;
    }.property(),
    unsupportedBrowser: function () {
        if (BrowserDetection.msie && BrowserDetection.version < 8) {
            return true;
        } else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
            return false;
        } else {
            return false;
        }
    }.property(),
    unsupportedBrowserForEditing: function () {
        if (BrowserDetection.msie && BrowserDetection.version < 9) {
            return true;
        } else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
            return true;
        } else {
            return false;
        }
    }.property(),
    definitionDOMElements: definitionDOMElements,
    WidgetResultsViews: WidgetResultViewRegistry
});

// We need to know about any DOM elements for working around IE8 html parser issues
definitionDOMElements
    .addObject("elicitation-definition")
    .addObject("elicitation")
    .addObject("page")
    .addObject("phraseDefinitions")
    .addObject("definition");

EAT.Variable = Ember.Object.extend({
    key: undefined,
    value: undefined
});

EAT.DataDidntValidate = Ember.Object.extend({
    init: function () {
        this._super();
        this.set('errors', Ember.A(this.get('errors')));
    },
    errors: null
});

EAT.WidgetResultsView = Ember.View.extend({
    perExpertDataBinding: 'content.perExpertData',
    layoutName: 'results-chart-layout'
});

EAT.WidgetResultsData = Ember.Object.extend({
    json: undefined,
    rawJSON: undefined,
    questionTextBinding: 'json.questionText',
    perExpertDataBinding: 'json.data'
})

/* Example of an EmberJS setter:
    id: function (key, val) {
        if (arguments.length > 1) {
            this.set('_id', val);
        }
        return this.get('_id');
    }.property('_id')
*/

window.EAT = EAT;

export default EAT;