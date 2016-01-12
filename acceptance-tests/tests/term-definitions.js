var testHelper = require('../lib/test-helper');

exports.test = testHelper.testPage('paragraph', 'term-definitions', function (test) {
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

    /*

    .defined-term .phrase has text: "term definition"

    .defined-term .popup does not exist

    hover over .defined-term .phrase

    .defined-term .popup exists

    .defined-term .popup has text "Hello World"

    */
    return assertTextEqual(".defined-term .phrase", "term definition").then(function () {
        return helper.getElementsInFirstWidgetOnCurrentPage(".defined-term .popup");
    }).then(function (potentialPopupElements) {
        helper.assert().equal(potentialPopupElements.length, 0, "There shouldn't be a popup unless we are hovering over it!");

        return helper.getInFirstWidgetOnCurrentPage(".defined-term .phrase");
    }).then(function (phraseElement) {
        return browser.moveTo(phraseElement, 5, 5)
        .then(function () {
            helper.waitForEmber();
        }).then(function () {
            return helper.getElementsInFirstWidgetOnCurrentPage(".defined-term .popup");
        }).then(function (potentialPopupElements) {
            helper.assert().equal(potentialPopupElements.length, 1, "There should be a popup now, since we're hovering");

            return assertTextEqual(".defined-term .popup", "Hello World");
        });
    });
});