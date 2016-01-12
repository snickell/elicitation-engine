var testHelper = require('../lib/test-helper');


function getOptionElements(helper) {
    return helper.getFirstWidgetOnCurrentPage().then(function (widget) {
        return widget.elementsByCssSelector("select option");
    });
}

function assertWidgetIsSane(helper) {
    return getOptionElements(helper).then(function (options) {
        helper.assert().equal(options.length, 5, "There should be five options!");

        return options[0].text().then(function (text) {
            helper.assert().equal(text, "Select one...", "The first real option should be the first manually added selection");

            return options[1].text()
        }).then(function (text) {
            helper.assert().equal(text, "Musk Ox", "The first real option should be the first manually added selection");

            return options[4].text();
        }).then(function (text) {
            helper.assert().equal(text, "Seth Nickell", "The last option should be added by 'include participants'");
        });
    });
}

function selectOption(optionIndex, helper) {
    return getOptionElements(helper).then(function (options) {
        return options[optionIndex].click();
    });
}

exports.test = testHelper.testPage('dropdown', 'dropdown', function (test) {
    var self = this;
    var helper = this.helper;

    return helper.tryGoingToNextPageAssertAlert()
    .then(function () {
        return assertWidgetIsSane(helper);
    }).then(function () {
        return selectOption(1, helper);
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataEquals(self.widgetID, {
            selection: "Musk Ox",
            metadata: {}
        });
    });
});