import Ember from 'ember'
import EAT from 'eat/eat'
import ElicitationUtils from 'eat/elicitation-utils'
import { Widget } from 'eat/widget'
import { WidgetDefinition } from 'eat/widget-definition'
import { WidgetData } from 'eat/widget-data'


EAT.TabularInputTextField = Ember.TextField.extend({
    widget: undefined,
    row: undefined,
    focusIn: function (evt) {
        var widget = this.get('widget');
        var rows = widget.get('data.rows');
        var row = this.get('row');
        if (rows.indexOf(row) >= (rows.get('length') - 1)) {
            widget.addNewRow();
        }
    }
});

Widget.register('tabular-input', {
    prettyName: "Tabular Input",
    templateName: 'tabular-input',
    dataModel: WidgetData.extend({
        rows: undefined,
        init: function () {
            this._super();
            this.set('rows', Ember.ArrayController.create({ content: [] }));
        },
        appendRow: function (columnDefinitions) {
            var rows = this.get('rows');
            var columns = columnDefinitions.map(function (col) {
                return Ember.Object.create({ text: '' });
            });

            var newRow = Ember.ArrayController.create({
                content: columns,
                columnsBinding: 'content'
            });
            rows.pushObject(newRow);
        }
    }),
    definitionSchema: {
        model: WidgetDefinition.extend({
            label: "Who else should complete this elicitation?"
        }),
        label: { accessor: WidgetDefinition.ChildNode("label"), type: "Text" },
        columns: {
            type: "HasMany",
            emphasizeWhenEmpty: true,
            prettyName: 'Column',
            accessor: WidgetDefinition.HasMany('column', {
                model: WidgetDefinition.extend({
                    label: "untitled column"
                }),
                label: { accessor: WidgetDefinition.Contents() }
            })
        }
    },
    addNewRow: function () {
        var data = this.get('data');
        data.appendRow(this.get('definition.columns'));
        window.debugWidget = this;
    },
    emptyContentWhenColumnsChange: function () {
        this.get('data.rows').clear();
        this.addNewRow();
    }.observes('definition.columns.length'),
    serializeData: function (data, errors) {
        var columnNames = this.get('definition.columns').map(function (column) {
            return ElicitationUtils.makeDataKeyFromText(column.get('label'));
        });

        this.get('data.rows').forEach(function (row, rowNum) {
            row.get('columns').forEach(function (column, colNum) {
                var value = column.get('text');
                var colName = columnNames[colNum];
                var keyName = ElicitationUtils.escapeForEmberProperty(colName + "_" + rowNum.toString());
                data.set(keyName, value);
            });
        });
    }
});
