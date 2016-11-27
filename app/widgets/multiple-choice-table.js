import Ember from 'ember';

import ElicitationUtils from 'eat/elicitation-utils';

import { Widget } from 'eat/widget';
import { WidgetDefinition } from 'eat/widget-definition';
import { WidgetData } from 'eat/widget-data';
import {RadioButtonGroup} from 'eat/ember-radio-button';

var globalMultipleChoiceTableNum = 0;

var RowModel = Ember.Object.extend({
    cells: null,
    labelBinding: 'definition.label',
    multipleChoiceNum: undefined,
    multipleChoiceName: function () {
        return "multiple-choice-table-" + this.get('multipleChoiceNum');
    }.property('multipleChoiceNum'),
    init: function () {
        this.set('multipleChoiceNum', globalMultipleChoiceTableNum++);
    },
    radioChoice: undefined
});

var CellModel = Ember.Object.extend({
    checkBoxBinding: "col.definition.checkBox",
    textEntryBinding: "col.definition.textEntry",
    radioButtonBinding: "col.definition.radioButton",
    choiceBinding: "col.definition.label",
    dropDownBinding: "col.definition.dropDown",
    col: null,
    row: null,
    value: false
});

var TableModel = Ember.Object.extend({
    reorderedRows: function () {
        var rows = this.get('rows');
        if (this.get('dataModel.definition.randomizeRowOrder')) {
            return ElicitationUtils.shuffleArray(Ember.A(rows.slice()));
        } else {
            return rows;
        }
    }.property('rows.@each', 'dataModel.definition.randomizeRowOrder')
});

var DataModel = WidgetData.extend({
    init: function () {
        this._super();
        this.set('table', WidgetData.CreateTable({
            dataModel: this,
            rowDefinitionsBinding: 'dataModel.definition.rows',
            colDefinitionsBinding: 'dataModel.definition.choices',
            rowModel: RowModel,
            cellModel: CellModel,
            tableModel: TableModel
        }));
    }
});

var RowView = RadioButtonGroup.extend(/*EAT.RateLimitedViewMixin, */{
    templateName: 'multiple-choice-table-row',
    tagName: 'tr',
    row: undefined,
    attributeBindings: ['valign'],
    valign: "top",

    // These are for RadioButtonGroup, which we inherit from instead of embedding
    // because you can't have an extra "div" element between tbody, tr, and td
    nameBinding: "row.multipleChoiceName",
    valueBinding: "row.radioChoice"
});

function makeCustomDropdownChoicesSchema(choiceNum) {
    return {
        type: "HasMany",
        prettyName: 'Custom Dropdown #' + choiceNum + ' Choice',
        accessor: WidgetDefinition.HasMany('custom-dropdown-choice-' + choiceNum, {
            model: WidgetDefinition.extend({
                label: 'dropdown choice'
            }),
            label: { accessor: WidgetDefinition.Attr("label"), type: "String" },
        }),
        category: "Custom Dropdowns"
    };
}

Widget.register('multiple-choice-table', {
    RowView: RowView,
    prettyName: "Multiple Choice Table",
    value: null,
    templateName: 'multiple-choice-table',
    dataModel: DataModel,
    RadioButton: Ember.Checkbox.extend({
        type: 'radio'
    }),
    definitionSchema: {
        model: WidgetDefinition.extend({
            label: "Select your choices for these questions"
        }),
        label: { accessor: WidgetDefinition.ChildNode("label"), type: "Text" },
        choices: {
            type: "HasMany",
            prettyName: 'Choice',
            emphasizeWhenEmpty: true,
            accessor: WidgetDefinition.HasMany('choice', {
                model: WidgetDefinition.extend({
                    label: "One Choice",
                    htmlID: function () {
                        return this.get('dataKey');
                    }.property('dataKey'),
                    checkBox: function (key, val) {
                        if (arguments.length > 1 && val == true) {
                            // Load the deprecated checkBox property for compat
                            this.set('choiceType', 'checkbox');
                        }
                        return this.get('choiceType') === "checkbox";
                    }.property('choiceType'),
                    radioButton: function (key, val) {
                        return this.get('choiceType') === "radio";
                    }.property('choiceType'),
                    textEntry: function (key, val) {
                        return this.get('choiceType') === "text";
                    }.property('choiceType'),
                    dropDown: function (key, val) {
                        return this.get('choiceType').slice(0, -1) == 'custom-dropdown-';
                    }.property('choiceType'),
                    hihi: function () {
                        console.log("hihi!", this.get('choiceType'));
                    }.property().volatile(),
                    dropDownChoices: function (key, val) {
                        var choiceNum = this.get('choiceType').slice(-1);
                        return this.get('parent').get('customDropDownChoices' + choiceNum).mapProperty('label').insertAt(0, '');
                    }.property('choiceType',
                        'parent.customDropDownChoices1.@each.label', 'parent.customDropDownChoices2.@each.label',
                        'parent.customDropDownChoices3.@each.label', 'parent.customDropDownChoices4.@each.label'
                        /* if adding more customDropDownChoices than 4, add it here */
                    ),
                    choiceType: "radio"
                }),
                label: { accessor: WidgetDefinition.ChildNode('label') },
                checkBox: {
                    prettyName: 'Check Box',
                    type: "Boolean",
                    accessor: WidgetDefinition.Attr('check-box'),
                    visible: false,
                    dontSerialize: true
                },
                choiceType: {
                    prettyName: "Type of choice",
                    type: "Enum",
                    values: [
                        { value: "radio", label: "Radio" },
                        { value: "checkbox", label: "Check Box" },
                        { value: "text", label: "Text Entry" },
                        { value: "custom-dropdown-1", label: "Custom Dropdown #1" },
                        { value: "custom-dropdown-2", label: "Custom Dropdown #2" },
                        { value: "custom-dropdown-3", label: "Custom Dropdown #4" },
                        { value: "custom-dropdown-4", label: "Custom Dropdown #4" },
                    ],
                    accessor: WidgetDefinition.Attr('choice-type')
                }
            })
        },
        rows: {
            type: "HasMany",
            prettyName: 'Row',
            emphasizeWhenEmpty: true,
            accessor: WidgetDefinition.HasMany('row', {
                model: WidgetDefinition.extend({
                    label: 'untitled row'
                }),
                label: { accessor: WidgetDefinition.ChildNode('label') }
            })
        },
        randomizeRowOrder: {
            type: "Boolean",
            prettyName: 'Randomize Row Order',
            accessor: WidgetDefinition.Attr('randomize-row-order'),
            helpText: 'Randomize the order of rows for each person viewing the elicitation'
        },
        customDropDownChoices1: makeCustomDropdownChoicesSchema('1'),
        customDropDownChoices2: makeCustomDropdownChoicesSchema('2'),
        customDropDownChoices3: makeCustomDropdownChoicesSchema('3'),
        customDropDownChoices4: makeCustomDropdownChoicesSchema('4')
    },
    showTableFooter: function () {
        return this.get('definition.rows.length') >= 8;
    }.property('definition.rows.length'),
    serializeData: function (data, errors) {
        data.set('rows', this.get('data.table.rows').map(function (row) {
            var radioChoice = row.get('radioChoice');
            var rowData = WidgetData.create({
                choice: radioChoice,
                dataKeyText: row.get('label')
            });

            var cells = row.get('cells');

            var serializeCellByChoiceAndValue = function (cell) {
                var cellName = ElicitationUtils.escapeForEmberProperty(cell.get('choice'));
                var cellValue = cell.get('value');
                rowData.set(cellName, cellValue);
            }

            cells.filterBy('checkBox').forEach(serializeCellByChoiceAndValue);
            cells.filterBy('dropDown').forEach(serializeCellByChoiceAndValue);

            cells.filterProperty('textEntry').forEach(function (textEntry) {
                var textEntryName = ElicitationUtils.escapeForEmberProperty(textEntry.get('choice'));
                var textEntryValue = textEntry.get('value');
                if (textEntryValue == false) {
                    textEntryValue = "";
                }
                rowData.set(textEntryName, textEntryValue);
            });

            if (Ember.isNone(radioChoice) && cells.filterProperty('radioButton').length > 0) {
                errors.pushObject("You didn't select a choice for row '" + row.get('definition.label') + "'");
            }

            return rowData;
        }));
    }
});
