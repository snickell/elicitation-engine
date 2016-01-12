// First run: selenium-server.bat
// OR
// java -jar selenium-server-standalone-2.32.0.jar -Dwebdriver.chrome.driver=chromedriver.exe

var TEST_TO_RUN = 'multiple-choice';




var browserSingleton = require('./lib/browser-singleton');

function runTest(name) {
    var test = require('./tests/' + name).test;
    return test.setUp().then(function () {
        return test[name]();
    }).then(function () {
        return test.tearDown();
    });
}


var browser = undefined;
browserSingleton.get().then(function (localBrowser) {
    browser = localBrowser;
    exports.browser = browser;

    return runTest(TEST_TO_RUN);
}).then(function () {
    console.log("TEST PASSED!");
});




/*

test
open	/elicitation/48/DebugAnon?login=B99338f855	
waitForPageToLoad	60000	
click	xpath=//div[@id='ember552']//label[.='I agree']	
click	name=agreeDisagree0	
click	xpath=//div[@id='ember592']//label[.='I disagree']	
click	xpath=//div[@id='ember592']/div[1]/div[2]/label[2]/input	
click	xpath=//div[@id='ember1195']/div	
click	xpath=//ul[@id='ui-id-1']//span[.='Your Confidence']	
addSelection	id=ember1205	
addSelection	xpath=//div[@id='ember1234']//select[.=' 1 - Least2345 - Most']/option[4]	
click	id=next	
type	id=ember1311	7
type	id=ember1369	12

*/

exports.browser = browser;
