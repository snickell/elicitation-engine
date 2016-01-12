var testHelper = require('../lib/test-helper');

exports.test = testHelper.testPage('text-area', 'text-area', function (test) {
    var self = this;
    var helper = this.helper;

    return helper.tryGoingToNextPageAssertAlert()
    .then(function () {
        return helper.getFirstWidgetOnCurrentPage().then(function (widget) {
            return widget.elementByCssSelector("textarea").then(function (textarea) {
                return textarea.type("Four score\nand seven years ago");
            });
        });
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataEquals(self.widgetID, {
            text: "Four score\nand seven years ago",
            metadata: {}
        });
    });
});