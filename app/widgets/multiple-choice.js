import Ember from 'ember'

import { Widget } from 'eat/widget'
import { WidgetDefinition } from 'eat/widget-definition'
import { WidgetData } from 'eat/widget-data'

var globalMultipleChoiceNum = 0;

Widget.register('multiple-choice', {
    prettyName: "Multiple Choice",
    value: null, // FIXME: remove this?
    templateName: 'multiple-choice',
    dataModel: WidgetData.extend({
        writein: ""
    }),
    definitionSchema: {
        model: WidgetDefinition.extend({
            writein: false
        }),
        label: { accessor: WidgetDefinition.ChildNode("label"), type: "Text" },
        writein: { accessor: WidgetDefinition.Attr("writein"), type: "Boolean", prettyName: "Append a write-in choice" },
        choices: {
            type: "HasMany",
            prettyName: 'Choice',
            emphasizeWhenEmpty: true,
            accessor: WidgetDefinition.HasMany('choice', {
                model: WidgetDefinition.extend({
                    label: "One choice amongst many",
                    htmlID: function () {
                        return this.get('dataKey');
                    }.property('dataKey')
                }),
                label: { accessor: WidgetDefinition.Contents() }
            })
        }
    },
    initWidget: function () {
        this._super();
        this.set('multipleChoiceNum', globalMultipleChoiceNum++);
    },
    setupDOM: function () {
    },
    serializeData: function (data, errors) {
        var choice = this.$().find("input[type='radio']:checked").val();

        data.set('choice', choice);
        if (!choice) {
            errors.pushObject("You didn't select one of the multiple choices");
        }
    },
    resumeFromSerializedData: function (serializedData) {
        if (serializedData && serializedData.choice) {
            var choice = serializedData['choice'];

            var radioButton = this.$().find("input[type='radio']").toArray().find(function (x) {
                return $(x).val() === choice;
            });

            if (Ember.isNone(radioButton) && this.get('definition.writein')) {
                radioButton = $(".writein input[type='radio']");
                this.set('data.writein', choice);
            }

            $(radioButton).prop('checked', true);
        }
    }
});