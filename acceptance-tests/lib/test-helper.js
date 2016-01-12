var assertModule = require('assert');
var Q = require('q');

var browserSingleton = require('./browser-singleton');
var deepEqualEpsilon = require('./deep-equal-epsilon');

function NOT_IMPLEMENTED() {
	assert(false, "Not implemented!");
}

var EMBER_TIMEOUT = 10000;

function setupSuite(pageName) {
    var self = this;
    var helper;

    return browserSingleton.get().then(function (browser) {
        self.browser = browser;
        self.helper = TestHelper.create({ browser: browser });
        helper = self.helper;

        return helper.assertCanPingElicitation();
    }).then(function () {
        return helper.gotoPageNamed(pageName);
    }).then(function () {
        return helper.getWidgetID(0).then(function (widgetID) {
            self.widgetID = widgetID;
        }, function (err) {
            // no widgetID? probably no widget on this page
        });
    }).then(function () {
        return helper.clearElicitationData();
    });
}

function TestHelper () {};

TestHelper.create = function (shamDict) {
    var helper = new TestHelper;
    helper._assert = assertModule;
	helper.browser = shamDict.browser;
	return helper;
};

TestHelper.prototype = {
    browser: undefined,
    CURRENT_PAGE_SELECTOR: ".page.is-visible",
    assert: function () {
        return this._assert;
    },
    evalTest: function (toEval) {
	    return this.browser.eval('EAT.Test.' + toEval);
    },
    elementInPage: function (subselector) {
        var selector = this.CURRENT_PAGE_SELECTOR + ' ' + subselector;
        // NOTE: we now use a jquery call to gain standardized CSS query features, e.g. nth-of-type on IE8
        // return this.browser.elementByCssSelector(selector);
        return this.$0(selector);
    },
    $: function (selector) {
        return this.evalTest('$("' + selector + '").get()');
    },
    $0: function (selector) {
        return this.$N(selector, 0);
    },
    $N: function (selector, nth) {
        return this.evalTest('$("' + selector + '").get(' + nth + ')');
    },

    elementsInPage: function (subselector) {
        var selector = this.CURRENT_PAGE_SELECTOR + ' ' + subselector;
        // NOTE: we now use a jquery call to gain standardized CSS query features, e.g. nth-of-type on IE8
        //return this.browser.elementsByCssSelector(selector);
        return this.$(selector);
    },
	getCurrentPage: function () {
	    return this.elementInPage('');
	},
	getCurrentPageTitle: function () {
	    return this.elementInPage("#title").then(function (titleElement) {
	        return titleElement.text();
	    });
	},
	assertCurrentPageTitleIs: function (correctTitle) {
	    var self = this;

	    return this.getCurrentPageTitle().then(function (title) {
	        self.assert().equal(correctTitle, title, "Title should be first-page");
	    });
	},
	getInFirstWidgetOnCurrentPage: function (subselector) {
	    return this.elementInPage('.widget ' + subselector);
	},
	getElementsInFirstWidgetOnCurrentPage: function (subselector) {
	    return this.elementsInPage('.widget ' + subselector);
	},
	getFirstWidgetOnCurrentPage: function () {
	    return this.getInFirstWidgetOnCurrentPage('');
	},
	waitForEmber: function () {
	    return this.evalTestAndWaitForEmber('ping("waiting for ember")');
	},
	evalTestAndWaitForEmber: function (toEval) {
	    var self = this;
	    return this.evalTest('notifyWhenEmberIsDone().' + toEval).then(function (value) {
	        return self.browser.waitForCondition('EAT.Test.isEmberDone()', EMBER_TIMEOUT).then(function () {
	            return value;
	        });
	    });
	},
	gotoPageNamed: function (pageName) {
	    var self = this;
	    return this.evalTestAndWaitForEmber('gotoPageNamed("' + pageName + '")').then(function (success) {
			self.assert().ok(success, "Didn't find the page named: " + pageName);
		});
	},
	gotoNextPage: function () {
	    return this.evalTestAndWaitForEmber('gotoNextPage()');
	},
	gotoNextPageWithoutWaiting: function () {
	    return this.elementInPage("input#next").then(function (nextButton) {
	        return nextButton.click();
	    });
	},
	gotoPrevPage: function () {
	    return this.evalTestAndWaitForEmber('gotoPrevPage()');
	},
	isAlertPresent: function () {
		return this.browser.alertText().then(function (text) {
			return true;
		}, function (err) {
			return false;
		});
	},
	assertCanPingElicitation: function () {
	    var self = this;
		return this.evalTest('ping("ploink")').then(function (response) {
			self.assert().equal("ping: ploink", response, "Couldn't ping EAT.Test.ping()");
		})
	},
	gotoNextPageIsAlertPresent: function () {
		var self = this;
		return this.gotoNextPageWithoutWaiting().then(function () {
		    return self.isAlertPresent();
		});
	},

	tryGoingToNextPageAssertAlert: function () {
		var self = this;
		return this.gotoNextPageIsAlertPresent().then(function (alertPresent) {
		    self.assert().ok(alertPresent, "Didn't warn before going to next page");
		    return self.browser.dismissAlert();
		});
	},

	goToNextPageAssertNoAlert: function () {
	    var self = this;
		return this.gotoNextPageIsAlertPresent().then(function (alertPresent) {
			self.assert().ok(!alertPresent, "Uhoh, an alert was produced going to next page");
		});
	},	
	clearElicitationData: function () {
	    return this.evalTestAndWaitForEmber('clearElicitationData()');
	},
	getWidgetID: function (widgetIndexOnPage) {
	    var self = this;
		return this.evalTest('getWidgetID(' + widgetIndexOnPage + ')').then(function (widgetID) {
			self.assert().ok(widgetID, "WidgetID is not blank");
			return widgetID;
		});
	},
	getWidgetData: function (widgetID) {
		return this.evalTest('getWidgetData("' + widgetID + '")').then(function (widgetDataJSON) {
			return JSON.parse(widgetDataJSON);
		});
	},
	assertWidgetDataEquals: function (widgetID, dataShouldBe) {
	    var self = this;
	    return this.getWidgetData(widgetID).then(function (widgetData) {
			self.assert().deepEqual(dataShouldBe, widgetData);
		})
	},
	assertWidgetDataNearlyEquals: function (widgetID, dataShouldBe, epsilon) {
	    var self = this;
	    return this.getWidgetData(widgetID).then(function (widgetData) {
	        self.deepEqualEpsilon(dataShouldBe, widgetData, epsilon);
	    })
	},
	dragElementBy: function (element, deltaX, deltaY, xOffset, yOffset) {
	    var browser = this.browser;

	    if (xOffset == undefined) xOffset = 3;
	    if (yOffset == undefined) yOffset = 3;

	    return browser.moveTo(element, xOffset, yOffset).then(function () {
            return browser.buttonDown();
	    }).then(function () {
	        return browser.moveTo(element, xOffset + deltaX, yOffset + deltaY);
        }).then(function () {
            return browser.buttonUp();
        });
	},
	deepEqualEpsilon: function (actual, expected, epsilon, message) {
	    var assert = this.assert();
	    function fail(a, b, c, d, e) {
	        assert.fail(a,b,c,d,e);
	    }
	    return deepEqualEpsilon.deepEqualEpsilon(actual, expected, epsilon, fail, message);
	},
	repeat: function (numRepeats, toRepeat) {
	    var toReturn = toRepeat;
	    for (var i = 0; i < numRepeats-1; i++)
	        toReturn += toRepeat;
	    return toReturn ;
	}
};



function testPage(startOnPage, testName, testFunction) {
    var testSuite = {
        setUp: function (cb) {
            var promise = setupSuite.call(this, startOnPage);
            return cb ? promise.then(cb, cb).done() : promise;
        },
        tearDown: function (cb) {
            if (cb) return cb();
        }
    }
    testSuite[testName] = function (test) {
        var self = this;

        try {
            var oldAssert = this.helper._assert;
            if (test) {
                this.helper._assert = test;
            }

            var promise = testFunction.call(this, test).fin(function () {
                self.helper._assert = oldAssert;
            });

            if (test) {
                return promise.then(function () {
                    test.done();
                }, function (err) {
                    test.done(err);
                }).done();
            } else {
                return promise;
            }
        } catch (e) {
            test.done(e);
        }
    }
    return testSuite;
}

exports.TestHelper = TestHelper;
exports.setupSuite = setupSuite;
exports.testPage = testPage;
exports.promise = Q;