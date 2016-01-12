var testHelper = require('../lib/test-helper');

exports.test = testHelper.testPage('time-trend', 'time-trend', function (test) {
    var self = this;
    var helper = self.helper;
    var browser = helper.browser;

    function getElementsInSeries(seriesName, childSelector) {
        var selector = ".series" + "[title='" + seriesName + "']" + " " + childSelector;
        return helper.getElementsInFirstWidgetOnCurrentPage(selector);
    }

    function getPointsForSeries(seriesName) {
        return getElementsInSeries(seriesName, ".point .dot").then(function (points) {
            // Points are now in the DOM in reverse order to achieve proper z-index stacking
            return points.reverse();
        });
    }

    var DELAY = 1500;

    return helper.tryGoingToNextPageAssertAlert()
    .then(function () {
        return getPointsForSeries("Expected").then(function (points) {
            // Try dragging the unmovable point first!
            return helper.dragElementBy(points[0], 5, -100).then(function () {
                return helper.dragElementBy(points[2], 5, 50).delay(DELAY);
            }).then(function () {
                return helper.dragElementBy(points[1], 5, 700).delay(DELAY);
            }).then(function () {
                return helper.dragElementBy(points[3], 5, 200);
            }).then(function () {
                return helper.dragElementBy(points[4], 5, 250)
            }).then(function () {
                return helper.dragElementBy(points[3], -10, -200).delay(DELAY);
            }).then(function () {
                return helper.waitForEmber();
            });
        })
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataNearlyEquals(self.widgetID, {
            Expected: [
                { x: 2014, y: -4.8 },
                { x: 2016, y: 7.3 },
                { x: 2018, y: 12.9 },
                { x: 2020, y: 3.6 }
            ],
            metadata: {}
        }, 0.01);
    });
});