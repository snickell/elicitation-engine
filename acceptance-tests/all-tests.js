// First run: selenium-server.bat
// OR
// java -jar selenium-server-standalone-2.32.0.jar -Dwebdriver.chrome.driver=chromedriver.exe

// THEN run:
// nodeunit all-tests.js

var TESTS = [
    'first-page-to-second-page',
    'agree-disagree',
    'allocation-table',
    'box-and-whiskers',
    'card-rank',
    'dropdown',
    'image',
    'likert',
    'multiple-choice',
    'multiple-choice-table',
    'paragraph',
    'slider-allocation',
    'tabular-input',
    'term-definitions',
    'text-area',
    'text-box',
    'time-trend',
    'variables'
];



var widgetTests = {};

TESTS.forEach(function (testName) {
    widgetTests[testName] = require('./tests/' + testName).test;
});

exports["Widget Tests"] = widgetTests;