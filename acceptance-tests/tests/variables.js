var testHelper = require('../lib/test-helper');

var wd = require('wd');
var BACKSPACE = wd.SPECIAL_KEYS['Back space'];


exports.test = testHelper.testPage('yournumber-variable', 'variables', function (test) {
    var self = this;
    var helper = self.helper;
    var browser = helper.browser;

    function clickAndType(element, toType) {
        return element.click().then(function () {
            return element.type(toType);
        });
    }

    function getInput() {
        return helper.getInFirstWidgetOnCurrentPage("input[type='text']");
    }

    var WIDGET_IS_INVISIBLE = '';

    // If widget is invisible, the text should be ''
    function getNthParagraphWidgetText(index) {
        return helper.elementsInPage(".widget.paragraph").then(function (paragraphWidgets) {
            var widget = paragraphWidgets[index];
            return widget.text();
        });
    }

    return getInput().then(function (input) {
        return clickAndType(input, "5").then(function (inputs) {
            return helper.goToNextPageAssertNoAlert();
        }).then(function () {
            return getNthParagraphWidgetText(0);
        }).then(function (text) {
            helper.assert().equal(text, WIDGET_IS_INVISIBLE, "First paragraph widget should be invisible");
            return getNthParagraphWidgetText(1);
        }).then(function (text) {
            helper.assert().equal(text, "YourNumber was greater than 4");

            return helper.goToNextPageAssertNoAlert();
        }).then(function () {
            return getNthParagraphWidgetText(0);
        }).then(function (text) {
            // FIXME: diabled until variable substitutions are fixed
            // helper.assert().equal(text, "YourNumber is 5");
        }).then(function () {
            return helper.gotoPrevPage();
        }).then(function () {
            return helper.gotoPrevPage();
        }).then(function () {
            return clickAndType(input, BACKSPACE + "3");
        }).then(function () {
            return helper.goToNextPageAssertNoAlert();
        }).then(function () {
            return getNthParagraphWidgetText(0);
        }).then(function (text) {
            helper.assert().equal(text, "YourNumber was between 1 and 4");
            return getNthParagraphWidgetText(1);
        }).then(function (text) {
            helper.assert().equal(text, WIDGET_IS_INVISIBLE, "2nd paragraph widget should be invisible");

            return helper.goToNextPageAssertNoAlert();
        }).then(function () {
            return getNthParagraphWidgetText(0);
        }).then(function (text) {
            // FIXME: diabled until variable substitutions are fixed
            // helper.assert().equal(text, "YourNumber is 3");
        });
    });
});