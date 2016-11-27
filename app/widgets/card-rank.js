import Ember from 'ember'
import EAT from 'eat/eat'
import ElicitationUtils from 'eat/elicitation-utils'

import { WidgetResultViewRegistry } from 'eat/widget-registry'

WidgetResultViewRegistry.CardRank = EAT.WidgetResultsView.extend({
    templateName: "card-rank-results",
    classNames: ["widget-results", "card-rank"],
    content: undefined, // An EAT.WidgetResultsData
    cardTallies: function () {
        var allExpertData = this.get('content.perExpertData');

        var cards = Ember.Set.create();
        var containers = Ember.Set.create();
        var cardsToContainersTally = {};

        var isARadioButton = /_radio$/;
        allExpertData.forEach(function (perExpertData) {
            var data = perExpertData.data;
            for (var card in data) {
                if (!data.hasOwnProperty(card)) continue;

                if (card === "metadata") continue;

                /* If it ends in _radio, its not actually a card. Sort of nasty in-band signallying
                   created by historical data-compat reasons */
                if (card.match(isARadioButton)) continue;

                var container = data[card];
                cards.add(card);
                containers.add(container);

                if (!cardsToContainersTally.hasOwnProperty(card)) cardsToContainersTally[card] = {};
                var tally = cardsToContainersTally[card][container];
                if (Ember.isNone(tally)) tally = 0;
                tally += 1;

                cardsToContainersTally[card][container] = tally;
            }
        });

        var containersSorted = containers.toArray().sort(function (one, two) {
            var oneInt = parseInt(one);
            var twoInt = parseInt(two);
            if (isNaN(oneInt)) {
                if (isNaN(twoInt)) {
                    return one > two;
                } else {
                    return true;
                }
            } else {
                if (isNaN(twoInt)) {
                    return false;
                } else {
                    return oneInt > twoInt;
                }
            }
        });
        var cardsSorted = cards.toArray().sort();

        var table = [];
        cardsSorted.forEach(function (card) {
            var row = [{ isACard: true, card: card }];
            containersSorted.forEach(function (container) {
                var tally = cardsToContainersTally[card][container];
                if (Ember.isNone(tally)) tally = 0;
                row.push({ isACard: false, tally: tally, title: tally.toString() + " experts ranked this card as #" + container });
            });
            table.push(row);
        });

        return Ember.Object.create({
            columnLabels: containersSorted,
            rowLabels: cardsSorted,
            rows: table
        });
    }.property('content.perExpertData')
});

EAT.CardRankCard = Ember.View.extend({
    templateName: 'card-rank-card',
    content: undefined,
    didInsertElement: function () {
        this._super();
        var draggableParent = this.$().closest(".widget.card-rank").find(".draggable-parent");
        var card = this.$().find(".card");
        card.draggable({
            revert: 'invalid',
            helper: 'clone',
            appendTo: draggableParent
        });

        // Don't allow the text of non-writein cards to be selected, it interferes w/ dragging
        // BUT, if we disableSelection on writeins, it breaks writein textareas on Firefox (they don't allow input)
        if (!this.get('content.writein')) {
            card.disableSelection();
        }
    }
});


EAT.CardRankContainer = Ember.View.extend({
    templateName: 'card-rank-container',
    content: undefined,
    attributeBindings: ["dataKey"],
    dataKey: function () {
        // this isn't a dataKeyBinding because IE8 bindings are buggy :-(
        return this.get('content.dataKey');
    }.property('content.dataKey'),
    classNames: ["container", "clearfix"],
    classNameBindings: ["content.allowOnlyOneCard", "content.empty", "content.initial", "content.optional"],
    didInsertElement: function () {
        this._super();
        var container = this;
        this.$().droppable({
            hoverClass: 'drophover',
            accept: function (event, ui) {
                return container.get('content.empty') || !container.get('content.allowOnlyOneCard');
            },
            drop: function (event, ui) {
                var cardDOM = ui.draggable;
                var card = Ember.View.views[cardDOM.closest(".ember-view").attr('id')].get('content');
                var from = Ember.View.views[cardDOM.closest(".container.ember-view").attr('id')].get('content.cards');
                var to = container.get('content.cards');
                from.removeObject(card);
                to.pushObject(card);
            }
        });
    }
})

var CardModel = EAT.WidgetDefinition.extend({
    label: "untitled card",

    // FIXME: dataKeyBinding: 'label', was producing underscored results, it was icky
    dataKey: function () {
        return this.get("label").replace(/\./g, "");
    }.property('label'),
    definition: undefined,
    hasDefinition: function () {
        var definition = this.get('definition');
        return !(Ember.isNone(definition) || definition.length < 1);
    }.property('definition'),
    popup: function () {
        if (this.get('hasDefinition')) {
            return this.get('definition');
        } else {
            return null;
        }
    }.property('label', 'definition'),
    writein: false
});

var multipleChoiceNum = 0;
var ContainerModel = Ember.ArrayController.extend({
    onInit: function () {
        //this._super();
        this.set('cards', Ember.A(this.get('cards')));
        this.set('multipleChoiceNum', multipleChoiceNum++);
    }.on('init'),
    initial: false,
    optional: false,
    allowOnlyOneCard: true,
    empty: function () {
        return this.get('cards.length') < 1;
    }.property('cards.length'),
    dataKey: undefined,
    cards: undefined,
    _stateSkipKeys: [ 'cards' ]
});

var CardRankModel = EAT.WidgetDefinition.extend({
    radioButtonsAreOptional: false,
    topLabel: "Biggest Item",
    bottomLabel: "Smallest Item",
    radioButtonLabel: "The value or importance of this factor is expected to:",
    cards: null,
    writeInCards: null,
    numCards: function () {
        return this.get('cards.length') + this.get('writeInCards.length');
    }.property('cards.length', 'writeInCards.length'),
    enableRadioButtonsOnDropTargets: function () {
        var radioButtons = this.get('radioButtons');
        return radioButtons && radioButtons.get('length') > 0;
    }.property('radioButtons.length'),
    numCardsToAccept: "",
    acceptMoreThanNumCards: true,
    allowEqualRanking: false,
    disallowEqualRanking: function () {
        return !this.get('allowEqualRanking');
    }.property('allowEqualRanking'),
    onInit: function () {
        //this._super();
        this.set('containers', Ember.A(this.get('containers')));
        this.set('cards', Ember.A());
        this.set('writeInCards', Ember.A());
    }.on('init'),
    initialCardsContainer: function () {
        var cards = this.get('cards').slice();
        var shuffleCards = this.get('randomizeCardOrder');
        if (shuffleCards) {
            cards = ElicitationUtils.shuffleArray(cards);
        }

        return ContainerModel.create({
            cards: cards,
            allowOnlyOneCard: false,
            initial: true
        });
    }.property('cards.@each', 'randomizeCardOrder'),
    unusedCards: function () {
        var usedCards = Ember.Set.create();
        this.get('containers').forEach(function (container) {
            container.get('cards').forEach(function (card) {
                usedCards.addObject(card);
            });
        });

        var unusedCards = [];
        this.get('cards').forEach(function (card) {
            if (!usedCards.contains(card)) {
                unusedCards.push(card);
            }
        });
        return unusedCards;
    }.property('cards', 'containers.@each.@each'),
    containers: undefined,
    numContainers: function () {
        var numCardsToAccept = parseInt(this.get('numCardsToAccept'));
        var acceptMoreThanNumCards = this.get('acceptMoreThanNumCards');
        if (numCardsToAccept === undefined || isNaN(numCardsToAccept) || numCardsToAccept < 1 || acceptMoreThanNumCards) {
            return this.get('numCards');
        } else {
            return numCardsToAccept;
        }
    }.property('numCards', 'numCardsToAccept', 'acceptMoreThanNumCards'),
    createAndDestroyContainersAsNeeded: function () {
        var numContainers = this.get('numContainers');
        var containers = this.get('containers');
        var numCurrentContainers = this.get('containers.length');

        if (numCurrentContainers > numContainers) {
            for (var i = numCurrentContainers; i > numContainers; i--) {
                containers.popObject();
            }
        } else if (numCurrentContainers < numContainers) {
            for (var i = numCurrentContainers; i < numContainers; i++) {
                containers.pushObject(ContainerModel.create({
                    dataKey: i + 1,
                    cardRank: this,
                    allowOnlyOneCardBinding: 'cardRank.disallowEqualRanking'
                }));
            }
        }

        // Now mark containers as optional (or not)
        var numRequiredContainers = parseInt(this.get('numCardsToAccept'));
        if (Ember.isNone(numRequiredContainers)) numRequiredContainers = numContainers;
        var acceptMoreThanNumCards = this.get('acceptMoreThanNumCards');
        containers.forEach(function (container, i) {
            var optional = i >= numRequiredContainers;
            container.set('optional', optional);
        });
    }.observes('numContainers', 'numCardsToAccept', 'acceptMoreThanNumCards')
});

EAT.Widget.register('card-rank', {
    prettyName: "Card Rank",
    templateName: 'card-rank',
    widgetResults: EAT.WidgetResultsViews.CardRank,
    definitionSchema: {
        model: CardRankModel,
        label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
        cards: {
            type: "HasMany",
            prettyName: 'Card',
            emphasizeWhenEmpty: true,
            accessor: EAT.WidgetDefinition.HasMany('card', {
                model: CardModel,
                label: { accessor: EAT.WidgetDefinition.Contents() },
                definition: { accessor: EAT.WidgetDefinition.Attr("definition"), prettyName: "Definition" }
            })
        },
        randomizeCardOrder: {
            type: "Boolean",
            prettyName: 'Randomize Card Order',
            accessor: EAT.WidgetDefinition.Attr('randomize-card-order'),
            helpText: 'Shuffle the cards for each person viewing the elicitation'
        },
        topLabel: { accessor: EAT.WidgetDefinition.Attr("top-label"), prettyName: "Top Label" },
        bottomLabel: { accessor: EAT.WidgetDefinition.Attr("bottom-label"), prettyName: "Bottom Label" },
        allowWriteInCards: {
            accessor: EAT.WidgetDefinition.Attr("allow-writeins"),
            prettyName: "Allow Write-In Cards",
            helpText: "Allow experts to add their own cards to the set being ranked.",
            type: "Boolean"
        },
        numCardsToAccept: {
            accessor: EAT.WidgetDefinition.Attr("num-containers"),
            prettyName: "Number of Rankings Requested",
            helpText: "Number of cards experts are asked to rank. If this is blank, the number of required cards will equal the number of defined cards."
        },
        acceptMoreThanNumCards: {
            accessor: EAT.WidgetDefinition.Attr("allow-more-than-num-containers"),
            prettyName: "Allow optional rankings beyond requested",
            type: "Boolean"
        },
        allowEqualRanking: {
            accessor: EAT.WidgetDefinition.Attr("allow-equal-ranking"),
            prettyName: "Allow Equal Ranking of Cards",
            helpText: "Allow experts to rank multiple cards as equal (i.e. allow more than one card in each drop target).",
            type: "Boolean"
        },
        radioButtons: {
            type: "HasMany",
            prettyName: 'Radio Button',
            accessor: EAT.WidgetDefinition.HasMany('radio-button', {
                model: EAT.WidgetDefinition.extend({
                    label: "Decrease"
                }),
                label: { accessor: EAT.WidgetDefinition.Contents() }
            })
        },
        radioButtonLabel: { accessor: EAT.WidgetDefinition.ChildNode("radio-button-label"), prettyName: "Header for Radio Buttons", type: "Text" },
        radioButtonsAreOptional: {
            accessor: EAT.WidgetDefinition.Attr("radio-buttons-are-optional"),
            prettyName: "Radio Buttons Are Optional",
            helpText: "Don't harrass experts if they don't fill in a radio buttonn",
            type: "Boolean"
        }
    },
    actions: {
        addAWriteInCard: function () {
            this.appendWriteInCard();
        }
    },
    appendWriteInCard: function (label) {
        label = label ? label : "";
        var card = CardModel.create({
            label: label,
            writein: true
        });
        this.get('definition.initialCardsContainer.cards').pushObject(card);
        this.get('definition.writeInCards').pushObject(card);
        return card;
    },
    rerenderIfCardsChange: function () {
        this.rerender();
    }.observes('definition.cards.@each', 'definition.containers.@each'),
    serializeData: function (data, errors) {
        // FIXME: now that we've moved away from DOM munging to a model-based DnD,
        // we should really retrieve this stuff from the Definition Model rather
        // than by probing the DOM

        var widget = this.$();

        var numCardsToAccept = parseInt(this.get('definition.numCardsToAccept'));
        if (isNaN(numCardsToAccept) || numCardsToAccept < 1) {
            if (widget.find(".container.initial .card").length) {
                errors.pushObject("One or more cards haven't been used");
            }
        } else {
            var numCardsUsed = widget.find(".container").not(".initial").find(".card").length;
            if (numCardsUsed < numCardsToAccept) {
                errors.pushObject("Expected more than " + numCardsToAccept + " cards to be used, but only " + numCardsUsed + " cards were used.");
            }
        }

        var storeRadioButtons = this.get('definition.enableRadioButtonsOnDropTargets');

        var aRadioButtonWasntSet = false;
        widget.find(".card").each(function () {
            var card = $(this);
            var container = card.closest(".container");

            var cardDataKey = ElicitationUtils.escapeForEmberProperty(card.attr('dataKey'));
            var containerDataKey = container.attr('dataKey');

            data.set(cardDataKey, containerDataKey);

            if (storeRadioButtons && !container.hasClass("initial")) {
                var selectedRadio = card.closest("tr").find("input[type='radio']:checked");
                if (selectedRadio.length == 0) {
                    aRadioButtonWasntSet = true;
                }
                var key = cardDataKey + "_radio";
                data.set(key, selectedRadio.val());
            }
        });

        if (aRadioButtonWasntSet && !this.get('definition.radioButtonsAreOptional')) {
            errors.pushObject("One or more radio buttons weren't set");
        }
    },
    resumeFromSerializedData: function (serializedData) {
        // TODO: CAVEAT!!!!
        // this assumes starting from a BLANK card rank. It cannot work on a pre-used
        // card rank, because it assumes all cards start in the initialContainer.
        // to fix this, we'd need to look for cards rather than just removeObject()
        // them from the intiialCardsContainer


        var storeRadioButtons = this.get('definition.enableRadioButtonsOnDropTargets');

        function isRadioButtonKey(k) {
            return k.slice(-6) == "_radio";
        }

        var keys = Ember.keys(serializedData).filter(function (key) { return key != "metadata"; });


        var cardNameToCard = {};
        this.get('definition.cards.content').forEach(function (card) {
            var cardName = ElicitationUtils.escapeForEmberProperty(card.get('dataKey'));
            cardNameToCard[cardName] = card;
        });

        var containerNameToContainer = {};
        this.get('definition.containers').forEach(function (container) {
            containerNameToContainer[container.get('dataKey')] = container;
        });

        console.log("cardNameToCard: ", cardNameToCard);
        console.log("containerNameToContainer: ", containerNameToContainer);
        var initialCardsContainer = this.get('definition.initialCardsContainer');

        // Process cards first...
        keys.filter(function (key) {
            return !isRadioButtonKey(key);
        }).forEach(function (cardName) {
            var card = cardNameToCard[cardName];

            if (Ember.isNone(card)) {
                // no card found... must be a writein card....
                console.log("Creating a write-in card for ", cardName);
                card = this.appendWriteInCard(cardName);
                cardNameToCard[cardName] = card;
            }

            var containerName = Ember.get(serializedData, cardName);
            var container = containerNameToContainer[containerName];

            // TODO: don't assume they're in the initialCardsContainer, look
            // for cards in ANY container and remove them
            initialCardsContainer.get('cards').removeObject(card);

            container.get('cards').pushObject(card);
        }.bind(this));

        if (storeRadioButtons) {
            keys.filter(isRadioButtonKey)
            .forEach(function (radioButtonName) {
                var cardName = radioButtonName.slice(0, -6);
                var card = cardNameToCard[cardName];

                var radioButtonVal = Ember.get(serializedData, radioButtonName);

                var cardDataKey = card.get('dataKey');
                function setRadioButtonState() {
                    var cardDOM = $(".card").toArray().find(function (cardDOM) {
                        return $(cardDOM).attr("dataKey") === cardDataKey;
                    })


                    var radioButton = $(cardDOM)
                        .closest("tr")
                        .find("input[type='radio']")
                        .filter("[value='" + radioButtonVal + "']");
                    radioButton.prop('checked', radioButtonVal);
                }

                // Ugh, this is messy... we have to wait for the DOM changes we made above
                // to propogate and re-render before we can look through the DOM and set the radio keys
                window.setTimeout(setRadioButtonState, 250);
            });
        }
    }
});
