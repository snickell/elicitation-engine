var wd = require('wd');

var testHelper = require('../lib/test-helper');

var BACKSPACE = wd.SPECIAL_KEYS['Back space'];
var RIGHTARROW = wd.SPECIAL_KEYS['Right arrow'];

var CELL_TOTAL_SUM = [3, 3];
var CELL_ROW_SUM = function (rowNum) {
    return [rowNum, 3];
}
var CELL_COL_SUM = function (colNum) {
    return [3, colNum];
}


exports.test = testHelper.testPage('allocation-table', 'allocation-table', function (test) {
    var self = this;
    var helper = this.helper;

    function clickScaleButton() {
        return helper.getFirstWidgetOnCurrentPage().then(function (widget) {
            return widget.elementByCssSelector(".scale-to-total")
        }).then(function (scaleButton) {
            return scaleButton.click();
        });
    }

    function getTextField(coord) {
        var rowNum = coord[0];
        var colNum = coord[1];
        var rowSelector = "tr:nth-of-type(" + (rowNum+1) + ")";
        var colSelector = "td:nth-of-type(" + (colNum+1) + ")";
        var selector = "table tbody " + rowSelector + " " + colSelector + " input[type='text']";

        return helper.getInFirstWidgetOnCurrentPage(selector);
    }

    function assertTextFieldHasText(coord, expectedText) {
        return getTextField(coord).then(function (textField) {
            return textField.getValue();
        }).then(function (text) {
            require('assert').equal(expectedText, text);
            helper.assert().equal(expectedText, text);
        });
    }

    function typeIntoTextField(coord, text) {
        return getTextField(coord).then(function (textField) {
            return textField.type(text);
        });
    }

    function typeIntoTextFields(actions) {
        var promise = testHelper.promise();

        actions.forEach(function (action) {
            var coord = action[0];
            var text = action[1];
            promise = promise.then(function () {
                return typeIntoTextField(coord, text);
            });
        });
        return promise;
    }

    return helper.tryGoingToNextPageAssertAlert().then(function () {
        return typeIntoTextField([0, 0], BACKSPACE + "5.5").then(function () {
            return helper.waitForEmber();
        }).then(function () {
            return assertTextFieldHasText([0, 0], "5.5")
        }).then(function () {
            return assertTextFieldHasText(CELL_TOTAL_SUM, "5.5");
        });
    }).then(function () {
        return typeIntoTextFields([
            [[0, 0], "8"],
            [[0, 1], BACKSPACE + "9.45"],
            [[2, 2], BACKSPACE + "1.2"],
            [[1, 1], BACKSPACE + "5"],
            [[2, 0], BACKSPACE + "3.5"],
        ]).then(function () {
            helper.waitForEmber();
        }).then(function () {
            return assertTextFieldHasText(CELL_TOTAL_SUM, "24.73");
        }).then(function () {
            return assertTextFieldHasText(CELL_COL_SUM(0), "9.08");
        }).then(function () {
            return assertTextFieldHasText(CELL_ROW_SUM(0), "15.03");
        });

    }).then(function () {
        return helper.tryGoingToNextPageAssertAlert();
    }).then(clickScaleButton).then(function () {
        return assertTextFieldHasText(CELL_TOTAL_SUM, "100").then(function () {
            return assertTextFieldHasText(CELL_COL_SUM(0), "36.72");
        }).then(function () {
            return assertTextFieldHasText(CELL_ROW_SUM(0), "60.78");
        });
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        // FIXME: we may need some fudge factor here for other floating point implementations?
        return helper.assertWidgetDataEquals(self.widgetID, {
            Solar: {
                Research: 22.563687828548325,
                Development: 38.21269712899313,
                Deployment: 0
            },
            Wind: {
                Research: 0,
                Development: 20.218358269308535,
                Deployment: 0
            },
            Underpants: {
                Research: 14.152850788515973,
                Development: 0,
                Deployment: 4.852405984634048
            },
            metadata: {}
        });
    }).then(function () {
        return helper.gotoPrevPage();
    }).then(function () {
        return typeIntoTextField(CELL_ROW_SUM(2), RIGHTARROW + BACKSPACE + BACKSPACE + BACKSPACE + BACKSPACE + BACKSPACE);
    }).then(function () {
        return assertTextFieldHasText(CELL_ROW_SUM(2), "").then(function () {
            return typeIntoTextField(CELL_ROW_SUM(2), "4");
        }).then(function () {
            return helper.waitForEmber();
        }).then(function () {
            return assertTextFieldHasText([2, 0], "2.9787")
        }).then(function () {
            return assertTextFieldHasText(CELL_TOTAL_SUM, "84.995");
        });
    }).then(function () {
        return typeIntoTextField(CELL_COL_SUM(0), RIGHTARROW + RIGHTARROW + BACKSPACE + BACKSPACE + BACKSPACE + BACKSPACE + BACKSPACE).then(function () {
            return assertTextFieldHasText(CELL_COL_SUM(0), "2");
        }).then(function () {
            return typeIntoTextField(CELL_COL_SUM(0), "9");
        }).then(function () {
            return helper.waitForEmber();
        }).then(function () {
            return assertTextFieldHasText([2, 0], "3.38194")
        }).then(function () {
            return assertTextFieldHasText(CELL_TOTAL_SUM, "88.4523");
        });
    }).then(function () {
        return helper.tryGoingToNextPageAssertAlert();
    }).then(function () {
        return typeIntoTextField(CELL_TOTAL_SUM, RIGHTARROW + RIGHTARROW + RIGHTARROW + BACKSPACE + BACKSPACE + BACKSPACE + BACKSPACE + BACKSPACE + BACKSPACE + BACKSPACE).then(function () {
            return assertTextFieldHasText(CELL_TOTAL_SUM, "");
        }).then(function () {
            return typeIntoTextField(CELL_TOTAL_SUM, "100");
        }).then(function () {
            return helper.waitForEmber();
        }).then(function () {
            return assertTextFieldHasText([2, 0], "3.823464")
        }).then(function () {
            return assertTextFieldHasText(CELL_ROW_SUM(2), "4.978071");
        });
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        // FIXME: we may need some fudge factor here for other floating point implementations?
        return helper.assertWidgetDataEquals(self.widgetID, {
            Solar: {
                Research: 28.96255692561966,
                Development: 43.201458082038116,
                Deployment: 0
            },
            Wind: {
                Research: 0,
                Development: 22.857914329120703,
                Deployment: 0
            },
            Underpants: {
                Research: 3.823463913211331,
                Development: 0,
                Deployment: 1.1546067500101884
            },
            metadata: {}
        });
    });
});