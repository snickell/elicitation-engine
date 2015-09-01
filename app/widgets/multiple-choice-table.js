(function (EAT, Ember) {
    // We should remove this cruft code from:
    // https://github.com/emberjs/ember.js/pull/1235
    // Once its merged into ember master
    Ember.assert("Ember.RadioButton is not natively defined",
        Ember.isNone(Ember.RadioButton) && Ember.isNone(Ember.RadioButtonGroup));

    var get = Ember.get, getPath = Ember.getPath, set = Ember.set, fmt = Ember.String.fmt;

    Ember.Control = Ember.View.extend({

        init: function () {
            this._super();

            // SETH: disabled because it didn't work anyway
            // set(this, '_context', this);
        }

    });

    /**
      @class
    
      The `Ember.RadioButton` view class renders an html radio input, allowing the
      user to select a single value from a list of values.
    
      Dealing with multiple radio buttons can be simplified by using an
      `Ember.RadioButtonGroup`. See the {@link Ember.RadioButtonGroup} documentation
      for more information.
    
      @extends Ember.View
    */
    Ember.RadioButton = Ember.Control.extend(
    /** @scope Ember.RadioButton.prototype */ {

        attributeBindings: ["disabled", "type", "name", "value", "checked"],
        classNames: ["ember-radio-button"],

        /**
          The value of this radio button.
      
          @type Object
        */
        value: null,

        /**
          The selected value in this group of radio buttons.
      
          @type Object
        */
        selectedValue: null,

        /**
          Sets the disabled property on the element.
      
          @default false
          @type Boolean
        */
        isDisabled: false,

        /**
          Sets the checked property on the element.
      
          @default false
          @type Boolean
        */
        checked: false,

        tagName: "input",
        type: "radio",

        selectedValueChanged: Ember.observer(function() {
            var selectedValue = get(this, "selectedValue");
            if(!Ember.isEmpty(selectedValue) && get(this, "value") === selectedValue) {
                set(this, "checked", true);
            } else {
                set(this, "checked", false);
            }
        }, 'selectedValue'),

        checkedChanged: Ember.observer(function() {
            this._updateElementValue();
        }, 'checked'),

        init: function() {
            this._super();
            this.selectedValueChanged();
        },

        change: function() {
            set(this, 'checked', this.$().prop('checked'));
            Ember.run.once(this, this._updateElementValue);
        },

        _updateElementValue: function() {
            if(!get(this, 'checked')) return;
            set(this, 'selectedValue', get(this, 'value'));
        }

    });

    /**
      @class
    
      The `Ember.RadioButtonGroup` view class provides a simplfied method for dealing
      with multiple `Ember.RadioButton` instances.
    
      ## Simple Example
    
      ```handlebars
      {{#view Ember.RadioButtonGroup name="role" valueBinding="content.role"}}
        {{view RadioButton value="admin"}}
        {{view RadioButton value="owner"}}
        {{view RadioButton value="user"}}
      {{/view}}
      ```
    
      Note that the radio buttons are declared as `{{view RadioButton ...}}` as opposed
      to `{{view Ember.RadioButton ...}}`. When inside the body of a RadioButtonGroup,
      a `RadioButton` view is provided which automatically picks up the same name and value
      binding as the containing group.
    
      ## More Complex Example
    
      ```javascript
      App.person = Ember.Object.create({name: 'Gordon', role: 'admin'})
      App.PersonController = Ember.Controller.extend({
        contentBinding: 'App.person',
        roleOptions: ['admin', 'owner', 'user', 'banned']
      });
      ```
    
      ```handlebars
      {{#view Ember.RadioButtonGroup name="role" valueBinding="content.role"}}
        {{#each role in controller.roleOptions}}
          <label>
            {{view RadioButton valueBinding="role"}}
            {{role}}
          </label>
        {{/each}}
      {{/view}}
      ```
    
      The above controller/template combination will render html containing a
      radio input for each item in the `roleOptions` property of the controller.
      Initially, the `admin` option will be checked. If the user selects a different
      radio, the `role` property of the controller's `content` will be updated
      accordingly.
    
      @extends Ember.View
    */
    Ember.RadioButtonGroup = Ember.Control.extend(
    /** @scope Ember.RadioButtonGroup.prototype */ {

        classNames: ['ember-radio-button-group'],
        attributeBindings: ['name:data-name'],

        name: Ember.required(),

        /**
          The value of the selected radio button in this group
      
          @type Object
        */
        value: null,
        init: function () {
            this._super();
        },
        RadioButton: Ember.computed(function () {
            return Ember.RadioButton.extend({
                group: this,
                selectedValueBinding: 'group.value',
                nameBinding: 'group.name'
            });
        })

    });
}(EAT, Ember));

(function (EAT, Ember) {
    "use strict";

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

    var DataModel = EAT.WidgetData.extend({
        init: function () {
            this._super();
            this.set('table', EAT.WidgetData.CreateTable({
                dataModel: this,
                rowDefinitionsBinding: 'dataModel.definition.rows',
                colDefinitionsBinding: 'dataModel.definition.choices',
                rowModel: RowModel,
                cellModel: CellModel,
                tableModel: TableModel
            }));
        }
    });

    var RowView = Ember.RadioButtonGroup.extend(/*EAT.RateLimitedViewMixin, */{
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
            accessor: EAT.WidgetDefinition.HasMany('custom-dropdown-choice-' + choiceNum, {
                model: EAT.WidgetDefinition.extend({
                    label: 'dropdown choice'
                }),
                label: { accessor: EAT.WidgetDefinition.Attr("label"), type: "String" },
            }),
            category: "Custom Dropdowns"
        };
    }

    EAT.Widget.register('multiple-choice-table', {
        RowView: RowView,
        prettyName: "Multiple Choice Table",
        value: null,
        templateName: 'multiple-choice-table',
        dataModel: DataModel,
        RadioButton: Ember.Checkbox.extend({
            type: 'radio'
        }),
        definitionSchema: {
            model: EAT.WidgetDefinition.extend({
                label: "Select your choices for these questions"
            }),
            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
            choices: {
                type: "HasMany",
                prettyName: 'Choice',
                emphasizeWhenEmpty: true,
                accessor: EAT.WidgetDefinition.HasMany('choice', {
                    model: EAT.WidgetDefinition.extend({
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
                    label: { accessor: EAT.WidgetDefinition.ChildNode('label') },
                    checkBox: {
                        prettyName: 'Check Box',
                        type: "Boolean",
                        accessor: EAT.WidgetDefinition.Attr('check-box'),
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
                        accessor: EAT.WidgetDefinition.Attr('choice-type')
                    }
                })
            },
            rows: {
                type: "HasMany",
                prettyName: 'Row',
                emphasizeWhenEmpty: true,
                accessor: EAT.WidgetDefinition.HasMany('row', {
                    model: EAT.WidgetDefinition.extend({
                        label: 'untitled row'
                    }),
                    label: { accessor: EAT.WidgetDefinition.ChildNode('label') }
                })
            },
            randomizeRowOrder: {
                type: "Boolean",
                prettyName: 'Randomize Row Order',
                accessor: EAT.WidgetDefinition.Attr('randomize-row-order'),
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
                var rowData = EAT.WidgetData.create({
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
})(EAT, Ember);