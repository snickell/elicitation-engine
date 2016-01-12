var testHelper = require('../lib/test-helper');

exports.test = testHelper.testPage('slider-allocation', 'slider-allocation', function (test) {
    var self = this;
    var helper = self.helper;
    var browser = helper.browser;

    function getSlider() {
        return helper.getInFirstWidgetOnCurrentPage(".ui-slider-handle");
    }

    function dragSliderBy(deltaX) {
        var xOffset = 3;
        return getSlider().then(function (slider) {
            return browser.moveTo(slider, xOffset, 3).then(function () {
                return browser.buttonDown();
            }).then(function () {
                return browser.moveTo(slider, xOffset + deltaX, 3);
            }).then(function () {
                return browser.buttonUp();
            });
        });
    }

    return helper.goToNextPageAssertNoAlert()
    .then(function () {
        return helper.assertWidgetDataEquals(self.widgetID, {
            Candy: 50,
            Toothpaste: 50,
            metadata: {}
        });
    }).then(function () {
        return helper.gotoPrevPage();
    }).then(function () {
        return dragSliderBy(50);
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataNearlyEquals(self.widgetID, {
            Candy: 40,
            Toothpaste: 60,
            metadata: {}
        }, 0.05);
    }).then(function () {
        return helper.gotoPrevPage();
    }).then(function () {
        return dragSliderBy(-500);
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataEquals(self.widgetID, {
            Candy: 100,
            Toothpaste: 0,
            metadata: {}
        });
    });
});