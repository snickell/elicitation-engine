var testHelper = require('../lib/test-helper');


exports.test = testHelper.testPage('likert-scale', 'likert', function (test) {
    var self = this;
    var helper = self.helper;

    function selectChoice(choiceIndex, labelText) {
        return helper.getFirstWidgetOnCurrentPage().then(function (widget) {
            return widget.elementsByCssSelector("input[type='radio']", function (err, elements) {
                helper.assert().equal(elements.length, 5, "There should be 5 radio buttons in the likert scale!");
                return elements[choiceIndex].click();
            });
        });
    }


    return helper.tryGoingToNextPageAssertAlert()
    .then(function () {
        return selectChoice(2);
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataEquals(self.widgetID, {
            agreement: "neutral",
            metadata: {}
        });
    }).then(function () {
        return helper.gotoPrevPage();
    }).then(function () {
        return selectChoice(4);
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataEquals(self.widgetID, {
            agreement: "stronglypositive",
            metadata: {}
        });
    });
});