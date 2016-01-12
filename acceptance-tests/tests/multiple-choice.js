var testHelper = require('../lib/test-helper');

exports.test = testHelper.testPage('multiple-choice', 'multiple-choice', function (test) {
    var self = this;
    var helper = self.helper;

    function selectChoice(choiceIndex, labelText) {
        return helper.getFirstWidgetOnCurrentPage().then(function (widget) {
            return widget.elementsByCssSelector("input[type='radio']", function (err, elements) {
                helper.assert().equal(elements.length, 6, "There should be 6 radio buttons!");
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
            choice: "Choice 3",
            metadata: {}
        });
    }).then(function () {
        return helper.gotoPrevPage();
    }).then(function () {
        // Note: On Chrome+Firefox you can just click in the text element, and since that is inside the label, it will select the
        // radio button, but its "OK" if other browser's don't support that.... still... reach for the stars, right?
        return selectChoice(5).then(function () {
            return helper.getInFirstWidgetOnCurrentPage(".choice:nth-of-type(6) input[type='text']").then(function (input) {
                return input.click().then(function () {
                    return input.type("Some write-in answer");
                });
            });
        });
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataEquals(self.widgetID, {
            choice: "Some write-in answer",
            metadata: {}
        });
    });
});