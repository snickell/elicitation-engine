var testHelper = require('../lib/test-helper');

exports.test = testHelper.testPage('multiple-choice-table', 'multiple-choice-table', function (test) {
    var self = this;
    var helper = this.helper;

    function getRows() {
        return helper.getElementsInFirstWidgetOnCurrentPage("tbody tr");
    }

    function click(selector, parent, index) {
        return parent.elementsByCssSelector(selector).then(function (els) {
            var el = els[index];
            return el.click().then(function () {
                return el;
            });
        });
    }

    function clickRadio(row, index) {
        return click("input[type='radio']", row, index);
    }

    function clickCheckBox(row, index) {
        return click("input[type='checkbox']", row, index);
    }

    function clickCheckbox(row, index) {
        return click("input[type='checkbox']", row, index);
    }

    function typeInWritein(row, index, text) {
        return click("input[type='text']", row, index).then(function (writein) {
            return writein.type(text);
        });
    }

    return helper.tryGoingToNextPageAssertAlert().then(function () {
        return getRows().then(function (rows) {
            // Row 1: "Choice 2", Check Me, "write-in for row 1"
            return clickRadio(rows[0], 1).then(function () {
                return clickCheckbox(rows[0], 0);
            }).then(function () {
                return typeInWritein(rows[0], 0, "write-in for row 1");
            }).then(function () {

                // Row 2: "Choice 2"->"Choice 1"
                return clickRadio(rows[1], 1);
            }).then(function () {
                return clickRadio(rows[1], 0);
            }).then(function () {

                // Row 3: "Choice 3", Check Me+CheckMe, "write-in for row 2"
                return clickRadio(rows[2], 2);
            }).then(function () {
                return clickCheckbox(rows[2], 0);
            }).then(function () {
                return clickCheckbox(rows[2], 0);
            }).then(function () {
                return typeInWritein(rows[2], 0, "write-in for row 3");
            }).then(function () {
                return helper.tryGoingToNextPageAssertAlert();
            }).then(function () {
                return clickRadio(rows[3], 2);
            });
        });
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataEquals(self.widgetID, {
            rows: [
                {
                    choice: 'Choice 2',
                    'Check Me': true,
                    Writein: 'write-in for row 1',
                    dataKeyText: 'Row 1'
                },
                {
                    choice: 'Choice 1',
                    'Check Me': false,
                    Writein: "",
                    dataKeyText: 'Row 2'
                },
                {
                    choice: 'Choice 3',
                    'Check Me': false,
                    Writein: 'write-in for row 3',
                    dataKeyText: 'Row 3'
                },
                {
                    choice: 'Choice 3',
                    'Check Me': false,
                    Writein: "",
                    dataKeyText: 'Row 4'
                }
            ],
            metadata: {}
        });
    });
});