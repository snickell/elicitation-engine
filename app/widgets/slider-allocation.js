(function (EAT, Ember) {
    "use strict";

    EAT.Widget.register('slider-allocation', {
        prettyName: "Slider Allocation",
        value: null, // FIXME: remove this? unused?
        templateName: 'slider-allocation',
        definitionSchema: {
            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
            totalAllocation: { accessor: EAT.WidgetDefinition.Attr("total-allocation"), prettyName: "Allocation", type: "String" },
            leftLabel: { accessor: EAT.WidgetDefinition.ChildNode("left-label"), prettyName: "Left Item" },
            rightLabel: { accessor: EAT.WidgetDefinition.ChildNode("right-label"), prettyName: "Right Item" },
            unitSuffix: { accessor: EAT.WidgetDefinition.Attr("unit-suffix"), prettyName: "Units", helpText: "Units for the value being allocated, e.g. the 'kg' in 50kg" },
            unitPrefix: { accessor: EAT.WidgetDefinition.Attr("unit-prefix"), prettyName: "Prefix for Units", helpText: "Prefix to the value being allocated, e.g. the '$' in $50m" },
            model: EAT.WidgetDefinition.extend({
                label: "How would you spend a special allocation of $100m?",
                totalAllocation: 100,
                unitPrefix: "$",
                unitSuffix: "m",
                leftLabel: "Candy",
                rightLabel: "Toothpaste"
            })
        },
        setupDOM: function () {
            var slider = this.$().find("#jquery-slider");

            var elicitationWidget = this;
            var valChanged = function () {
                elicitationWidget.redraw();
            }

            slider.slider({
                change: valChanged,
                slide: valChanged,
                min: 0.0,
                max: 1.0,
                step: 0.01,
                value: 0.5
            });

            this.set('slider', slider);
        },
        redraw: function () {
            var slider = this.get('slider');
            if (Ember.isNone(slider)) return;

            var totalAllocation = this.get('definition.totalAllocation');
            var val = parseFloat(slider.slider("value"));
            var leftBudget = ((1.0 - val) * totalAllocation).toFixed(1);
            this.set('data.leftValue', leftBudget);

            var rightBudget = (val * totalAllocation).toFixed(1);
            this.set('data.rightValue', rightBudget);
        }.observes('definition.totalAllocation', 'slider'),
        serializeData: function (data, errors) {
            var leftLabel = ElicitationUtils.escapeForEmberProperty(this.get('definition.leftLabel'));
            var rightLabel = ElicitationUtils.escapeForEmberProperty(this.get('definition.rightLabel'));
            data.set(leftLabel, parseFloat(this.get('data.leftValue')));
            data.set(rightLabel, parseFloat(this.get('data.rightValue')));
        },
        afterStateResume: function () {
            // update slider position from leftValue and rightValue
            var slider = this.get('slider');
            if (Ember.isNone(slider)) return;


            var leftValue = parseFloat(this.get('data.leftValue'));
            var rightValue = parseFloat(this.get('data.rightValue'));

            var value = leftValue / (leftValue + rightValue);

            slider.slider("value", value);
        }
    });

})(EAT, Ember);