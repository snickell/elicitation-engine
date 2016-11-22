import Ember from 'ember'
import EAT from './eat'
import ElicitationUtils from './elicitation-utils'

var WidgetData = Ember.Object.extend({
    widget: undefined,
    definition: undefined,
});


WidgetData.reopenClass({
    CreateTable: function (args) {
        var properties = $.extend({
            tableModel: Ember.Object,
            rowModel: Ember.Object,
            colModel: Ember.Object,
            cellModel: Ember.Object,
            dataModel: null,
            rowDefinitionsBinding: 'dataModel.definition.rows',
            colDefinitionsBinding: 'dataModel.definition.cols'
        }, args);

        Ember.assert("Parameter dataModel must be specified", !Ember.isNone(properties.dataModel));

        var Table = properties.tableModel.extend({
            dataModel: properties.dataModel,
            colDefinitionsBinding: properties.colDefinitionsBinding,
            rowDefinitionsBinding: properties.rowDefinitionsBinding,
            cols: function () {
                var table = this;
                return Ember.A(this.get('colDefinitions')).map(function (colDefinition) {
                    return properties.colModel.create({
                        definition: colDefinition,
                        cells: null,
                        table: table
                    });
                });
            }.property('colDefinitions.@each'),
            rows: function () {
                var table = this;
                var cols = this.get('cols');

                // Reset the cols' cells, which are defined in this function
                cols.forEach(function (col) {
                    col.set('cells', Ember.A([]));
                });

                var rows = Ember.A(this.get('rowDefinitions')).map(function (rowDefinition) {
                    var row = properties.rowModel.create({
                        definition: rowDefinition,
                        table: table
                    });
                    row.set('cells',
                        cols.map(function (col) {
                            var cellModel = properties.cellModel.create({
                                row: row,
                                col: col,
                                table: table
                            });

                            // Now make sure the cols know about it too!
                            col.cells.pushObject(cellModel);

                            return cellModel;
                        })
                    );
                    return row;
                });
                return rows;
            }.property('cols.@each', 'rowDefinitions.@each')
        });

        return Table.create();
    },
    tabularPropertyOld: function (args) {
        var properties = $.extend({
            rowModel: Ember.Object,
            cellModel: Ember.Object,
            selfKeyName: 'dataModel'
        }, args);

        var definitionRowPath = properties.rowPath;
        var definitionColPath = properties.colPath;
        var selfKeyName = properties.selfKeyName;
        var rowModelClass = properties.rowModel;
        var cellModelClass = properties.cellModel;
        var tableModelClass = properties.tableModel;

        var rowPath_each = definitionRowPath + '.@each';
        var colPath_each = definitionColPath + '.@each';

        return function () {
            var rowDefinitions = this.get(definitionRowPath);
            var colDefinitions = this.get(definitionColPath);
            var self = this;

            var result = rowDefinitions.map(function (rowDefinition) {
                var row = rowModelClass.create({
                    rowDefinition: rowDefinition
                });
                return
                row.set('cells',
                    colDefinitions.map(function (colDefinition) {
                        var cellModel = cellModelClass.create({
                            row: row,
                            col: col
                        });
                        cellModel.set(selfKeyName, self);
                        return cellModel;
                    })
                );
            });
            return result;
        }.property(rowPath_each, colPath_each)
    }
});


function findLeafNodes(data, leafNodes, currentPath) {
    if (typeof (data) == "object") {
        for (var key in data) {
            if (!data.hasOwnProperty(key)) continue;
            var childPath = Ember.isNone(currentPath) ? key : currentPath + "→" + key;
            findLeafNodes(data[key], leafNodes, childPath);
        }
    } else {
        leafNodes.push(Ember.Object.create({ key: currentPath, value: data }));
    }
}

function JSONToPathArray(data) {
    data = JSON.parse(JSON.stringify(data));
    var leafNodes = [];
    findLeafNodes(data, leafNodes);
    return leafNodes;
}

var WidgetDataExplorer = Ember.View.extend({
    widget: undefined,
    widgetID: function () {
        return this.get('widget.dataKey');
    }.property('widget.dataKey'),
    data: undefined,
    errors: undefined,
    onInit: function () {
        this.set('data', Ember.A(this.get('data')));
    }.on('init'),
    actions: {
        storeData: function () {
            var widget = this.get('widget');
            var dataStoreResult = widget.get('serializedData');
            this.set('errors', dataStoreResult.get('errors'));

            var rawData = dataStoreResult.get('data');

            var leafNodes = JSONToPathArray(rawData);
            this.set('data', leafNodes);
            return;

            // For greater authenticity, lets stringify to JSON and back
            rawData = JSON.parse(JSON.stringify(rawData));

            var data = Ember.A();
            if (typeof (rawData) === "object") {
                for (var key in rawData) {
                    if (!rawData.hasOwnProperty(key)) continue;

                    data.pushObject(Ember.Object.create({
                        key: key,
                        value: JSON.stringify(rawData[key])
                    }));
                }
            } else {
                data.pushObject(Ember.Object.create({
                    key: "value",
                    value: rawData.toString()
                }));
            }
            this.set('data', data);
        },
    },
    templateName: "widget-data-explorer"
});

EAT.WidgetData = WidgetData;
EAT.WidgetDataExplorer = WidgetDataExplorer;

export { WidgetData, WidgetDataExplorer }