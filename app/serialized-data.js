import Ember from 'ember'
import ElicitationUtils from './elicitation-utils'

var SerializedData = Ember.Object.extend();
var RootSerializedData = SerializedData.extend({
    getDataForWidget: function (widget) {
        var key = widget.get('dataKey');
        return this.getDataForWidgetID(key);
    },
    getDataForWidgetID: function (key) {
        for (var pageKey in this) {
            if (this.hasOwnProperty(pageKey)) {
                var page = this[pageKey];
                if (Ember.isNone(page)) continue;
                var data = page[key];
                if (!Ember.isNone(data)) return data.data;
            }
        }
    }
});

export { SerializedData, RootSerializedData }