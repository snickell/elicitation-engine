var testHelper = require('../lib/test-helper');

exports.test = testHelper.testPage('first-page', 'first-page-to-second-page', function (test) {
    var helper = this.helper;

    return helper.assertCurrentPageTitleIs("first-page")
    .then(function () {
        return helper.goToNextPageAssertNoAlert();
    }).then(function () {
        return helper.assertCurrentPageTitleIs("second-page");
    });
});