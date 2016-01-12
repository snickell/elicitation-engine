var testHelper = require('../lib/test-helper');

exports.test = testHelper.testPage('tabular-input', 'tabular-input', function (test) {
    var self = this;
    var helper = self.helper;
    var browser = helper.browser;

    function clickAndType(element, toType) {
        return element.click().then(function () {
            return element.type(toType);
        });
    }

    function getInputs() {
        return helper.getElementsInFirstWidgetOnCurrentPage("input[type='text']");
    }

    return getInputs().then(function (inputs) {
        helper.assert().equal(inputs.length, 2, "Should be two inputs, initially");
        return clickAndType(inputs[0], "Hello").then(function () {
            return clickAndType(inputs[1], "World");
        }).then(function () {
            return clickAndType(inputs[0], " Other");
        }).then(getInputs);
    }).then(function (inputs) {
        helper.assert().equal(inputs.length, 4, "Should be four inputs after first row");
        return clickAndType(inputs[2], "Only one line in the second row")
        .then(getInputs);
    }).then(function (inputs) {
        helper.assert().equal(inputs.length, 6, "Should be six inputs after 2nd row");
        return clickAndType(inputs[5], "Second column is valid too")
        .then(getInputs);
    }).then(function (inputs) {
        helper.assert().equal(inputs.length, 8, "Should be eight inputs after 2nd row");
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataEquals(self.widgetID, {
            name_0: 'Hello Other',
            fun_fact_0: 'World',
            name_1: 'Only one line in the second row',
            fun_fact_1: '',
            name_2: '',
            fun_fact_2: 'Second column is valid too',
            name_3: '',
            fun_fact_3: '',
            metadata: {}
        });
    });
});