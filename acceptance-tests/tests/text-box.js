var testHelper = require('../lib/test-helper');

exports.test = testHelper.testPage('text-box', 'text-box', function (test) {
    var self = this;
    var helper = this.helper;

    function getUncertaintyRangeSliders() {
        return helper.getFirstWidgetOnCurrentPage().then(function (widget) {
            return widget.elementsByCssSelector(".uncertainty-range a.ui-slider-handle");
        });
    }

    function dragSliderBy(slider, deltaX) {
        return helper.dragElementBy(slider, deltaX, 0, 5, 5);
    }

    return helper.tryGoingToNextPageAssertAlert()
    .then(function () {
        return helper.getFirstWidgetOnCurrentPage().then(function (widget) {
            return widget.elementByCssSelector("input.answer").then(function (element) {
                return element.click().then(function () {
                    return element.type("5");
                });
            });
        });
    }).then(function () {
        return helper.waitForEmber();
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataEquals(self.widgetID, {
            value: 5,
            uncertaintyRangeLower: 0,
            uncertaintyRangeUpper: 10,
            metadata: {}
        });
    }).then(function () {
        return helper.gotoPrevPage();
    }).then(function () {
        return getUncertaintyRangeSliders().then(function (sliders) {
            helper.assert().equal(sliders.length, 2, "There should be two drag handles");

            return dragSliderBy(sliders[0], -200).then(function () {
                return dragSliderBy(sliders[1], 200);
            });
        });
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataEquals(self.widgetID, {
            value: 5,
            uncertaintyRangeLower: -5,
            uncertaintyRangeUpper: 15,
            metadata: {}
        });
    });
});