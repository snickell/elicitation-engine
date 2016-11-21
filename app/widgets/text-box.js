(function (EAT, Ember, ElicitationUtils) {
    "use strict";

    EAT.Widget.register('text-box', {
        prettyName: "Number Box",
        templateName: 'text-box',
        definitionSchema: {
            model: EAT.WidgetDefinition.extend({
                askForUncertaintyRange: true,
                label: "How many jellybeans are in the jar?",
                uncertaintyRangeLabel: "Indicate an uncertainty range for your estimate:",
                uncertaintyRangeWidth: 1.0
            }),
            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
            askForUncertaintyRange: { accessor: EAT.WidgetDefinition.Attr("ask-for-uncertainty-range"), type: "Boolean", prettyName: "Ask for an uncertainty range" },
            uncertaintyRangeWidth: { 
                accessor: EAT.WidgetDefinition.Attr("uncertainty-range-width"),
                prettyName: "Width of Uncertainty Range", 
                helpText: "The uncertainty range width determines the upper and lower bounds of the uncertainty range slider. Say the user enters 5 and you have set the uncertainty range width to 2: then the lower bound of the slider will be 5-2=3, and the upper bound will be 5+2=7."
            },
            uncertaintyRangeLabel: { 
                accessor: EAT.WidgetDefinition.ChildNode("uncertainty-range-label"), 
                prettyName: "Label for Uncertainty Range",
                type: "Text", 
                visibility: "askForUncertaintyRange" 
            },
            min: { 
                accessor: EAT.WidgetDefinition.Attr("min"),
                prettyName: "Min Value Allowed",
                helpText: "Smallest value allowed. If blank, no min."
            },
            max: {
                accessor: EAT.WidgetDefinition.Attr("max"),
                prettyName: "Max Value Allowed",
                helpText: "Largest value allowed. If blank, no max."
            },
            unitSuffix: { accessor: EAT.WidgetDefinition.Attr("unit-suffix"), prettyName: "Units", helpText: "Units for the number, e.g. the 'kg' in 50kg" },
            unitPrefix: { accessor: EAT.WidgetDefinition.Attr("unit-prefix"), prettyName: "Prefix for Units", helpText: "Prefix to the number, e.g. the '$' in $50m" },
            validation: { accessor: EAT.WidgetDefinition.Attr("validation"), category: "Validation" },
            validationMessage: { accessor: EAT.WidgetDefinition.Attr("validationMessage"), prettyName: "Validation Message", category: "Validation" }
        },
        setupDOM: function () {
            if (this.get('definition.askForUncertaintyRange')) {
                var slider = this.$().find("#jquery-slider");

                var data = this.get('data');
                var valChanged = function () {
                    var value = data.get('text-value');

                    var lower = slider.slider('values', 0);
                    if (lower > value) {
                        lower = value;
                        slider.slider('values', 0, lower);
                    }
                    data.set('uncertaintyRangeLower', lower);

                    var upper = slider.slider('values', 1);
                    if (upper < value) {
                        upper = value;
                        slider.slider('values', 1, upper);
                    }
                    data.set('uncertaintyRangeUpper', upper);
                }

                slider.slider({
                    change: valChanged,
                    slide: valChanged,
                    min: 0.0,
                    max: 1.0,
                    range: true,
                    step: 0.01,
                    values: [0.25, 0.75]
                });
                this.set('slider', slider);
            }
        },
        reactToTextChanging: function () {
            var text = this.get('data.text');
            var slider = this.get('slider');

            var value = parseFloat(text);
            if (isNaN(value) || value === Infinity) return;

            var definedMin = parseFloat(this.get('definition.min'));
            var definedMax = parseFloat(this.get('definition.max'));

            if (!(Ember.isNone(text) || Ember.isNone(slider) || isNaN(value))) {
                this.$().find(".uncertainty-range").addClass('ready');


                this.set('data.text-value', value);

                var offset = parseFloat(this.get('definition.uncertaintyRangeWidth') || 1.0);
                var min = value - offset;
                var max = value + offset;

                // Clamp to our definition's min and max
                if (!isNaN(definedMin))
                    min = Math.max(definedMin, min);
                if (!isNaN(definedMax))
                    max = Math.min(definedMax, max);

                this.set('uncertaintyRangeMin', min);
                this.set('uncertaintyRangeMax', max);

                slider.slider('option', 'min', min);
                slider.slider('option', 'max', max);

                slider.slider('values', 0, value - (offset/2));
                slider.slider('values', 1, value + (offset/2));
            }
        }.observes('data.text', 'definition.uncertaintyRangeWidth'),
        rerenderIfAskForUncertaintyRangeChanges: function () {
            this.rerender();
        }.observes('definition.askForUncertaintyRange'),
        validate: function (text) {
            var validation = this.get('definition.validation');
            if (validation) {
                if (!ElicitationUtils.evalInScope(validation, { answer: text})) {
                    return "Answer must be a" + this.get('definition.validationMessage');
                }
            }
            return;
        },
        serializeData: function (data, errors) {
            var response = this.get('data.text');

            if (!response) {
                errors.pushObject("A text box is still blank");
            } else {
                var validationError = this.validate(response);
                if (validationError) {
                    errors.pushObject(validationError);
                }
            }

            data.set('value', response);
            if (this.get('definition.askForUncertaintyRange')) {
                data.set('uncertaintyRangeLower', this.get('data.uncertaintyRangeLower'));
                data.set('uncertaintyRangeUpper', this.get('data.uncertaintyRangeUpper'));
            }
        }
    });

})(EAT, Ember, ElicitationUtils);
