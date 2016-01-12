var testHelper = require('../lib/test-helper');

exports.test = testHelper.testPage('card-rank', 'card-rank', function (test) {
    var self = this;
    var helper = this.helper;

    function getCards() {
        return helper.getFirstWidgetOnCurrentPage().then(function (widget) {
            return widget.elementsByCssSelector(".card").then(function (cards) {
                var cardMap = {};

                return testHelper.promise.all(cards.map(function (card) {
                    return card.text().then(function (cardTitle) {
                        // Firefox and Chrome don't include textarea element text in text(), but IE does :-P
                        if (cardTitle == '') cardTitle = "Hello World!";
                        cardMap[cardTitle] = card;
                    });
                })).then(function () {
                    return cardMap;
                });
            });
        });
    }

    function addWriteInCard(cardName) {
        return helper.getFirstWidgetOnCurrentPage().then(function (widget) {
            return widget.elementByCssSelector("input.add-writein-card").then(function (button) {
                return button.click();
            }).then(function () {
                return helper.waitForEmber();
            }).then(function () {
                return widget.elementsByCssSelector(".card textarea").then(function (writeins) {
                    var writein = writeins[writeins.length - 1];
                    return writein.click().then(function () {
                        return writein.type(cardName);
                    });
                });
            });
        });
    }

    function dragCardToTarget(card, dropTargetIndex) {
        var browser = helper.browser;

        var selector = helper.CURRENT_PAGE_SELECTOR + " .widget .drop-targets .container";

        return helper.$N(selector, dropTargetIndex).then(function (dropTarget) {
            return browser.moveTo(card, 5, 5).then(function () {
                return browser.buttonDown();
            }).then(function () {
                return browser.getLocation(dropTarget);
            }).then(function (location) {
                console.log("The location is: ", location);
                return browser.moveTo(dropTarget, 5, 5);
            }).then(function () {
                return browser.buttonUp();
            });
        });
    }

    return helper.tryGoingToNextPageAssertAlert()
    .then(function () {
        return getCards();
    }).then(function (cards) {
        return dragCardToTarget(cards["Easy access to laundry"], 0).then(function () {
            return helper.tryGoingToNextPageAssertAlert();
        }).then(function () {
            return dragCardToTarget(cards["Fun"], 1);
        }).then(function () {
            return helper.goToNextPageAssertNoAlert();
        }).then(function () {
            return helper.assertWidgetDataEquals(self.widgetID, {
                "Easy access to laundry": 1,
                "Fun": 2,
                metadata: {}
            });
        });
    }).then(function () {
        return helper.gotoPrevPage();
    }).then(function () {
        return addWriteInCard("Hello World!");
    }).then(function () {
        return getCards();
    }).then(function (cards) {
        return dragCardToTarget(cards["Easy access to laundry"], 2)
        .then(function () {
            return dragCardToTarget(cards["Fun"], 0);
        }).then(function () {
            return dragCardToTarget(cards["Recognition"], 1);
        }).then(function () {
            return dragCardToTarget(cards["Personal Growth"], 4);
        }).then(function () {
            return dragCardToTarget(cards["Hello World!"], 3);
        }).then(function () {
            return helper.goToNextPageAssertNoAlert();
        }).then(function () {
            return helper.assertWidgetDataEquals(self.widgetID, {
                "Fun": 1,
                "Recognition": 2,
                "Easy access to laundry": 3,
                "Hello World!": 4,
                "Personal Growth": 5,
                metadata: {}
            });
        });
    });
});