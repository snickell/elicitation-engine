import Ember from 'ember';
import { Widget } from 'eat/widget';
import { WidgetDefinition } from 'eat/widget-definition';

// FIXME: We use this global to create radio "groups"...
// is there a better way?
var globalLikertNum = 0;

Widget.register('likert', {
    likertNum: null,
    prettyName: "Likert Scale",
    initWidget: function () {
        this._super();
        this.set('likertNum', globalLikertNum++);
    },
    templateName: 'likert',
    definitionSchema: {
        model: WidgetDefinition.extend({
            label: "Authoring elicitations makes me feel mushy inside.",
            stronglyNegativeLabel: "Strongly Disagree",
            negativeLabel: "Disagree",
            neutralLabel: "Not Sure",
            positiveLabel: "Agree",
            stronglyPositiveLabel: "Strongly Agree"
        }),
        label: { accessor: WidgetDefinition.ChildNode("label"), type: "Text" },
        stronglyNegativeLabel: {
            accessor: WidgetDefinition.Attr("strongly-negative-label"),
            prettyName: "Strongly Negative Label"
        },
        negativeLabel: {
            accessor: WidgetDefinition.Attr("negative-label"),
            prettyName: "Negative Label"
        },
        neutralLabel: {
            accessor: WidgetDefinition.Attr("neutral-label"),
            prettyName: "Neutral Label"
        },
        positiveLabel: {
            accessor: WidgetDefinition.Attr("positive-label"),
            prettyName: "Positive Label"
        },
        stronglyPositiveLabel: {
            accessor: WidgetDefinition.Attr("strongly-positive-label"),
            prettyName: "Strongly Positive Label"
        }
    },
    serializeData: function (data, errors) {
        var agreement = this.$().find("input[type='radio']:checked").val();

        data.set('agreement', agreement);
        if (!agreement) {
            errors.pushObject("You didn't say how you felt about one of the statements");
        }
    },
    resumeFromSerializedData: function (serializedData) {
        if (serializedData && serializedData.agreement) {
            var radioButton = this.$().find("input[type='radio']").toArray().find(function (x) {
                return $(x).val() === serializedData['agreement'];
            });
            $(radioButton).prop('checked', true);
        }
    }
});
