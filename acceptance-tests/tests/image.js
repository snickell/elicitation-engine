var testHelper = require('../lib/test-helper');

exports.test = testHelper.testPage('image', 'image', function (test) {
    var self = this;
    var helper = self.helper;
    var browser = helper.browser;

    return helper.getInFirstWidgetOnCurrentPage("img").then(function (image) {
        return browser.getSize(image).then(function (size) {
            helper.assert().ok(size.width > 480 && size.width < 495, "Image width should be 487 ideally, but IE is a little wonk");
            helper.assert().ok(size.height > 360 && size.height < 375, "Image width should be 365 ideally, but IE is a little wonk");

            return image.getAttribute("src");
        }).then(function (src) {
            helper.assert().ok(~src.indexOf("/ImageInElicitation?ElicitationID=57&id=65d5fb34-7223-47e9-b653-04bbd69c7c61"));
        });
    }).then(function () {
        return helper.getInFirstWidgetOnCurrentPage(".caption").then(function (caption) {
            return caption.text().then(function (text) {
                helper.assert().equal(text, "I love you!!!");
            });
        }).then(function () {
            return helper.goToNextPageAssertNoAlert();
        }).then(function () {
            return helper.assertWidgetDataEquals(self.widgetID, null);
        });
    });
});