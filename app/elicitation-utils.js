(function (window, G_vmlCanvasManager) {
    "use strict";

    var allPeriods = new RegExp('[.]', 'g');
    function escapeForEmberProperty(prop) {
        return prop.replace(allPeriods, '');
    }

    function outerXML(xmlNode) {
        try {
            // Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
            return (new XMLSerializer()).serializeToString(xmlNode);
        }
        catch (e) {
            try {
                // Internet Explorer.
                return xmlNode.xml;
            }
            catch (e) {
                //Other browsers without XML Serializer
                alert('Xmlserializer not supported');
            }
        }
        return false;
    }

    function innerXML(xmlNode) {
        var contents = "";
        xmlNode.contents().each(function () {
            contents += outerXML(this);
        });
        return contents;
    }

    function makeUUID () {
        return Math.floor(Math.random() * 1e10).toString();
    }

    var CurrentCollectionView = Ember.CollectionView.extend({
        showAllContent: false,
        currentContent: null,

        init: function () {
            this._super();
            this.updateCurrentContent();
        },
        updateCurrentContent: function () {
            var showAllContent = this.get('showAllContent');

            if (Ember.isNone(showAllContent) || !showAllContent) {
                var contents = this.get('content');
                var currentContent = this.get('currentContent');
                this.get('childViews').forEach(function (view, i) {
                    var isVisible = contents.objectAt(i) == currentContent;
                    view.set('isVisible', isVisible);
                });
            } else {
                this.get('childViews').forEach(function (view) {
                    view.set('isVisible', true);
                });
            }
        }.observes('currentContent', 'showAllContent', 'childViews.@each')
    });

    var DropDownMenuView = Ember.View.extend({
        downArrowButton: false,
        classNames: ["drop-down-menu"],
        layoutName: "drop-down-menu",
        didInsertElement: function () {
            var menu = this.$("ul").hide();
            var menuInitialized = false;

            var button = this.$(".button");

            if (this.get('downArrowButton')) {
                button.button({
                    text: false,
                    icons: {
                        primary: "ui-icon-triangle-1-s"
                    }
                });
            }
                    
            button.click(function () {
                if (menuInitialized) {
                    menu.menu("refresh")
                } else {
                    menu.menu();
                    menuInitialized = true;
                }
                menu.show().position({
                    my: "left top",
                    at: "left bottom",
                    of: this
                });
                $(document).one("click", function () {
                    Ember.run.next(function () {
                        menu.hide();
                    });
                });
                return false;
            });
        }
    });


    var ExpandingTextArea = Ember.TextArea.extend({
        didInsertElement: function () {
            this._super();
            this.$().textareaAutoExpand();
        }
    });

    // WARNING: too painful to include supplementary planes, these characters (0x10000 and higher) 
    // will be stripped by this function. See what you are missing (heiroglyphics, emoji, etc) at:
    // http://en.wikipedia.org/wiki/Plane_(Unicode)#Supplementary_Multilingual_Plane
    var NOT_SAFE_IN_XML_1_0 = /[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm;
    function sanitizeStringForXML(theString) {
        "use strict";
        return theString.replace(NOT_SAFE_IN_XML_1_0, '');
    }

    function removeXMLInvalidCharacters(node) {
        "use strict";

        if (node.attributes) {
            for (var i = 0; i < node.attributes.length; i++) {
                var attribute = node.attributes[i];
                if (attribute.nodeValue) {
                    attribute.nodeValue = sanitizeStringForXML(attribute.nodeValue);
                }
            }
        }
        if (node.childNodes) {
            for (var i = 0; i < node.childNodes.length; i++) {
                var childNode = node.childNodes[i];
                if (childNode.nodeType == 1 /* ELEMENT_NODE */) {
                    removeXMLInvalidCharacters(childNode);
                } else if (childNode.nodeType == 3 /* TEXT_NODE */) {
                    if (childNode.nodeValue) {
                        childNode.nodeValue = sanitizeStringForXML(childNode.nodeValue);
                    }
                }
            }
        }
    }

    function shuffleArray(array) {
        var tmp, current, top = array.length;

        if (top) while (--top) {
            current = Math.floor(Math.random() * (top + 1));
            tmp = array[current];
            array[current] = array[top];
            array[top] = tmp;
        }

        return array;
    }

    function toSigFig(n, numDigits) {
        return Ember.isNone(n) ? NaN : parseFloat(n.toPrecision(numDigits));
    }

    var hasExponent = /^(.+)(e[+-]*\d+)$/
    var onlyDigits = /\d/g;
    function countSigFigs(n) {
        var number = parseFloat(n);
        if (isNaN(number)) return 0;
        var string = number.toExponential().toString();
        var result = string.match(hasExponent);
        if (Ember.isNone(result)) {
            Ember.warn("Number didn't parse correctly in countSigFigs: " + n, !Ember.isNone(result));
            return n.toString().match(onlyDigits).length;
        } else {
            var number = result[1];
            return number.match(onlyDigits).length;
        }
    }

    // This annoying hack is required for IE8, because it doesn't property
    // initialize unknown DOM elements (like 'canvas') if they are created
    // using innerHTML (as EmberJS does) instead of createElement
    // so excanvas.js can't initialize them properly
    // use this on every emberjs managed excanvas you want to actually work
    function recreateCanvasElement(elem) {
        elem = $(elem);
        var canvas = document.createElement("canvas");
        var $canvas = $(canvas);
        $canvas.attr("id", elem.attr("id"));
        elem.after($canvas);
        elem.remove();
        return canvas;
    }

    // EXPORTS
    window.ElicitationUtils = {
        innerXML: innerXML,
        toSigFig: toSigFig,
        countSigFigs: countSigFigs,
        outerXML: outerXML,
        makeUUID: makeUUID,
        CurrentCollectionView: CurrentCollectionView,
        ExpandingTextArea: ExpandingTextArea,
        DropDownMenuView: DropDownMenuView,
        sanitizeStringForXML: sanitizeStringForXML,
        removeXMLInvalidCharacters: removeXMLInvalidCharacters,
        shuffleArray: shuffleArray,
        recreateCanvasElement: recreateCanvasElement,
        escapeForEmberProperty: escapeForEmberProperty
    };
})(window);

(function (namespace, Ember) {
    "use strict;"


    function mixinProperties(to, from) {
        for (var key in from) {
            if (from.hasOwnProperty(key)) {
                to[key] = from[key];
            }
        }
    }

    namespace.ConditionalBinding = function () {
        Ember.Binding.apply(this, arguments);
    };
    namespace.ConditionalBinding.prototype = new Ember.Binding();
    namespace.ConditionalBinding.constructor = ConditionalBinding;
    namespace.ConditionalBinding.from = Ember.Binding.from;
    namespace.ConditionalBinding.to = Ember.Binding.to;

    namespace.ConditionalBinding.prototype.copy = function () {
        var copy = new ConditionalBinding(this._to, this._from);
        if (this._oneWay) { copy._oneWay = true; }
        copy._pauseIfTruePath = this._pauseIfTruePath;
        copy._directionToPause = this._directionToPause;
        copy._directionToSyncOnResume = this._directionToSyncOnResume;

        return copy;
    }

    namespace.ConditionalBinding.prototype.currentlyPaused = function (target) {
        return !Ember.isNone(this._pauseIfTruePath) && target.get(this._pauseIfTruePath);
    }

    namespace.ConditionalBinding.prototype.currentlyPausedFrom = function (target) {
        return (this._directionToPause == "from" || this._directionToPause == "both")
            && this.currentlyPaused(target);
    }

    namespace.ConditionalBinding.prototype.currentlyPausedTo = function (target) {
        return (this._directionToPause == "to" || this._directionToPause == "both")
            && this.currentlyPaused(target);
    }

    namespace.ConditionalBinding.prototype.connect = function (obj) {
        var pauseIfTruePath = this._pauseIfTruePath;
        if (!Ember.isNone(pauseIfTruePath)) {
            Ember.addObserver(obj, pauseIfTruePath, this, this.pauseDidChange);
        }
        return Ember.Binding.prototype.connect.apply(this, arguments);
    }

    namespace.ConditionalBinding.prototype.disconnect = function (obj) {
        var pauseIfTruePath = this._pauseIfTruePath;
        if (!Ember.isNone(pauseIfTrue)) {
            Ember.removeObserver(obj, pauseIfTruePath, this, this.pauseDidChange);
        }
        return Ember.Binding.prototype.disconnect.apply(this, arguments);
    }

    namespace.ConditionalBinding.prototype.pauseDidChange = function (target) {
        if (!this.currentlyPaused(target)) {
            var directionToSync = this._directionToSyncOnResume;
            if (directionToSync == "latest") {
                directionToSync = this._latestSyncDirection;
            }

            if (directionToSync == "from") {
                Ember.Binding.prototype.fromDidChange.apply(this, arguments);
            } else if (directionToSync == "to") {
                Ember.Binding.prototype.toDidChange.apply(this, arguments);
            }
        }
    }

    namespace.ConditionalBinding.prototype.fromDidChange = function (target) {
        if (!this.currentlyPausedFrom(target)) {
            return Ember.Binding.prototype.fromDidChange.apply(this, arguments);
        } else {
            this._latestSyncDirection = "from";
        }
    }
    namespace.ConditionalBinding.prototype.toDidChange = function (target) {
        if (!this.currentlyPausedTo(target)) {
            Ember.Binding.prototype.toDidChange.apply(this, arguments);
        } else {
            this._latestSyncDirection = "to";
        }
    }

    namespace.ConditionalBinding.prototype.pauseIfTrue = function (path) {
        this._pauseIfTruePath = path;
        this._directionToPause = "both";
        this._directionToSyncOnResume = "latest";
        return this;
    }

    namespace.ConditionalBinding.prototype.onlyPause = function (directionToPause) {
        this._directionToPause = directionToPause;
        return this;
    }

    namespace.ConditionalBinding.prototype.onResumeSetBothTo = function (directionToSyncOnResume) {
        this._directionToSyncOnResume = directionToSyncOnResume;
        return this;
    }

})(window, Ember);

function testDefaultArgs() {
    var from = Ember.Object.create({
        value: 0
    });

    var to = Ember.Object.create({
        from: from,
        valueBinding: ConditionalBinding
            .from('from.value')
            // Default:
            // .onResumeSethBothTo('lastest')
            .pauseIfTrue('pausingProperty'),
        pausingProperty: false
    });

    Ember.assert("", from.get('value') == 0);
    Ember.assert("", to.get('value') == 0);

    Ember.run(function () {
        from.set('value', 1);
    });
    Ember.assert("", from.get('value') == 1);
    Ember.assert("", to.get('value') == 1);

    Ember.run(function () {
        to.set('value', 2);
    });
    Ember.assert("", from.get('value') == 2);
    Ember.assert("", to.get('value') == 2);

    // PAUSE BINDING!
    Ember.run(function () {
        to.set('pausingProperty', true);
    });
    Ember.assert("", from.get('value') == 2);
    Ember.assert("", to.get('value') == 2);

    Ember.run(function () {
        from.set('value', 3);
    });
    Ember.assert("", from.get('value') == 3);
    Ember.assert("Target shouldn't have updated from", to.get('value') == 2);


    Ember.run(function () {
        to.set('value', 4);
    });
    Ember.assert("Source shouldn't have updated from to", from.get('value') == 3);
    Ember.assert("", to.get('value') == 4);

    Ember.run(function () {
        from.set('value', 5);
    });
    Ember.assert("", from.get('value') == 5);
    Ember.assert("", to.get('value') == 4);

    // RESUME BINDING!
    Ember.run(function () {
        to.set('pausingProperty', false);
    });
    Ember.assert("", from.get('value') == 5);
    Ember.assert("From was set latest, so to should be overwritten by sync", to.get('value') == 5);

    Ember.run(function () {
        from.set('value', 6);
    });
    Ember.assert("", from.get('value') == 6);
    Ember.assert("", to.get('value') == 6);

    Ember.run(function () {
        from.set('value', 7);
    });
    Ember.assert("", from.get('value') == 7);
    Ember.assert("", to.get('value') == 7);
}

function testOnlyPauseFromResumeFrom() {
    var from = Ember.Object.create({
        value: 0
    });

    var to = Ember.Object.create({
        from: from,
        valueBinding: ConditionalBinding
            .from('from.value')
            .pauseIfTrue('pausingProperty')
            .onlyPause('from')
            .onResumeSetBothTo('from'),
        pausingProperty: false
    });

    Ember.run(function () {
        to.set('value', 2);
    });
    Ember.assert("", from.get('value') == 2);
    Ember.assert("", to.get('value') == 2);

    // PAUSE BINDING!
    Ember.run(function () {
        to.set('pausingProperty', true);
    });
    Ember.assert("", from.get('value') == 2);
    Ember.assert("", to.get('value') == 2);

    Ember.run(function () {
        from.set('value', 3);
    });
    Ember.assert("", from.get('value') == 3);
    Ember.assert("Target shouldn't have updated from", to.get('value') == 2);


    Ember.run(function () {
        to.set('value', 4);
    });
    Ember.assert("Source should update from the to though", from.get('value') == 4);
    Ember.assert("", to.get('value') == 4);

    Ember.run(function () {
        from.set('value', 5);
    });
    Ember.assert("", from.get('value') == 5);
    Ember.assert("", to.get('value') == 4);

    // RESUME BINDING!
    Ember.run(function () {
        to.set('pausingProperty', false);
    });
    Ember.assert("", from.get('value') == 5);
    Ember.assert("Target should sync from the from on resume", to.get('value') == 5);

    Ember.run(function () {
        from.set('value', 6);
    });
    Ember.assert("", from.get('value') == 6);
    Ember.assert("", to.get('value') == 6);
}

function testOnlyPauseFromResumeTo() {
    var from = Ember.Object.create({
        value: 0
    });

    var to = Ember.Object.create({
        from: from,
        valueBinding: ConditionalBinding
            .from('from.value')
            .pauseIfTrue('pausingProperty')
            .onlyPause('from')
            .onResumeSetBothTo('to'),
        pausingProperty: false
    });

    Ember.run(function () {
        to.set('value', 2);
    });
    Ember.assert("", from.get('value') == 2);
    Ember.assert("", to.get('value') == 2);

    // PAUSE BINDING!
    Ember.run(function () {
        to.set('pausingProperty', true);
    });
    Ember.assert("", from.get('value') == 2);
    Ember.assert("", to.get('value') == 2);

    Ember.run(function () {
        from.set('value', 3);
    });
    Ember.assert("", from.get('value') == 3);
    Ember.assert("Target shouldn't have updated from", to.get('value') == 2);


    Ember.run(function () {
        to.set('value', 4);
    });
    Ember.assert("Source should update from the to though", from.get('value') == 4);
    Ember.assert("", to.get('value') == 4);

    Ember.run(function () {
        from.set('value', 5);
    });
    Ember.assert("", from.get('value') == 5);
    Ember.assert("", to.get('value') == 4);

    // RESUME BINDING!
    Ember.run(function () {
        to.set('pausingProperty', false);
    });
    Ember.assert("Source should sync from the to on resume", from.get('value') == 4);
    Ember.assert("Target should sync from the from on resume", to.get('value') == 4);

    Ember.run(function () {
        from.set('value', 6);
    });
    Ember.assert("", from.get('value') == 6);
    Ember.assert("", to.get('value') == 6);
}

function testOnlyPauseToResumeFrom() {
    var from = Ember.Object.create({
        value: 0
    });

    var to = Ember.Object.create({
        from: from,
        valueBinding: ConditionalBinding
            .from('from.value')
            .pauseIfTrue('pausingProperty')
            .onlyPause('to')
            .onResumeSetBothTo('from'),
        pausingProperty: false
    });

    Ember.run(function () {
        to.set('value', 2);
    });
    Ember.assert("", from.get('value') == 2);
    Ember.assert("", to.get('value') == 2);

    // PAUSE BINDING!
    Ember.run(function () {
        to.set('pausingProperty', true);
    });
    Ember.assert("", from.get('value') == 2);
    Ember.assert("", to.get('value') == 2);

    Ember.run(function () {
        from.set('value', 3);
    });
    Ember.assert("", from.get('value') == 3);
    Ember.assert("Target should update from from", to.get('value') == 3);


    Ember.run(function () {
        to.set('value', 4);
    });
    Ember.assert("Source shouldn't have updated from the to though", from.get('value') == 3);
    Ember.assert("", to.get('value') == 4);

    // RESUME BINDING!
    Ember.run(function () {
        to.set('pausingProperty', false);
    });
    Ember.assert("", from.get('value') == 3);
    Ember.assert("To should sync from the from on resume", to.get('value') == 3);

    Ember.run(function () {
        from.set('value', 6);
    });
    Ember.assert("", from.get('value') == 6);
    Ember.assert("", to.get('value') == 6);
}

function test() {
    testDefaultArgs();
    testOnlyPauseFromResumeFrom();
    testOnlyPauseFromResumeTo();
    testOnlyPauseToResumeFrom();
}

test();

(function (namespace, Ember) {
    "use strict;"

    var pausibleAlias = function (dependentKey, pauseConditionPath) {
        var wasPaused = false;
        var wasDependentValue = undefined;
        var thisValueChangedLast = undefined;
        var thisValue = undefined;

        var cp = new Ember.ComputedProperty(function (key, value) {
            var paused = this.get(pauseConditionPath);

            var dependentValue = this.get(dependentKey);
            var dependentValueChanged = dependentValue !== wasDependentValue;
            wasDependentValue = dependentValue;
            if (dependentValueChanged) {
                thisValueChangedLast = false;
            }

            var weJustUnpaused = (wasPaused && !paused);
            wasPaused = paused;

            // Apply paused changes to value
            if (weJustUnpaused && thisValueChangedLast) {
                this.set(dependentKey, thisValue);
            }

            // SET
            if (arguments.length > 1) {
                thisValueChangedLast = true;
                thisValue = value;

                if (!paused) {
                    this.set(dependentKey, value);
                }
            }

            if (!paused) {
                thisValue = this.get(dependentKey);
            }
            return thisValue;
        });

        function setup (obj, key) {
            console.log("SETUP ALIAS", obj, key);
        }
        function destroy (obj, key) {
            console.log("DESTROY ALIAS", obj, key);
        }
        cp.meta({
            pausibleAlias: true,
            setupPausibleAlias: setup,
            destroyPausibleAlias: destroy
        });

        cp.property(dependentKey, pauseConditionPath);

        return cp;
    }

    var HasPausibleAlias = Ember.Mixin.create({
        _eachPausibleAlias: function (callback) {
            var self = this;
            this.constructor.eachComputedProperty(function (name, meta) {
                if (meta.pausibleAlias) {
                    callback.call(self, name, meta);
                }
            });
        },
        init: function () {
            this._super();
            this._eachPausibleAlias(function (name, meta) {
                meta.setupPausibleAlias(this, name);
            });
        },
        destroy: function () {
            this._super();
            this._eachPausibleAlias(function (name, meta) {
                meta.destroyPausibleAlias(this, name);
            });
        }
    });

    function testGetOrder() {
        function setPausedAliasWithFinalGet(doAFinalGet) {
            var o = Ember.Object.extend({
                paused: false,
                dependentValue: 'initial value',
                aliasedValue: pausibleAlias('dependentValue', 'paused')
            }).create();

            Ember.run(function () {
                o.set('paused', true);
                o.set('aliasedValue', 'new value');
                o.set('paused', false);
                if (doAFinalGet) {
                    // notices pause has changed and finally does the
                    // deferred o.set('aliasedValue')
                    o.get('aliasedValue');
                }
            });
            return o.get('dependentValue');
        }

        Ember.assert("Gets shouldn't affect state",
            setPausedAliasWithFinalGet(true) == setPausedAliasWithFinalGet(false));
        // FAILS: we can't find out that paused changed until a get/set is called
        // on the aliasedValue, so the state of the dependent key depends on
        // whether and when the lazy-computed value is re-evaluated
    }

    function testBigBoy() {
        var from = Ember.Object.create({ value: 0 });
        window.To = Ember.Object.extend({
            paused: false,
            from: from,
            value: pausibleAlias('from.value', 'paused')
        });

        var to = To.create({ lovable: "YES" });

        Ember.assert("", from.get('value') == 0);
        Ember.assert("", to.get('value') == 0);

        console.log("from.value=1");
        Ember.run(function () {
            from.set('value', 1);
        });
        Ember.assert("", from.get('value') == 1);
        Ember.assert("", to.get('value') == 1);

        console.log("to.value=2");
        Ember.run(function () {
            to.set('value', 2);
        });
        Ember.assert("", from.get('value') == 2);
        Ember.assert("", to.get('value') == 2);

        console.log("to.paused=true");
        Ember.run(function () {
            to.set('paused', true);
            to.set('value', 2);
            from.set('value', 3);
            to.set('paused', false);
        });
        Ember.assert("Last value set should be 3", from.get('value') == 3);
        Ember.assert("", to.get('value') == 3);

        console.log("\nStarting run...");
        Ember.run(function () {
            to.set('paused', true);
            console.log("from.value=1");
            from.set('value', 1);
            console.log("to.value=2");
            to.set('value', 2);
            console.log("to.paused=false");
            to.set('paused', false);
        });
        Ember.assert("Last set should win", to.get('value') == 2);
        Ember.assert("Last set should win", from.get('value') == 2);


        Ember.run(function () {
            to.set('paused', true);
            to.set('value', 6);
            to.set('paused', false);
            from.set('value', 7);
        });
        Ember.assert("", from.get('value') == 7);
        Ember.assert("", to.get('value') == 7);

        Ember.run(function () {
            to.set('paused', true);
            to.set('value', 8);
        });
        Ember.assert("", from.get('value') == 7);
        Ember.assert("", to.get('value') == 8);

        Ember.run(function () {
            to.set('paused', false);
        });
        Ember.assert("", to.get('value') == 8);
        Ember.assert("", from.get('value') == 8);
    }

    // testGetOrder();
    // testBigBoy();

    namespace.pausibleAlias = pausibleAlias;
})(ElicitationUtils, Ember);

// Defined out here because 'with' isn't allowed in strict mode
ElicitationUtils.evalInScope = function (toEval, scope) {
    with (scope) {
        return eval(toEval);
    }
}