var testHelper = require('../lib/test-helper');

var EPSILON = 0.025; // 0.01 except for IE

exports.test = testHelper.testPage('box-and-whiskser', 'box-and-whiskers', function (test) {
    var self = this;
    var helper = this.helper;
    var browser = this.helper.browser;

    function getAxis() {
        return helper.getInFirstWidgetOnCurrentPage("#axis");
    }

    function clickOnAxis(ratio) {
        return getAxis().then(function (axis) {
            return browser.getSize(axis).then(function (size) {
                var deltaX = Math.floor(ratio * size.width);
                return browser.moveTo(axis, deltaX, 80);
            }).then(function () {
                return browser.click();
            });
        });
    }

    function getDragHandles() {
        return helper.getInFirstWidgetOnCurrentPage(".box-plot").then(function (boxPlot) {
            var handles = {};
            return boxPlot.elementsByCssSelector(".ui-resizable-handle").then(function (elements) {
                helper.assert().equal(elements.length, 4, "Should be 4 drag handles");

                handles["0th"] = elements[0];
                handles["100th"] = elements[1];
                handles["25th"] = elements[2];
                handles["75th"] = elements[3];

                return boxPlot.elementByCssSelector("#median.ui-draggable");
            }).then(function (element) {
                handles["50th"] = element;

                return handles;
            });
        });
    }

    function dragHandleBy(handleElement, deltaX, xOffset) {
        var xOffset = xOffset ? xOffset : 3;
        return browser.moveTo(handleElement, xOffset, 10).then(function () {
            return browser.buttonDown();
        }).then(function () {
            return browser.moveTo(handleElement, xOffset + deltaX, 10);
        }).then(function () {
            return browser.buttonUp();
        });
    }

    return helper.tryGoingToNextPageAssertAlert()
    .then(function () {
        return clickOnAxis(0.2);
    }).then(function () {
        return clickOnAxis(0.9);
    }).then(function () {
        return clickOnAxis(0.3);
    }).then(function () {
        return helper.tryGoingToNextPageAssertAlert();
    }).then(function () {
        return clickOnAxis(0.6);
    }).then(function () {
        return clickOnAxis(0.5);
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataNearlyEquals(self.widgetID, {
            _0th: 2,
            _25th: 2.7,
            _50th: 5.5,
            _75th: 6.9,
            _100th: 9,
            metadata: {}
        }, EPSILON);
    }).then(function () {
        return helper.gotoPrevPage();
    }).then(function () {
        return getDragHandles().then(function (dragHandles) {
            return dragHandleBy(dragHandles["100th"], 140).then(function () {
                return helper.waitForEmber();
            }).then(function () {
                return dragHandleBy(dragHandles["75th"], 75);
            }).then(function () {
                return dragHandleBy(dragHandles["50th"], 75);
            }).then(function () {
                return dragHandleBy(dragHandles["25th"], 50);
            }).then(function () {
                return dragHandleBy(dragHandles["0th"], -250);
            }).then(function () {
                return helper.waitForEmber();
            }).then(function () {
                // Drag not the handle but the element below it!
                return dragHandleBy(dragHandles["25th"], 20, 20);
            }).then(function () {
                return helper.waitForEmber();
            });
        });
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataNearlyEquals(self.widgetID, {
            _0th: -3.0,
            _25th: 5.0,
            _50th: 8.5,
            _75th: 9.9,
            _100th: 11.8,
            metadata: {}
        }, EPSILON);
    });
});