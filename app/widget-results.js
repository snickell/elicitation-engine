import Ember from 'ember';

var WidgetResultsView = Ember.View.extend({
    perExpertDataBinding: 'content.perExpertData',
    layoutName: 'results-chart-layout'
});

var WidgetResultsData = Ember.Object.extend({
    json: undefined,
    rawJSON: undefined,
    questionTextBinding: 'json.questionText',
    perExpertDataBinding: 'json.data'
});

var WidgetResultsViewRegistry = Ember.Object.create();

export { WidgetResultsViewRegistry, WidgetResultsView, WidgetResultsData };