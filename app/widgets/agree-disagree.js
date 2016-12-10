import './agree-disagree.css';

import Ember from 'ember';
import Widget from 'eat/widget'
import {WidgetDefinition} from 'eat/widget-definition';

// FIXME: We use this global to create radio "groups"...
// is there a better way?
var globalAgreeDisagreeNum = 0;

Widget.register('agree-disagree', {
    agreeDisagreeNum: null,
    prettyName: "Agree/Disagree",
    initWidget: function () {
        this.set('agreeDisagreeNum', globalAgreeDisagreeNum++);
    },
    templateName: 'agree-disagree',
    definitionSchema: {
        label: { accessor: WidgetDefinition.ChildNode("label"), type: "Text" }
    },
    serializeData: function (data, errors) {
        var agreement = this.$().find("input[type='radio']:checked").val();

        data.set('agreement', agreement);
        if (!agreement) {
            errors.pushObject("You didn't indicate if you agree/disagreed with one of the statements");
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
