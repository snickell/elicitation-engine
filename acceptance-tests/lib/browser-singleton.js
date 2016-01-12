var BROWSER = "chrome"; // chrome, firefox, ie9
var VERBOSE = false;
var CONNECT_TO_VIRTUALBOX = (BROWSER === "ie8");

var wd = require('wd');
var assert = require('assert');

var host = "127.0.0.1";
var port = 4444;

var REMOTE_URL = "http://www.nearzero.org/elicitation/run/57/acceptance-testing?login=1105b6b8b4b36b";
var LOCAL_URL = "http://localhost:3000/elicitation/run/57/acceptance-testing?login=1105b6b8b4b36b";
var LOCAL_URL_VIRTUALBOX = "http://10.0.2.2:8888/elicitation/run/57/acceptance-testing?login=1105b6b8b4b36b";

if (CONNECT_TO_VIRTUALBOX) {
    // 1: Start SPI PortForward: 8888 localhost 51227
    // 2: Setup VirtualBox Port Forwarding in Network -> NAT, Host IP: 127.0.0.1:4445, Guest IP: 10.0.2.15:4444 (check guest ip with ipconfig)
    // 3: Start selenium-server on Guest

    LOCAL_URL = LOCAL_URL_VIRTUALBOX;
    port = 4445;
}

var URL = LOCAL_URL;
var TITLE = 'Acceptance Testing - Expert Elicitation';

var browser = wd.promiseRemote(host, port);

var browserSettings = {
    browserName: BROWSER
};

/* These two are for IE, to deal with HOVER issues */
/* see: https://code.google.com/p/selenium/issues/detail?id=3055&q=IEDriver&colspec=ID%20Stars%20Type%20Status%20Priority%20Milestone%20Owner%20Summary */

// This is required for, e.g. box-and-whiskers, on IE8
// requireWindowFocus: true,

/* WINDOW_FOCUS is breaking box-and-whiskers, but is REQUIRED for term definition.
WHY does the next button not work when you go back and then forward (?) with persistent hover? 
DOES work ok for agree-disagree though */

//enablePersistentHover: true
/* END IE WORKAROUNDS */

if (BROWSER === "ie8") {
    browserSettings['requireWindowFocus'] = true;
    browserSettings['enablePersistentHover'] = true;
}

if (VERBOSE) {
    browser.on('status', function (info) {
        console.log(info.cyan);
    });

    browser.on('command', function (meth, path, data) {
        console.log(' > ' + meth, path, data || '');
    });
}

function assertElicitationTitleIsCorrect() {
    return browser.title()
    .then(function (title) {
        assert.ok(~title.indexOf(TITLE), 'Wrong title! Did the page even load?');
    });

}

var browserIsInitialized = false;
exports.get = function () {
    if (browserIsInitialized) {
        return assertElicitationTitleIsCorrect().then(function () {
            return browser;
        });
    } else {
        return browser.init(browserSettings).then(function () {
            return browser.get(URL);
        }).then(assertElicitationTitleIsCorrect).then(function () {
            return browser;
        }).fin(function () {
            browserIsInitialized = true;
        });
    }
};