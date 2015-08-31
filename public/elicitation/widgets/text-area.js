(function (EAT, Ember) {
    "use strict";

    EAT.Widget.register('text-area', {
        prettyName: "Text Area",
        templateName: 'text-area',
        definitionSchema: {
            model: EAT.WidgetDefinition.extend({
                numRows: 4,
                optional: true
            }),
            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
            numRows: { accessor: EAT.WidgetDefinition.Attr("num-rows"), type: "String", prettyName: "# of Lines of Text" },
            placeholder: { accessor: EAT.WidgetDefinition.Attr("placeholder"), type: "String", prettyName: "Placeholder Text" },
            optional: { accessor: EAT.WidgetDefinition.Attr("optional"), type: "Boolean", prettyName: "Response is optional" }
        },
        serializeData: function (data, errors) {
            var response = this.get('data.text');

            if (!response && !this.get('definition.optional')) {
                errors.pushObject("A text area is still blank");
            }

            data.set('text', response);
        }
    });


})(EAT, Ember);
