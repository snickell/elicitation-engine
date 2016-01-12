var testHelper = require('../lib/test-helper');

function selectChoice(choiceIndex) {
    var helper = this.helper;

    return helper.getFirstWidgetOnCurrentPage().then(function (widget) {
        return widget.elementsByCssSelector("input[type='radio']").then(function (elements) {
            helper.assert().equal(elements.length, 2, "There should be two radio buttons!");
            return elements[choiceIndex].click();
        });
    });
}

exports.test = testHelper.testPage('agree-disagree', 'agree-disagree', function (test) {
    var self = this;
    var helper = self.helper;

    return helper.tryGoingToNextPageAssertAlert()
    .then(function () {
        return selectChoice.call(self, 1);
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataEquals(self.widgetID, {
            agreement: "disagree",
            metadata: {}
        });
    }).then(function () {
        return helper.gotoPrevPage();
    }).then(function () {
        return selectChoice.call(self, 0);
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataEquals(self.widgetID, {
            agreement: "agree",
            metadata: {}
        });
    });
});