var testHelper = require('../lib/test-helper');

exports.test = testHelper.testPage('paragraph', 'paragraph', function (test) {
    var self = this;
    var helper = self.helper;
    var browser = helper.browser;

    function assertTextEqual(selector, textShouldBe) {
        return helper.getInFirstWidgetOnCurrentPage(selector).then(function (el) {
            return el.text().then(function (textIs) {
                helper.assert().equal(textIs, textShouldBe);
            });
        });
    }

    return assertTextEqual("h2", "This is a Header").then(function () {
        return assertTextEqual("p:nth-of-type(1)", "With a block of text under it demonstrating a few features of Markdown formatting, including:");
    }).then(function () {
        return assertTextEqual("ul li:nth-of-type(1)", "A link to another website");
    }).then(function () {
        return assertTextEqual("ul li:nth-of-type(1) a", "another website");
    }).then(function () {
        return assertTextEqual("p:nth-of-type(2)", "And another paragraph, with a term definition.");
    }).then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertWidgetDataEquals(self.widgetID, null);
    });
});