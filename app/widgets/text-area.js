import Ember from 'ember'

import { Widget } from 'eat/widget'
import { WidgetDefinition } from 'eat/widget-definition'

Widget.register('text-area', {
    prettyName: "Text Area",
    templateName: 'text-area',
    definitionSchema: {
        model: WidgetDefinition.extend({
            numRows: 4,
            optional: true
        }),
        label: { accessor: WidgetDefinition.ChildNode("label"), type: "Text" },
        numRows: { accessor: WidgetDefinition.Attr("num-rows"), type: "String", prettyName: "# of Lines of Text" },
        placeholder: { accessor: WidgetDefinition.Attr("placeholder"), type: "String", prettyName: "Placeholder Text" },
        optional: { accessor: WidgetDefinition.Attr("optional"), type: "Boolean", prettyName: "Response is optional" }
    },
    serializeData: function (data, errors) {
        var response = this.get('data.text');

        if (!response && !this.get('definition.optional')) {
            errors.pushObject("A text area is still blank");
        }

        data.set('text', response);
    }
});
