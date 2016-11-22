import Ember from 'ember'
import EAT from 'eat/eat'
import ElicitationUtils from 'eat/elicitation-utils'

console.error("WEBPACKCONVERT: setting EAT.TabularInputTextField from within widget");
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

EAT.Widget.register('tabular-input', {
    prettyName: "Tabular Input",
    templateName: 'tabular-input',
    dataModel: EAT.WidgetData.extend({
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
        model: EAT.WidgetDefinition.extend({
            label: "Who else should complete this elicitation?"
        }),
        label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
        columns: {
            type: "HasMany",
            emphasizeWhenEmpty: true,
            prettyName: 'Column',
            accessor: EAT.WidgetDefinition.HasMany('column', {
                model: EAT.WidgetDefinition.extend({
                    label: "untitled column"
                }),
                label: { accessor: EAT.WidgetDefinition.Contents() }
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
            return EAT.makeDataKeyFromText(column.get('label'));
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
