import Ember from 'ember'
import EAT from './eat'
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

EAT.SerializedData = SerializedData;
EAT.RootSerializedData = RootSerializedData;

export { SerializedData, RootSerializedData }