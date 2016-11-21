webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);

	__webpack_require__(2);

	__webpack_require__(29);

	__webpack_require__(30);

	__webpack_require__(31);

	__webpack_require__(32);

	__webpack_require__(33);

	__webpack_require__(34);

	__webpack_require__(35);

	__webpack_require__(36);

	__webpack_require__(37);

	__webpack_require__(38);

	__webpack_require__(39);

	__webpack_require__(40);

	__webpack_require__(41);

	__webpack_require__(42);

	__webpack_require__(43);

	__webpack_require__(44);

	__webpack_require__(45);

/***/ },
/* 1 */
/***/ function(module, exports) {

	(function (window, G_vmlCanvasManager) {
	    "use strict";

	    var allPeriods = new RegExp('[.]', 'g');
	    function escapeForEmberProperty(prop) {
	        return prop.replace(allPeriods, '');
	    }

	    function outerXML(xmlNode) {
	        try {
	            // Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
	            return new XMLSerializer().serializeToString(xmlNode);
	        } catch (e) {
	            try {
	                // Internet Explorer.
	                return xmlNode.xml;
	            } catch (e) {
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

	    function makeUUID() {
	        return Math.floor(Math.random() * 1e10).toString();
	    }

	    var CurrentCollectionView = Ember.CollectionView.extend({
	        showAllContent: false,
	        currentContent: null,

	        init: function init() {
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
	        didInsertElement: function didInsertElement() {
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
	                    menu.menu("refresh");
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
	        didInsertElement: function didInsertElement() {
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
	        var tmp,
	            current,
	            top = array.length;

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

	    var hasExponent = /^(.+)(e[+-]*\d+)$/;
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
	    "use strict;";

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
	        if (this._oneWay) {
	            copy._oneWay = true;
	        }
	        copy._pauseIfTruePath = this._pauseIfTruePath;
	        copy._directionToPause = this._directionToPause;
	        copy._directionToSyncOnResume = this._directionToSyncOnResume;

	        return copy;
	    };

	    namespace.ConditionalBinding.prototype.currentlyPaused = function (target) {
	        return !Ember.isNone(this._pauseIfTruePath) && target.get(this._pauseIfTruePath);
	    };

	    namespace.ConditionalBinding.prototype.currentlyPausedFrom = function (target) {
	        return (this._directionToPause == "from" || this._directionToPause == "both") && this.currentlyPaused(target);
	    };

	    namespace.ConditionalBinding.prototype.currentlyPausedTo = function (target) {
	        return (this._directionToPause == "to" || this._directionToPause == "both") && this.currentlyPaused(target);
	    };

	    namespace.ConditionalBinding.prototype.connect = function (obj) {
	        var pauseIfTruePath = this._pauseIfTruePath;
	        if (!Ember.isNone(pauseIfTruePath)) {
	            Ember.addObserver(obj, pauseIfTruePath, this, this.pauseDidChange);
	        }
	        return Ember.Binding.prototype.connect.apply(this, arguments);
	    };

	    namespace.ConditionalBinding.prototype.disconnect = function (obj) {
	        var pauseIfTruePath = this._pauseIfTruePath;
	        if (!Ember.isNone(pauseIfTrue)) {
	            Ember.removeObserver(obj, pauseIfTruePath, this, this.pauseDidChange);
	        }
	        return Ember.Binding.prototype.disconnect.apply(this, arguments);
	    };

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
	    };

	    namespace.ConditionalBinding.prototype.fromDidChange = function (target) {
	        if (!this.currentlyPausedFrom(target)) {
	            return Ember.Binding.prototype.fromDidChange.apply(this, arguments);
	        } else {
	            this._latestSyncDirection = "from";
	        }
	    };
	    namespace.ConditionalBinding.prototype.toDidChange = function (target) {
	        if (!this.currentlyPausedTo(target)) {
	            Ember.Binding.prototype.toDidChange.apply(this, arguments);
	        } else {
	            this._latestSyncDirection = "to";
	        }
	    };

	    namespace.ConditionalBinding.prototype.pauseIfTrue = function (path) {
	        this._pauseIfTruePath = path;
	        this._directionToPause = "both";
	        this._directionToSyncOnResume = "latest";
	        return this;
	    };

	    namespace.ConditionalBinding.prototype.onlyPause = function (directionToPause) {
	        this._directionToPause = directionToPause;
	        return this;
	    };

	    namespace.ConditionalBinding.prototype.onResumeSetBothTo = function (directionToSyncOnResume) {
	        this._directionToSyncOnResume = directionToSyncOnResume;
	        return this;
	    };
	})(window, Ember);

	function testDefaultArgs() {
	    var from = Ember.Object.create({
	        value: 0
	    });

	    var to = Ember.Object.create({
	        from: from,
	        valueBinding: ConditionalBinding.from('from.value')
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
	        valueBinding: ConditionalBinding.from('from.value').pauseIfTrue('pausingProperty').onlyPause('from').onResumeSetBothTo('from'),
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
	        valueBinding: ConditionalBinding.from('from.value').pauseIfTrue('pausingProperty').onlyPause('from').onResumeSetBothTo('to'),
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
	        valueBinding: ConditionalBinding.from('from.value').pauseIfTrue('pausingProperty').onlyPause('to').onResumeSetBothTo('from'),
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
	    "use strict;";

	    var pausibleAlias = function pausibleAlias(dependentKey, pauseConditionPath) {
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

	            var weJustUnpaused = wasPaused && !paused;
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

	        function setup(obj, key) {
	            console.log("SETUP ALIAS", obj, key);
	        }
	        function destroy(obj, key) {
	            console.log("DESTROY ALIAS", obj, key);
	        }
	        cp.meta({
	            pausibleAlias: true,
	            setupPausibleAlias: setup,
	            destroyPausibleAlias: destroy
	        });

	        cp.property(dependentKey, pauseConditionPath);

	        return cp;
	    };

	    var HasPausibleAlias = Ember.Mixin.create({
	        _eachPausibleAlias: function _eachPausibleAlias(callback) {
	            var self = this;
	            this.constructor.eachComputedProperty(function (name, meta) {
	                if (meta.pausibleAlias) {
	                    callback.call(self, name, meta);
	                }
	            });
	        },
	        init: function init() {
	            this._super();
	            this._eachPausibleAlias(function (name, meta) {
	                meta.setupPausibleAlias(this, name);
	            });
	        },
	        destroy: function destroy() {
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

	        Ember.assert("Gets shouldn't affect state", setPausedAliasWithFinalGet(true) == setPausedAliasWithFinalGet(false));
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
	    /*with (scope) {
	        return eval(toEval);
	    }*/
	    console.error("EliciationUtils.evalInScope from elicitation-utils.js IS BROKEN BY USE-STRICT BABEL");
	    throw "EliciationUtils.evalInScope from elicitation-utils.js IS BROKEN BY USE-STRICT BABEL";
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var _ember = __webpack_require__(3);

	var _ember2 = _interopRequireDefault(_ember);

	__webpack_require__(27);

	__webpack_require__(28);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// For cross-iframe communication with the discussion engine
	try {
	    document.domain = 'nearzero.org';
	} catch (e) {}

	if (window.console == undefined) {
	    window.console = Object();
	}
	if (window.console.log == undefined) {
	    window.console.log = function (s) {
	        try {
	            console.log(s);
	        } catch (e) {};
	    };
	}

	window.debug = {};

	// For IE7 and IE8, which don't support Date.now()
	Date.now = Date.now || function () {
	    return new Date().valueOf();
	};

	(function (window, undefined) {
	    "use strict";

	    // Remove circular reference problem on IE7/8 created by the
	    // Meta object being enumerable, and Meta.source containing
	    // a circular reference back to the related Ember.Object

	    (function () {
	        if (_ember2.default.platform.defineProperty.isSimulated) {
	            var Meta = _ember2.default.meta(_ember2.default.Object.create()).constructor;
	            Meta.prototype.toJSON = function () {};
	        }
	    })();

	    var ElicitationAppClass = _ember2.default.Application.extend({
	        LOG_TRANSITIONS: true,
	        ready: function ready() {
	            this.instantiateResultsViews();
	            this.instantiateInlineViews();

	            $("#page-load-throbber").remove();
	            $.Placeholder.init();

	            $("body").on("click", ".markdown a", function (evt) {
	                console.log("Opening markdown link in new window");
	                evt.preventDefault();
	                evt.stopPropagation();
	                window.open($(this).attr("href"));
	            });
	        },
	        instantiateResultsViews: function instantiateResultsViews() {
	            $("script[type='text/x-elicitation-widget-results-data']").each(function () {
	                var resultsDataString = $(this).html();
	                try {
	                    var resultsDataJSON = JSON.parse(resultsDataString);
	                    var widgetType = _ember2.default.String.classify(resultsDataJSON.widgetType);
	                    // convert, e.g., card-rank to CardRank
	                    console.log("Widget type is: " + widgetType);
	                    var resultsViewClass = EAT.WidgetResultsViews[widgetType];
	                    if (!_ember2.default.isNone(resultsViewClass)) {
	                        var resultsData = EAT.WidgetResultsData.create({
	                            json: resultsDataJSON,
	                            rawJSON: resultsDataString
	                        });
	                        var resultsView = resultsViewClass.create({
	                            content: resultsData
	                        });

	                        // Now add the results chart into the HTML
	                        var resultsHolder = $(this).closest(".chart-holder");
	                        resultsView.appendTo(resultsHolder);
	                    } else {
	                        // FIXME: we should instantiate a placeholder telling the conversation moderator that
	                        // no suitable resultsview can be found
	                        console.log("ERROR: couldn't find a ResultsView to display chart results of " + widgetType + " widget");
	                    }
	                } catch (e) {
	                    console.log("Error parsing JSON: " + e.toString());
	                    debug.resultsDataString = resultsDataString;
	                }
	            });
	        },
	        instantiateInlineViews: function instantiateInlineViews() {}
	    });

	    var EAT = _ember2.default.Object.extend({
	        createApp: function createApp(rootElement, elicitationProperties) {
	            var app = ElicitationAppClass.create({
	                rootElement: rootElement
	            });

	            app.deferReadiness();

	            app.Router.map(function () {
	                //this.resource('widget', { path: '/widgets/:widget_id' });
	                this.route('edit', { path: '/edit/:widget_id' });
	            });

	            app.EditRoute = _ember2.default.Route.extend({
	                setupController: function setupController(controller) {
	                    console.log("Setting up edit route controller!");
	                }
	            });

	            app.applicationView = _ember2.default.View.extend({
	                classNames: ['elicitation-application']
	            });

	            app.IndexController = _ember2.default.Controller.extend({
	                elicitationBinding: 'content',
	                content: null
	            });

	            app.IndexRoute = _ember2.default.Route.extend({
	                setupController: function setupController(controller) {
	                    var elicitation = EAT.Elicitation.create(elicitationProperties);
	                    controller.set('content', elicitation);
	                }
	            });

	            app.IndexView = _ember2.default.View.extend({
	                templateName: 'elicitation',
	                editModeBinding: 'controller.elicitation.editMode'
	            });

	            return app;
	        }
	    }).create();

	    // Most EAT.* members are defined in eat.js

	    // EXPORTS:
	    window.EAT = EAT;
	})(window);

/***/ },
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */
/***/ function(module, exports) {

	Ember.TEMPLATES["eat"] = Ember.HTMLBars.template(function anonymous(Handlebars,depth0,helpers,partials,data,depth1
	/**/) {
	this.compilerInfo = [4,'>= 1.0.0'];
	helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
	  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

	function program1(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n        ");
	  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    ");
	  return buffer;
	  }

	function program3(depth0,data) {
	  
	  
	  data.buffer.push("\r\n        <div style=\"width:100%\">\r\n            <div id=\"browser-version-warning\">\r\n                <h1>Tablets and phones aren't yet supported</h1>\r\n                    \r\n                <p>The NearZero elicitation system is currently incompatible with mobile phones and tablets such as Android, iPhone and iPad.</p>\r\n\r\n                <p>We're working to add support for mobile devices, but until then, please use a computer.</p>\r\n\r\n                <p>If you have any questions, please email Seth Nickell <a href=\"mailto: snickell@gmail.com\">snickell@gmail.com</a>.</p><p>Sorry for the hassle!</p>\r\n            </div>\r\n        </div>   \r\n    ");
	  }

	function program5(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n        ");
	  stack1 = helpers.unless.call(depth0, "view.definition.hideOptionalQualifications", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        ");
	  stack1 = helpers['if'].call(depth0, "view.hasQualificationsToShow", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    ");
	  return buffer;
	  }
	function program6(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n            <div class=\"select-qualifications\">\r\n                ");
	  stack1 = helpers.view.call(depth0, "ElicitationUtils.DropDownMenuView", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                <div class=\"caption\">Qualify your answer</div>\r\n            </div>\r\n        ");
	  return buffer;
	  }
	function program7(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    ");
	  stack1 = helpers.each.call(depth0, "qualification", "in", "view.parentView.qualifications", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                ");
	  return buffer;
	  }
	function program8(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                        <li>\r\n                            <label>\r\n                                ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Checkbox", {hash:{
	    'checkedBinding': ("qualification.showQualification"),
	    'disabledBinding': ("qualification.disableTogglingForParticipant")
	  },hashTypes:{'checkedBinding': "STRING",'disabledBinding': "STRING"},hashContexts:{'checkedBinding': depth0,'disabledBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push(" \r\n                                <span>");
	  stack1 = helpers._triageMustache.call(depth0, "qualification.prettyName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</span>\r\n                            </label>\r\n                        </li>\r\n                    ");
	  return buffer;
	  }

	function program10(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n            <div class=\"qualifications-rhs-bar\"></div>\r\n            <div class=\"qualifications\">\r\n                ");
	  stack1 = helpers.each.call(depth0, "qualification", "in", "view.qualificationsToShow", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            </div>\r\n        ");
	  return buffer;
	  }
	function program11(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "qualification.editorView", {hash:{
	    'contentBinding': ("qualification")
	  },hashTypes:{'contentBinding': "STRING"},hashContexts:{'contentBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                ");
	  return buffer;
	  }

	function program13(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n        ");
	  stack1 = helpers['if'].call(depth0, "elicitation.editMode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n\r\n        <div id=\"nav\">\r\n            <a href=\"#\" class=\"edit button\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleEditMode", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">");
	  stack1 = helpers._triageMustache.call(depth0, "view.toggleEditModeLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</a>\r\n\r\n            ");
	  stack1 = helpers['if'].call(depth0, "elicitation.editMode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(18, program18, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        </div>\r\n    ");
	  return buffer;
	  }
	function program14(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n            <div class='contents'>\r\n                <div class=\"header\">\r\n                    Authoring Elicitation\r\n                    ");
	  stack1 = helpers.view.call(depth0, "ElicitationUtils.DropDownMenuView", {hash:{
	    'downArrowButton': ("true"),
	    'placeholder': ("Qualify your answer")
	  },hashTypes:{'downArrowButton': "STRING",'placeholder': "STRING"},hashContexts:{'downArrowButton': depth0,'placeholder': depth0},inverse:self.noop,fn:self.program(15, program15, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                </div>\r\n                <hr/>\r\n\r\n                ");
	  stack1 = helpers._triageMustache.call(depth0, "elicitation.numPages", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push(" pages:\r\n                <input type=\"submit\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addNewPage", {hash:{
	    'target': ("view"),
	    'on': ("click")
	  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(" value=\"Add New Page\" />\r\n            </div>\r\n        ");
	  return buffer;
	  }
	function program15(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                        <li style=\"display: none\"><!-- disabled until nodejs rewrite bits support saveAs in elicitation.js -->\r\n                            <a href=\"#\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "saveChangesAs", {hash:{
	    'target': ("elicitation")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">\r\n                                <span class=\"ui-icon ui-icon-disk\"></span>\r\n                                Save a Copy As...\r\n                            </a>\r\n                        </li>\r\n                        <li>\r\n                            <a href=\"#\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "print", {hash:{
	    'target': ("elicitation")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">\r\n                                <span class=\"ui-icon ui-icon-print\"></span>\r\n                                Print...\r\n                            </a>\r\n                        </li>\r\n                        <li class=\"category\">Share:</li>\r\n                        <li>\r\n                            <a ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'href': ("elicitation.reviewAdminURL")
	  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" target=\"blank\">\r\n                                <span class=\"ui-icon ui-icon-circle-arrow-e\"></span>\r\n                                Reviewer Link (shareable url)\r\n                            </a>\r\n                        </li>\r\n                        <li>\r\n                            <a ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'href': ("elicitation.assignedToAdminURL")
	  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" target=\"_blank\">\r\n                                <span class=\"ui-icon ui-icon-circle-arrow-e\"></span>\r\n                                Assign to Participants...\r\n                            </a>\r\n                        </li>\r\n                        <li class=\"category\">Navigate To:</li>\r\n                        <li>\r\n                            <a ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'href': ("elicitation.dataAdminURL")
	  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" target=\"_blank\">\r\n                                <span class=\"ui-icon ui-icon-circle-arrow-e\"></span>\r\n                                Participant Response Data...\r\n                            </a>\r\n                        </li>\r\n                        <li>\r\n                            <a ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'href': ("elicitation.changeHistoryAdminURL")
	  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" target=\"blank\">\r\n                                <span class=\"ui-icon ui-icon-circle-arrow-e\"></span>\r\n                                Revision History...\r\n                            </a>\r\n                        </li>\r\n                        <li>\r\n                            <a ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'href': ("elicitation.priorDataURL")
	  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" target=\"blank\">\r\n                                <span class=\"ui-icon ui-icon-circle-arrow-e\"></span>\r\n                                Preload Variables w/ Prior Data\r\n                            </a>\r\n                        </li>\r\n                        ");
	  stack1 = helpers['if'].call(depth0, "elicitation.discussionURL", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                    ");
	  return buffer;
	  }
	function program16(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                            <li>\r\n                                <a ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'href': ("elicitation.discussionURL")
	  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" target=\"_blank\">\r\n                                    <span class=\"ui-icon ui-icon-circle-arrow-e\"></span>\r\n                                    Discussion...\r\n                                </a>\r\n                            </li>\r\n                        ");
	  return buffer;
	  }

	function program18(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                ");
	  stack1 = helpers['if'].call(depth0, "view.editedSinceSaving", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(19, program19, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            ");
	  return buffer;
	  }
	function program19(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    <a href=\"#\" \r\n                        ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'class': (":save :button elicitation.definitionIsSaved")
	  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" \r\n                        ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "saveChanges", {hash:{
	    'target': ("elicitation")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push("\r\n                    >\r\n                        ");
	  stack1 = helpers['if'].call(depth0, "elicitation.saveInProgress", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(22, program22, data),fn:self.program(20, program20, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                    </a>\r\n                    <div class=\"save-message\">\r\n                        ");
	  stack1 = helpers._triageMustache.call(depth0, "elicitation.saveMessage", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                    </div>\r\n                ");
	  return buffer;
	  }
	function program20(depth0,data) {
	  
	  
	  data.buffer.push("\r\n                            Saving...\r\n                        ");
	  }

	function program22(depth0,data) {
	  
	  
	  data.buffer.push("\r\n                            Save\r\n                        ");
	  }

	function program24(depth0,data) {
	  
	  
	  data.buffer.push("\r\n        <div id=\"unsupported-browser-warning\">\r\n            <b>FYI:</b> Edit-Mode doesn't work on IE7/8\r\n        </div>\r\n    ");
	  }

	function program26(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n            <div class=\"widget\" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'widget-name': ("widget.widgetName")
	  },hashTypes:{'widget-name': "STRING"},hashContexts:{'widget-name': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "widgetClicked", "widget", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["ID","ID"],data:data})));
	  data.buffer.push(">\r\n                <div class=\"thumbnail\">\r\n                    <img ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'src': ("widget.thumbnailURL")
	  },hashTypes:{'src': "STRING"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" />\r\n                </div>\r\n                <h1>");
	  stack1 = helpers._triageMustache.call(depth0, "widget.prettyName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</h1>\r\n            </div>\r\n        ");
	  return buffer;
	  }

	function program28(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n        <div class=\"editor\">\r\n            <h3>Edit Page Footer:</h3>\r\n            ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
	    'valueBinding': ("view.content.label")
	  },hashTypes:{'valueBinding': "STRING"},hashContexts:{'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n        </div>\r\n    ");
	  return buffer;
	  }

	function program30(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n    <div class=\"editor\">\r\n        <h3>Program Custom Widgets:</h3>\r\n        <h4>Javascript:</h4>\r\n        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
	    'valueBinding': ("view.content.javascript")
	  },hashTypes:{'valueBinding': "STRING"},hashContexts:{'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n        <h4>CSS:</h4>\r\n        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
	    'valueBinding': ("view.content.css")
	  },hashTypes:{'valueBinding': "STRING"},hashContexts:{'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n        <br/>\r\n        <button ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "injectCSSAndJavascript", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">Apply Changes</button>\r\n    </div>\r\n    ");
	  return buffer;
	  }

	function program32(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n            ");
	  stack1 = helpers['if'].call(depth0, "elicitation.editMode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(33, program33, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("     \r\n\r\n            ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.EditControlsView", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n        ");
	  return buffer;
	  }
	function program33(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.EditSidebarView", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n\r\n                ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.PhraseDefinitionsView", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n\r\n                ");
	  stack1 = helpers['if'].call(depth0, "elicitation.widgetGalleryIsOpen", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(34, program34, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            ");
	  return buffer;
	  }
	function program34(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.WidgetGalleryView", {hash:{
	    'addToPageBinding': ("elicitation.widgetGalleryAddsToPage")
	  },hashTypes:{'addToPageBinding': "STRING"},hashContexts:{'addToPageBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                ");
	  return buffer;
	  }

	function program36(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    ");
	  stack1 = helpers.view.call(depth0, "EAT.CloseEmbeddedView", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(37, program37, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                ");
	  return buffer;
	  }
	function program37(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                        <div class=\"close-embedded-view\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeEmbeddedViewConfirm", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">X</div>\r\n                    ");
	  return buffer;
	  }

	function program39(depth0,data) {
	  
	  
	  data.buffer.push("\r\n                <div class=\"review-header\">Review Mode (read-only)</div>\r\n                ");
	  }

	function program41(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    <div class=\"error-submitting-to-server\">\r\n                        <div class=\"header\">\r\n                            ");
	  stack1 = helpers['if'].call(depth0, "elicitation.showSerializedData", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(44, program44, data),fn:self.program(42, program42, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                        </div>\r\n                        ");
	  stack1 = helpers['if'].call(depth0, "elicitation.showSerializedData", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(46, program46, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                    </div>\r\n                ");
	  return buffer;
	  }
	function program42(depth0,data) {
	  
	  
	  data.buffer.push("\r\n                                <span class=\"title\">Ugh! Submit failed :-(</span> We really want to record your data, try to submit again?\r\n                            ");
	  }

	function program44(depth0,data) {
	  
	  
	  data.buffer.push("\r\n                                <span class=\"title\">WARNING</span> could not contact the server... is your internet connected?\r\n                            ");
	  }

	function program46(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                            If that doesnt work, please submit your response by copy-pasting the following data, and emailing to <b><a target=\"_blank\" href=\"mailto:help@nearzero.org\">help@nearzero.org</a></b>:\r\n                            <div class=\"copy-paste\">");
	  stack1 = helpers._triageMustache.call(depth0, "elicitation.showSerializedData", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</div>\r\n                            Thank You! Sorry for the hassle.\r\n                        ");
	  return buffer;
	  }

	function program48(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n        ");
	  stack1 = helpers.view.call(depth0, "EAT.CloseEmbeddedView", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(49, program49, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    ");
	  return buffer;
	  }
	function program49(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n            <div class=\"continue-to-discussion\">\r\n                <input type=\"submit\" style=\"font-size: 120%\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeEmbeddedViewPostSubmit", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(" value=\"Continue to Discussion\" />\r\n            </div>\r\n        ");
	  return buffer;
	  }

	function program51(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n        ");
	  stack1 = helpers['if'].call(depth0, "elicitation.completePageIncludeLinkToDiscussion", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(52, program52, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    ");
	  return buffer;
	  }
	function program52(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n            <div class=\"continue-to-discussion\">\r\n                <input type=\"submit\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "gotoDiscussion", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(" value=\"Continue to Discussion\" />\r\n            </div>\r\n        ");
	  return buffer;
	  }

	function program54(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n        <span class=\"help-button\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleHelpText", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">?</span>\r\n        <div class=\"help-text\">");
	  stack1 = helpers._triageMustache.call(depth0, "property.helpText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</div>\r\n    ");
	  return buffer;
	  }

	function program56(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n        <div class=\"message\">\r\n            ");
	  stack1 = helpers._triageMustache.call(depth0, "view.message", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        </div>\r\n    ");
	  return buffer;
	  }

	function program58(depth0,data,depth1) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n            <div class=\"has-many-child\">\r\n                <div class=\"controls\">\r\n                    <a class=\"move up\" title=\"Move this ");
	  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "property.prettyName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth1],types:["ID"],data:data})));
	  data.buffer.push(" up\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "moveChildUp", "subProperty", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
	  data.buffer.push(">▲</a>\r\n                    <a class=\"move down\" title=\"Move this ");
	  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "property.prettyName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth1],types:["ID"],data:data})));
	  data.buffer.push(" down\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "moveChildDown", "subProperty", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
	  data.buffer.push(">▼</a>\r\n                    |\r\n                    <input type=\"submit\" class=\"delete\" title=\"Delete this ");
	  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "property.prettyName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth1],types:["ID"],data:data})));
	  data.buffer.push("\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "removeChild", "subProperty", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
	  data.buffer.push(" value=\"X\"/>\r\n                </div>\r\n                ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.WidgetDefinitionEditorView", {hash:{
	    'definitionBinding': ("subProperty")
	  },hashTypes:{'definitionBinding': "STRING"},hashContexts:{'definitionBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n            </div>\r\n        ");
	  return buffer;
	  }

	function program60(depth0,data,depth1) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n            <div class=\"is-empty-message\">\r\n                ");
	  stack1 = helpers['if'].call(depth0, "property.emphasizeWhenEmpty", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(63, program63, data),fn:self.program(61, program61, data),contexts:[depth1],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            </div>\r\n        ");
	  return buffer;
	  }
	function program61(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    <p style=\"font-size:120%; font-style: normal;\"><span style='background-color: black; color: white'>Start Here:</span> click the button above to add a few ");
	  stack1 = helpers._triageMustache.call(depth0, "property.prettyNamePlural", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push(".</p>\r\n                ");
	  return buffer;
	  }

	function program63(depth0,data) {
	  
	  
	  data.buffer.push("\r\n                    None added yet.\r\n                ");
	  }

	function program65(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n        ");
	  stack1 = helpers.view.call(depth0, "EAT.WidgetDefinitionEditorCategoryView", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(66, program66, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    ");
	  return buffer;
	  }
	function program66(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n            <div ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'class': (":category defaultCategory view.expanded")
	  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(">\r\n                ");
	  stack1 = helpers.unless.call(depth0, "defaultCategory", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(67, program67, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        \r\n                <div class=\"category-body\">\r\n                    ");
	  stack1 = helpers.each.call(depth0, "propertiesAndValues", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(69, program69, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                </div>\r\n            </div>\r\n        ");
	  return buffer;
	  }
	function program67(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("<div class=\"category-header\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleExpanded", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">");
	  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</div>");
	  return buffer;
	  }

	function program69(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                        ");
	  stack1 = helpers['if'].call(depth0, "property.visible", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(70, program70, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                    ");
	  return buffer;
	  }
	function program70(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                            ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "property.editorView", {hash:{
	    'propertyBinding': ("property"),
	    'valueBinding': ("value"),
	    'parentDefinitionBinding': ("view.definition")
	  },hashTypes:{'propertyBinding': "STRING",'valueBinding': "STRING",'parentDefinitionBinding': "STRING"},hashContexts:{'propertyBinding': depth0,'valueBinding': depth0,'parentDefinitionBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                        ");
	  return buffer;
	  }

	function program72(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n        <div class=\"widget-being-edited\">");
	  stack1 = helpers._triageMustache.call(depth0, "elicitation.widgetBeingEdited.prettyName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push(" <input style=\"float: right\" type=\"submit\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeWidgetEditor", {hash:{
	    'target': ("view"),
	    'on': ("click")
	  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(" value=\"Close\"/></div>\r\n    ");
	  return buffer;
	  }

	function program74(depth0,data) {
	  
	  
	  data.buffer.push("\r\n            <div class=\"no-widget-being-edited-message\">Hover over a widget and click <b>Edit</b> to set its properties here.</div>\r\n        ");
	  }

	function program76(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.WidgetDataExplorer", {hash:{
	    'widgetBinding': ("elicitation.widgetBeingEdited")
	  },hashTypes:{'widgetBinding': "STRING"},hashContexts:{'widgetBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n    ");
	  return buffer;
	  }

	function program78(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                ");
	  stack1 = helpers.view.call(depth0, "EAT.PhraseDefinitionView", {hash:{
	    'contentBinding': ("phraseDefinition"),
	    'phrasesBinding': ("view")
	  },hashTypes:{'contentBinding': "STRING",'phrasesBinding': "STRING"},hashContexts:{'contentBinding': depth0,'phrasesBinding': depth0},inverse:self.noop,fn:self.program(79, program79, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            ");
	  return buffer;
	  }
	function program79(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    <label>");
	  stack1 = helpers._triageMustache.call(depth0, "view.content.phrase", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push(":</label>\r\n                        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "ElicitationUtils.ExpandingTextArea", {hash:{
	    'valueBinding': ("view.content.definition")
	  },hashTypes:{'valueBinding': "STRING"},hashContexts:{'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                ");
	  return buffer;
	  }

	function program81(depth0,data) {
	  
	  
	  data.buffer.push("\r\n                <i>No definitions.</i>\r\n            ");
	  }

	function program83(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n            <ul>\r\n                ");
	  stack1 = helpers.each.call(depth0, "view.data", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(86, program86, data),fn:self.program(84, program84, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            </ul>\r\n        ");
	  return buffer;
	  }
	function program84(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    <li><b>");
	  stack1 = helpers._triageMustache.call(depth0, "key", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push(":</b> ");
	  stack1 = helpers._triageMustache.call(depth0, "value", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</li>\r\n                ");
	  return buffer;
	  }

	function program86(depth0,data) {
	  
	  
	  data.buffer.push("\r\n                    <li><i>No data was stored.</i></li>\r\n                ");
	  }

	function program88(depth0,data) {
	  
	  
	  data.buffer.push("\r\n            <i>Click \"Store Data\" to test this widget's data.</i>\r\n        ");
	  }

	function program90(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n            <b>Validation Messages:</b>\r\n            <ul>\r\n                ");
	  stack1 = helpers.each.call(depth0, "view.errors", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(91, program91, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            </ul>\r\n        ");
	  return buffer;
	  }
	function program91(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    <li>");
	  stack1 = helpers._triageMustache.call(depth0, "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</li>\r\n                ");
	  return buffer;
	  }

	function program93(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n        <div class=\"edit-widget\">\r\n            <a href=\"#\" title=\"Configure widget's content and properties\" id=\"edit\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "editWidget", {hash:{
	    'target': ("view"),
	    'on': ("click")
	  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">Edit</a>\r\n            |\r\n            <span class=\"order\">\r\n                <a href=\"#\" title=\"Move widget up\" id=\"up\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "moveWidgetUp", {hash:{
	    'target': ("view"),
	    'on': ("click")
	  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">▲</a>\r\n                <a href=\"#\" title=\"Move widget down\" id=\"down\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "moveWidgetDown", {hash:{
	    'target': ("view"),
	    'on': ("click")
	  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">▼</a>\r\n            </span>\r\n            |\r\n            <a href=\"#\" title=\"Delete widget\" id=\"remove\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "removeWidget", {hash:{
	    'target': ("view"),
	    'on': ("click")
	  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">X</a>\r\n        </div>\r\n    ");
	  return buffer;
	  }

	function program95(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n            <div class=\"edit-widget edit-page\">\r\n                ");
	  stack1 = helpers.view.call(depth0, "view.addWidgetToPageView", {hash:{
	    'pageBinding': ("view.page")
	  },hashTypes:{'pageBinding': "STRING"},hashContexts:{'pageBinding': depth0},inverse:self.noop,fn:self.program(96, program96, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                |\r\n                <span class=\"order\">\r\n                    <a href=\"#\" title=\"Move Page Up\" id=\"up\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "movePageUp", {hash:{
	    'target': ("view"),
	    'on': ("click")
	  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">▲</a>\r\n                    <a href=\"#\" title=\"Move Page Down\" id=\"up\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "movePageDown", {hash:{
	    'target': ("view"),
	    'on': ("click")
	  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">▼</a>\r\n                </span>\r\n                |\r\n                <a href=\"#\" title=\"Delete Page\" id=\"remove\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "removePage", {hash:{
	    'target': ("view"),
	    'on': ("click")
	  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">X</a>\r\n            </div>\r\n        ");
	  return buffer;
	  }
	function program96(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    <select>\r\n                        <option value=\"prompt-no-action-required\">Add a Widget:</option>\r\n                        <optgroup label=\"Gallery:\">\r\n                            <option value=\"show-gallery\">Browse widgets...</option>\r\n                        </optgroup>\r\n                        <optgroup label=\"Add:\">\r\n                            ");
	  stack1 = helpers.each.call(depth0, "widget", "in", "view.widgetNames", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(97, program97, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                        </optgroup>\r\n                    </select>\r\n                    <!--\r\n                    view Ember.Select viewName=\"select\"\r\n                                    contentBinding=\"view.widgetNames\"\r\n                                    optionLabelPath=\"content.prettyName\"\r\n                                    optionValuePath=\"content.widgetName\"\r\n                                    prompt=\"Add a Widget:\" \r\n                                    selectionBinding=\"view.newWidgetToAdd\"\r\n                    -->\r\n                ");
	  return buffer;
	  }
	function program97(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                                <option ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'value': ("widget.widgetName")
	  },hashTypes:{'value': "STRING"},hashContexts:{'value': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(">");
	  stack1 = helpers._triageMustache.call(depth0, "widget.prettyName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</option>\r\n                            ");
	  return buffer;
	  }

	function program99(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.EditableWidgetView", {hash:{
	    'contentBinding': ("this")
	  },hashTypes:{'contentBinding': "STRING"},hashContexts:{'contentBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n            ");
	  return buffer;
	  }

	function program101(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                ");
	  stack1 = helpers['if'].call(depth0, "elicitation.editMode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(102, program102, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            ");
	  return buffer;
	  }
	function program102(depth0,data) {
	  
	  
	  data.buffer.push("\r\n                    <div class=\"blank-page-message\">This is a blank page. To add a widget to this page, hover over the page and click <b>Add a Widget</b>.</div>\r\n                ");
	  }

	function program104(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    ");
	  stack1 = helpers._triageMustache.call(depth0, "view.page.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                ");
	  return buffer;
	  }

	function program106(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
	    'valueBinding': ("view.page.title")
	  },hashTypes:{'valueBinding': "STRING"},hashContexts:{'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                ");
	  return buffer;
	  }

	function program108(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    ");
	  stack1 = helpers.unless.call(depth0, "view.page.firstPageAfterResume", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(112, program112, data),fn:self.program(109, program109, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n\r\n                    <input id=\"next\" type=\"submit\" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'disabled': ("view.nextButtonDisabled")
	  },hashTypes:{'disabled': "STRING"},hashContexts:{'disabled': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'value': ("view.nextButtonLabel")
	  },hashTypes:{'value': "STRING"},hashContexts:{'value': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "gotoNextPage", {hash:{
	    'target': ("view"),
	    'on': ("click")
	  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">\r\n                ");
	  return buffer;
	  }
	function program109(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                        ");
	  stack1 = helpers.unless.call(depth0, "view.page.isFirstPage", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(110, program110, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                    ");
	  return buffer;
	  }
	function program110(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                            <input href=\"#\" id=\"back\" value=\"«\" type=\"submit\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "gotoPrevPage", {hash:{
	    'target': ("view"),
	    'on': ("click")
	  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">\r\n                        ");
	  return buffer;
	  }

	function program112(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                        <div id=\"resume-info-box\">\r\n                            <input href=\"#\" id=\"back\" value=\"«\" type=\"submit\" disabled=\"true\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "none", {hash:{
	    'target': ("view"),
	    'on': ("click")
	  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">\r\n                            <div class=\"info\">\r\n                                <b>Resuming where you left off.</b> Your earlier responses have been saved, but you won't be able go backward to review or revise them.<br/>\r\n                                <p style=\"font-size: 90%\">You could also <a href=\"#\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "restartElicitationWithoutPriorData", {hash:{
	    'target': ("view"),
	    'on': ("click")
	  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">start over from scratch</a>.</p>\r\n                            </div>\r\n                        </div>\r\n                        \r\n                    ");
	  return buffer;
	  }

	function program114(depth0,data) {
	  
	  
	  data.buffer.push("\r\n\r\n                ");
	  }

	function program116(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                    <span class=\"page-num-editor\">\r\n                        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
	    'contentBinding': ("elicitation.pagesController.pageRangeForSelect"),
	    'valueBinding': ("view.page.pageNum")
	  },hashTypes:{'contentBinding': "STRING",'valueBinding': "STRING"},hashContexts:{'contentBinding': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                    </span>\r\n                ");
	  return buffer;
	  }

	function program118(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n        <div class=\"page-author-notes\">\r\n            ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "ElicitationUtils.ExpandingTextArea", {hash:{
	    'valueBinding': ("view.page.authorNotes"),
	    'rows': ("1"),
	    'placeholder': ("Elicitation authors' notes")
	  },hashTypes:{'valueBinding': "STRING",'rows': "STRING",'placeholder': "STRING"},hashContexts:{'valueBinding': depth0,'rows': depth0,'placeholder': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n        </div>\r\n\r\n        <div class=\"insert-a-new-page\">\r\n            <a href=\"#\" title=\"Move Page Down\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "insertNewPageAfter", {hash:{
	    'target': ("view"),
	    'on': ("click")
	  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">Add a New Page</a>\r\n        </div>\r\n    ");
	  return buffer;
	  }

	  data.buffer.push("\r\n<script type=\"text/x-handlebars\">\r\n    ");
	  stack1 = helpers.unless.call(depth0, "elicitation.unsupportedBrowser", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"dropdown-qualification-editor-view\">\r\n    <label>");
	  stack1 = helpers._triageMustache.call(depth0, "view.content.prettyName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push(":</label>\r\n    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
	    'contentBinding': ("view.selections"),
	    'prompt': (" "),
	    'optionValuePath': ("content.value"),
	    'optionLabelPath': ("content.label"),
	    'selectionBinding': ("view.content.content")
	  },hashTypes:{'contentBinding': "STRING",'prompt': "STRING",'optionValuePath': "STRING",'optionLabelPath': "STRING",'selectionBinding': "STRING"},hashContexts:{'contentBinding': depth0,'prompt': depth0,'optionValuePath': depth0,'optionLabelPath': depth0,'selectionBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push(" \r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"text-comment-qualification-editor-view\">\r\n    <label>");
	  stack1 = helpers._triageMustache.call(depth0, "view.content.prettyName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push(":</label>\r\n    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "ElicitationUtils.ExpandingTextArea", {hash:{
	    'placeholder': ("Leave your comment here"),
	    'valueBinding': ("view.content.content")
	  },hashTypes:{'placeholder': "STRING",'valueBinding': "STRING"},hashContexts:{'placeholder': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n</script>\r\n\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"widget-layout\">\r\n    ");
	  stack1 = helpers._triageMustache.call(depth0, "yield", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    ");
	  stack1 = helpers['if'].call(depth0, "view.qualifications", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"drop-down-menu\">\r\n    <div class=\"button\" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'placeholder': ("placeholder")
	  },hashTypes:{'placeholder': "STRING"},hashContexts:{'placeholder': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push("></div>\r\n    <ul>\r\n        ");
	  stack1 = helpers._triageMustache.call(depth0, "yield", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    </ul>\r\n</script>\r\n\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"edit-controls\">\r\n    ");
	  stack1 = helpers.unless.call(depth0, "unsupportedBrowserForEditing", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(24, program24, data),fn:self.program(13, program13, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"widget-gallery\">\r\n    <div class=\"gallery-frame\">\r\n        <div class=\"header\">\r\n            <h1>Choose Yer' Poison</h1>\r\n            <input type=\"submit\" value=\"X\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeWidgetGallery", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push("/>\r\n        </div>\r\n        ");
	  stack1 = helpers.each.call(depth0, "widget", "in", "view.widgets", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(26, program26, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"page-footer\">\r\n    ");
	  stack1 = helpers['if'].call(depth0, "elicitation.editMode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(28, program28, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    <div class=\"view\">\r\n        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.MarkdownLabel", {hash:{
	    'contentBinding': ("view.content.label"),
	    'elicitationBinding': ("elicitation")
	  },hashTypes:{'contentBinding': "STRING",'elicitationBinding': "STRING"},hashContexts:{'contentBinding': depth0,'elicitationBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"custom-widgets\">\r\n    ");
	  stack1 = helpers['if'].call(depth0, "elicitation.editMode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(30, program30, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"elicitation\">\r\n    <div ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'class': ("elicitation.editMode elicitation.reviewMode elicitation.showAllPages")
	  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(">\r\n        ");
	  stack1 = helpers['if'].call(depth0, "elicitation.allowEditing", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(32, program32, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n\r\n        <div id=\"elicitation-box\" >\r\n            <div class=\"elicitation\">\r\n                ");
	  stack1 = helpers['if'].call(depth0, "elicitation.embedded", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(36, program36, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n\r\n                ");
	  stack1 = helpers['if'].call(depth0, "elicitation.reviewMode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(39, program39, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n\r\n                ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.PagesView", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n\r\n                ");
	  stack1 = helpers['if'].call(depth0, "elicitation.errorSubmittingToServer", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(41, program41, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.PageFooterView", {hash:{
	    'contentBinding': ("elicitation.pageFooter")
	  },hashTypes:{'contentBinding': "STRING"},hashContexts:{'contentBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.CustomWidgetsView", {hash:{
	    'contentBinding': ("elicitation.customWidgets")
	  },hashTypes:{'contentBinding': "STRING"},hashContexts:{'contentBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n\r\n            </div>\r\n            <div id=\"page-notes\">\r\n                <div id=\"note-contents\">\r\n                </div>\r\n            </div>\r\n            ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.PostSubmitView", {hash:{
	    'elicitationBinding': ("elicitation")
	  },hashTypes:{'elicitationBinding': "STRING"},hashContexts:{'elicitationBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n        </div>\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"post-submit\">\r\n    <h2>Thanks, your responses have been recorded.</h2>\r\n\r\n    <div class=\"message\">");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.MarkdownLabel", {hash:{
	    'contentBinding': ("elicitation.completePageMessage"),
	    'elicitationBinding': ("elicitation")
	  },hashTypes:{'contentBinding': "STRING",'elicitationBinding': "STRING"},hashContexts:{'contentBinding': depth0,'elicitationBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("</div>\r\n\r\n    ");
	  stack1 = helpers['if'].call(depth0, "elicitation.embedded", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(51, program51, data),fn:self.program(48, program48, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n</script>\r\n\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"property-label\">\r\n    <label>");
	  stack1 = helpers._triageMustache.call(depth0, "property.prettyName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push(":</label>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"markdown-label\">\r\n");
	  stack1 = helpers._triageMustache.call(depth0, "view.html", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"widget-label\">\r\n    <div class=\"prompt\">");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.MarkdownLabel", {hash:{
	    'contentBinding': ("view.definition.label"),
	    'elicitationBinding': ("view.elicitation")
	  },hashTypes:{'contentBinding': "STRING",'elicitationBinding': "STRING"},hashContexts:{'contentBinding': depth0,'elicitationBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("</div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"property-help-text\">\r\n    ");
	  stack1 = helpers['if'].call(depth0, "property.helpText", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(54, program54, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"property-editor-string\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "property-label", options) : helperMissing.call(depth0, "partial", "property-label", options))));
	  data.buffer.push("\r\n    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
	    'valueBinding': ("value")
	  },hashTypes:{'valueBinding': "STRING"},hashContexts:{'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "property-help-text", options) : helperMissing.call(depth0, "partial", "property-help-text", options))));
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"property-editor-formula\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "property-label", options) : helperMissing.call(depth0, "partial", "property-label", options))));
	  data.buffer.push("\r\n    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
	    'valueBinding': ("value")
	  },hashTypes:{'valueBinding': "STRING"},hashContexts:{'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
	    'contentBinding': ("view.formulaElements"),
	    'prompt': ("Add reference:"),
	    'selectionBinding': ("view.dataKeyToAppend")
	  },hashTypes:{'contentBinding': "STRING",'prompt': "STRING",'selectionBinding': "STRING"},hashContexts:{'contentBinding': depth0,'prompt': depth0,'selectionBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n    Result: '<i>");
	  stack1 = helpers._triageMustache.call(depth0, "view.result", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</i>'\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "property-help-text", options) : helperMissing.call(depth0, "partial", "property-help-text", options))));
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"property-editor-millions-of-dollars\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "property-label", options) : helperMissing.call(depth0, "partial", "property-label", options))));
	  data.buffer.push("\r\n    $");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
	    'width': ("10"),
	    'valueBinding': ("value")
	  },hashTypes:{'width': "STRING",'valueBinding': "STRING"},hashContexts:{'width': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("m<br/>\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "property-help-text", options) : helperMissing.call(depth0, "partial", "property-help-text", options))));
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"property-editor-boolean\">\r\n    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Checkbox", {hash:{
	    'checkedBinding': ("value")
	  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push(" ");
	  stack1 = helpers._triageMustache.call(depth0, "property.prettyName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("<br/>\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "property-help-text", options) : helperMissing.call(depth0, "partial", "property-help-text", options))));
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"property-editor-text\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "property-label", options) : helperMissing.call(depth0, "partial", "property-label", options))));
	  data.buffer.push("\r\n    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "ElicitationUtils.ExpandingTextArea", {hash:{
	    'valueBinding': ("value")
	  },hashTypes:{'valueBinding': "STRING"},hashContexts:{'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("<br/>\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "property-help-text", options) : helperMissing.call(depth0, "partial", "property-help-text", options))));
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"property-editor-color\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "property-label", options) : helperMissing.call(depth0, "partial", "property-label", options))));
	  data.buffer.push("\r\n    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
	    'id': ("color"),
	    'valueBinding': ("value")
	  },hashTypes:{'id': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("<br/>\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "property-help-text", options) : helperMissing.call(depth0, "partial", "property-help-text", options))));
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"property-editor-image\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "property-label", options) : helperMissing.call(depth0, "partial", "property-label", options))));
	  data.buffer.push("\r\n\r\n    <form class=\"image-upload\" enctype=\"multipart/form-data\">\r\n        <input ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "fileChanged", {hash:{
	    'on': ("change"),
	    'target': ("view")
	  },hashTypes:{'on': "STRING",'target': "STRING"},hashContexts:{'on': depth0,'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(" class=\"file\" name=\"file\" type=\"file\" />\r\n        <progress></progress>\r\n    </form>\r\n\r\n    ");
	  stack1 = helpers['if'].call(depth0, "view.message", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(56, program56, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "property-help-text", options) : helperMissing.call(depth0, "partial", "property-help-text", options))));
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"property-editor-enum\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "property-label", options) : helperMissing.call(depth0, "partial", "property-label", options))));
	  data.buffer.push("\r\n    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
	    'contentBinding': ("property.values"),
	    'optionValuePath': ("content.value"),
	    'optionLabelPath': ("content.label"),
	    'valueBinding': ("value")
	  },hashTypes:{'contentBinding': "STRING",'optionValuePath': "STRING",'optionLabelPath': "STRING",'valueBinding': "STRING"},hashContexts:{'contentBinding': depth0,'optionValuePath': depth0,'optionLabelPath': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "property-help-text", options) : helperMissing.call(depth0, "partial", "property-help-text", options))));
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"property-editor-hasmany\">\r\n    <div class=\"has-many-box\">\r\n        <div class=\"header\">");
	  stack1 = helpers._triageMustache.call(depth0, "property.prettyNamePlural", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push(": <input type=\"submit\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addChild", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(" value=\"Add a ");
	  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "property.prettyName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth1],types:["ID"],data:data})));
	  data.buffer.push("\"/></div>\r\n        ");
	  stack1 = helpers.each.call(depth0, "subProperty", "in", "value", {hash:{},hashTypes:{},hashContexts:{},inverse:self.programWithDepth(60, program60, data, depth0),fn:self.programWithDepth(58, program58, data, depth0),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"widget-definition-editor\">\r\n    ");
	  stack1 = helpers.each.call(depth0, "view.definition.categories", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(65, program65, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"edit-sidebar\">\r\n    ");
	  stack1 = helpers['if'].call(depth0, "elicitation.widgetBeingEdited", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(72, program72, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    <div class=\"editor-box\">\r\n        ");
	  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widgetBeingEdited", options) : helperMissing.call(depth0, "outlet", "widgetBeingEdited", options))));
	  data.buffer.push("\r\n        ");
	  stack1 = helpers.unless.call(depth0, "elicitation.widgetBeingEdited", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(74, program74, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    </div>\r\n\r\n    ");
	  stack1 = helpers['if'].call(depth0, "elicitation.widgetBeingEdited", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(76, program76, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"phrase-definitions-view\">\r\n    <div class=\"editor-box phrase-definitions\">\r\n        <div class=\"editor-box-header\" title=\"Click to show the definition list\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "togglePopout", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">\r\n            <span>Definitions</span>\r\n        </div>\r\n        <div class=\"box-body slim-scrollbars\" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'class': ("view.showBody")
	  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(">\r\n            ");
	  stack1 = helpers.each.call(depth0, "phraseDefinition", "in", "elicitation.phraseDefinitions", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(81, program81, data),fn:self.program(78, program78, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            <p>\r\n                To add a definitional popup, use the syntax:<br/>\r\n                [[this phrase will have a popup]]\r\n                inside a label. Then you can edit <i>this phrase will have a popup</i> here.\r\n            </p>\r\n        </div>\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"widget-data-explorer\">\r\n    <div class=\"editor-box data-explorer\">\r\n        <div class=\"editor-box-header\">\r\n            <span>Data Tester</span>\r\n            <input type=\"submit\" value=\"Store Data\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "storeData", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(" />\r\n        </div>\r\n\r\n        ");
	  stack1 = helpers['if'].call(depth0, "view.data", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(88, program88, data),fn:self.program(83, program83, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n\r\n        ");
	  stack1 = helpers['if'].call(depth0, "view.errors", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(90, program90, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n\r\n        <div style=\"font-size: 75%; margin-top: 2em;\">WidgetID is: ");
	  stack1 = helpers._triageMustache.call(depth0, "view.widgetID", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</div>\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"editable-widget\">\r\n    ");
	  stack1 = helpers['if'].call(depth0, "elicitation.editMode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(93, program93, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.WidgetViewWrapper", {hash:{
	    'currentViewBinding': ("view.content")
	  },hashTypes:{'currentViewBinding': "STRING"},hashContexts:{'currentViewBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"page\">\r\n    <div ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'class': (":page view.isVisible")
	  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" >\r\n        ");
	  stack1 = helpers['if'].call(depth0, "elicitation.editMode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(95, program95, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n\r\n        <div class=\"contents\">\r\n            ");
	  stack1 = helpers.each.call(depth0, "view.page.widgets", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(101, program101, data),fn:self.program(99, program99, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        </div>\r\n\r\n        <div class=\"footer\">\r\n            <div id=\"title\">\r\n                ");
	  stack1 = helpers.unless.call(depth0, "elicitation.editMode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(106, program106, data),fn:self.program(104, program104, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            </div>\r\n            <div id=\"navigation\">\r\n                ");
	  stack1 = helpers['if'].call(depth0, "view.page.isCurrentPage", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(114, program114, data),fn:self.program(108, program108, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            </div>\r\n\r\n            <div class=\"counter\">\r\n                ");
	  stack1 = helpers['if'].call(depth0, "elicitation.editMode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(116, program116, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                <span class=\"page-num\">");
	  stack1 = helpers._triageMustache.call(depth0, "view.page.pageNum", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</span>\r\n                of ");
	  stack1 = helpers._triageMustache.call(depth0, "elicitation.pagesController.numPages", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n    ");
	  stack1 = helpers['if'].call(depth0, "elicitation.editMode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(118, program118, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n</script>");
	  return buffer;
	  
	});

/***/ },
/* 28 */
/***/ function(module, exports) {

	Ember.TEMPLATES["widgets"] = Ember.HTMLBars.template(function anonymous(Handlebars,depth0,helpers,partials,data
	/**/) {
	this.compilerInfo = [4,'>= 1.0.0'];
	helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
	  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

	function program1(depth0,data) {
	  
	  
	  data.buffer.push("\r\n        <div id=\"optionallabel\">optional</div>\r\n        ");
	  }

	function program3(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n        <td class=\"choice\">\r\n            <label>\r\n                ");
	  stack1 = helpers['if'].call(depth0, "cell.radioButton", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n\r\n                ");
	  stack1 = helpers['if'].call(depth0, "cell.checkBox", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n\r\n                ");
	  stack1 = helpers['if'].call(depth0, "cell.textEntry", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                \r\n                ");
	  stack1 = helpers['if'].call(depth0, "cell.dropDown", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("                          \r\n            </label>\r\n        </td>\r\n    ");
	  return buffer;
	  }
	function program4(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.RadioButton", {hash:{
	    'valueBinding': ("cell.choice")
	  },hashTypes:{'valueBinding': "STRING"},hashContexts:{'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                ");
	  return buffer;
	  }

	function program6(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Checkbox", {hash:{
	    'checkedBinding': ("cell.value")
	  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                ");
	  return buffer;
	  }

	function program8(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
	    'valueBinding': ("cell.value")
	  },hashTypes:{'valueBinding': "STRING"},hashContexts:{'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                ");
	  return buffer;
	  }

	function program10(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
	    'selectionBinding': ("cell.value"),
	    'contentBinding': ("cell.col.definition.dropDownChoices")
	  },hashTypes:{'selectionBinding': "STRING",'contentBinding': "STRING"},hashContexts:{'selectionBinding': depth0,'contentBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                ");
	  return buffer;
	  }

	function program12(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                        <th class=\"choice\">");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.MarkdownLabel", {hash:{
	    'contentBinding': ("col.definition.label"),
	    'elicitationBinding': ("view.elicitation")
	  },hashTypes:{'contentBinding': "STRING",'elicitationBinding': "STRING"},hashContexts:{'contentBinding': depth0,'elicitationBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("</th>\r\n                    ");
	  return buffer;
	  }

	function program14(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                <tfoot>\r\n                    <tr>\r\n                        <th></th>\r\n                        ");
	  stack1 = helpers.each.call(depth0, "col", "in", "view.data.table.cols", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(15, program15, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                    </tr>\r\n                </tfoot>\r\n            ");
	  return buffer;
	  }
	function program15(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                            <th class=\"choice\">");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.MarkdownLabel", {hash:{
	    'contentBinding': ("col.definition.label"),
	    'elicitationBinding': ("view.elicitation")
	  },hashTypes:{'contentBinding': "STRING",'elicitationBinding': "STRING"},hashContexts:{'contentBinding': depth0,'elicitationBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("</th>\r\n                        ");
	  return buffer;
	  }

	function program17(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.RowView", {hash:{
	    'rowBinding': ("row"),
	    'elicitationBinding': ("view.elicitation")
	  },hashTypes:{'rowBinding': "STRING",'elicitationBinding': "STRING"},hashContexts:{'rowBinding': depth0,'elicitationBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n            ");
	  return buffer;
	  }

	function program19(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.chipView", {hash:{
	    'contentBinding': ("chip")
	  },hashTypes:{'contentBinding': "STRING"},hashContexts:{'contentBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n    ");
	  return buffer;
	  }

	function program21(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.graphicView", {hash:{
	    'contentBinding': ("view.content")
	  },hashTypes:{'contentBinding': "STRING"},hashContexts:{'contentBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n    ");
	  return buffer;
	  }

	function program23(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n        <div class=\"cell-contents\">\r\n            <div class=\"locking-input\">\r\n                ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.allocatedTextField", {hash:{
	    'allocatedBinding': ("view.content.allocatedString"),
	    'precisionBinding': ("view.content.allocatedStringPrecision")
	  },hashTypes:{'allocatedBinding': "STRING",'precisionBinding': "STRING"},hashContexts:{'allocatedBinding': depth0,'precisionBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("<div class=\"lock-toggler\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleLocked", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(">\r\n                    <div ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'class': (":lock-button :ui-icon :ui-icon-locked view.content.locked")
	  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" title=\"Lock this allocation, so it isn't modified automatically when you change sums\"></div>\r\n                    <div class=\"click-catcher\"></div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    ");
	  return buffer;
	  }

	function program25(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    <th>");
	  stack1 = helpers._triageMustache.call(depth0, "col.definition.label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</th>\r\n                ");
	  return buffer;
	  }

	function program27(depth0,data) {
	  
	  
	  data.buffer.push("\r\n                    <th></th>\r\n                ");
	  }

	function program29(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                <tr>\r\n                    <th>");
	  stack1 = helpers._triageMustache.call(depth0, "row.definition.label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</th>\r\n                    ");
	  stack1 = helpers.each.call(depth0, "cell", "in", "row.cells", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(30, program30, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                    ");
	  stack1 = helpers['if'].call(depth0, "view.showRowSums", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(32, program32, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                </tr>\r\n            ");
	  return buffer;
	  }
	function program30(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.cellView", {hash:{
	    'contentBinding': ("cell"),
	    'class': ("plain")
	  },hashTypes:{'contentBinding': "STRING",'class': "STRING"},hashContexts:{'contentBinding': depth0,'class': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                    ");
	  return buffer;
	  }

	function program32(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.summationCellView", {hash:{
	    'labelBinding': ("row.definition.label"),
	    'contentBinding': ("row"),
	    'class': ("sum col")
	  },hashTypes:{'labelBinding': "STRING",'contentBinding': "STRING",'class': "STRING"},hashContexts:{'labelBinding': depth0,'contentBinding': depth0,'class': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                    ");
	  return buffer;
	  }

	function program34(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                <tr>\r\n                    <th></th>\r\n                    ");
	  stack1 = helpers.each.call(depth0, "col", "in", "view.data.table.cols", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(35, program35, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                    ");
	  stack1 = helpers['if'].call(depth0, "view.showRowSums", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(37, program37, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                </tr>\r\n            ");
	  return buffer;
	  }
	function program35(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.summationCellView", {hash:{
	    'labelBinding': ("col.definition.label"),
	    'contentBinding': ("col"),
	    'class': ("sum row")
	  },hashTypes:{'labelBinding': "STRING",'contentBinding': "STRING",'class': "STRING"},hashContexts:{'labelBinding': depth0,'contentBinding': depth0,'class': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                    ");
	  return buffer;
	  }

	function program37(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.summationCellView", {hash:{
	    'label': ("Total"),
	    'contentBinding': ("view.data.table"),
	    'class': ("sum row col total")
	  },hashTypes:{'label': "STRING",'contentBinding': "STRING",'class': "STRING"},hashContexts:{'label': depth0,'contentBinding': depth0,'class': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                    ");
	  return buffer;
	  }

	function program39(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                <i>");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.unitPrefix", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.totalAllocation", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.unitSuffix", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push(" fully allocated.</i>\r\n            ");
	  return buffer;
	  }

	function program41(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                <a href=\"#\" class=\"scale-to-total\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "scaleToTotal", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push(">Scale your allocation</a>\r\n                from ");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.unitPrefix", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  stack1 = helpers._triageMustache.call(depth0, "view.data.allocatedString", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.unitSuffix", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push(" to ");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.unitPrefix", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.totalAllocation", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.unitSuffix", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            ");
	  return buffer;
	  }

	function program43(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n            <div class=\"choice\">\r\n                <label>\r\n                    <input type=\"radio\" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'value': ("choice.label")
	  },hashTypes:{'value': "STRING"},hashContexts:{'value': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" name=\"multiple-choice-");
	  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.multipleChoiceNum", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\">\r\n                    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.MarkdownLabel", {hash:{
	    'contentBinding': ("choice.label"),
	    'elicitationBinding': ("view.elicitation")
	  },hashTypes:{'contentBinding': "STRING",'elicitationBinding': "STRING"},hashContexts:{'contentBinding': depth0,'elicitationBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                </label>\r\n            </div>\r\n        ");
	  return buffer;
	  }

	function program45(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n            <div class=\"choice writein\">\r\n                <label>\r\n                    <input type=\"radio\" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'value': ("view.data.writein")
	  },hashTypes:{'value': "STRING"},hashContexts:{'value': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" name=\"multiple-choice-");
	  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.multipleChoiceNum", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\">\r\n                    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
	    'valueBinding': ("view.data.writein"),
	    'placeholder': ("Write-in another answer")
	  },hashTypes:{'valueBinding': "STRING",'placeholder': "STRING"},hashContexts:{'valueBinding': depth0,'placeholder': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                </label>\r\n            </div>\r\n        ");
	  return buffer;
	  }

	function program47(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n            <a ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'href': ("view.linkToURL")
	  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" target=\"_blank\">\r\n                <img ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'class': ("view.definition.thumbnail")
	  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'src': ("view.imageURL")
	  },hashTypes:{'src': "STRING"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push("/>\r\n            </a>\r\n        ");
	  return buffer;
	  }

	function program49(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n            <div class=\"no-image\">");
	  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.imageMissingMessage", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("</div>\r\n        ");
	  return buffer;
	  }

	function program51(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n            <div class=\"caption\">\r\n                ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.MarkdownLabel", {hash:{
	    'contentBinding': ("view.definition.label"),
	    'elicitationBinding': ("view.elicitation")
	  },hashTypes:{'contentBinding': "STRING",'elicitationBinding': "STRING"},hashContexts:{'contentBinding': depth0,'elicitationBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n            </div>\r\n        ");
	  return buffer;
	  }

	function program53(depth0,data) {
	  
	  var buffer = '', helper, options;
	  data.buffer.push("\r\n            ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "area-allocation-row", options) : helperMissing.call(depth0, "partial", "area-allocation-row", options))));
	  data.buffer.push("\r\n        ");
	  return buffer;
	  }

	function program55(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n            <div id=\"label-holder\">\r\n                <div id=\"label\">");
	  stack1 = helpers._triageMustache.call(depth0, "label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</div>\r\n            </div>\r\n        ");
	  return buffer;
	  }

	function program57(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("<div class=\"col\" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'value': ("value")
	  },hashTypes:{'value': "STRING"},hashContexts:{'value': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'dataKey': ("dataKey")
	  },hashTypes:{'dataKey': "STRING"},hashContexts:{'dataKey': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" >\r\n                    <div id=\"contents\">\r\n                        <div id=\"percent\"></div>\r\n                        <div id=\"vertical-aligner\">\r\n                            <div id=\"label\"><span id=\"measurer\">");
	  stack1 = helpers._triageMustache.call(depth0, "label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</span></div>\r\n                        </div>\r\n                    </div>\r\n                </div><div class=\"coldragger\" style=\"\"></div>");
	  return buffer;
	  }

	function program59(depth0,data) {
	  
	  
	  data.buffer.push("\r\n                    <div id=\"action\">Done!</div>\r\n                    You can adjust the box plot by dragging.\r\n                ");
	  }

	function program61(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    <div id=\"action\">Click the axis:</div>\r\n		            <div id=\"questions\">\r\n			            <li key=\"_0th\" class=\"current\">");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.label_0th", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</li>\r\n			            <li key=\"_100th\">");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.label_100th", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</li>\r\n			            <li key=\"_25th\">");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.label_25th", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</li>\r\n			            <li key=\"_75th\">");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.label_75th", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</li>\r\n			            <li key=\"_50th\">");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.label_50th", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</li>\r\n		            </div>\r\n                ");
	  return buffer;
	  }

	function program63(depth0,data) {
	  
	  
	  data.buffer.push("\r\n                Done! You can drag elements to adjust your answer\r\n            ");
	  }

	function program65(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                Click the axis to define the <b>");
	  stack1 = helpers._triageMustache.call(depth0, "view.currentQuestionText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</b>\r\n            ");
	  return buffer;
	  }

	function program67(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n		    <canvas id=\"axis\"></canvas>\r\n		    <div id=\"axis-label\">");
	  stack1 = helpers._triageMustache.call(depth0, "view.parentView.definition.axisLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</div>\r\n		\r\n		    <div id=\"whiskers\"><div id=\"line\"></div></div>\r\n		    <div id=\"box\"></div>\r\n		    <div id=\"median\"></div>\r\n            ");
	  stack1 = helpers.unless.call(depth0, "view.parentView.doneClicking", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(68, program68, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        ");
	  return buffer;
	  }
	function program68(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n		        <div id=\"mouse-cursor\"><span id=\"value\">");
	  stack1 = helpers._triageMustache.call(depth0, "view.parentView.currentQuestionText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</span></div>\r\n            ");
	  return buffer;
	  }

	function program70(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n            ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
	    'valueBinding': ("label"),
	    'placeholder': ("Describe your new card")
	  },hashTypes:{'valueBinding': "STRING",'placeholder': "STRING"},hashContexts:{'valueBinding': depth0,'placeholder': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n        ");
	  return buffer;
	  }

	function program72(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n            <span class=\"phrase\">");
	  stack1 = helpers._triageMustache.call(depth0, "label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</span>\r\n        ");
	  return buffer;
	  }

	function program74(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.CardRankCard", {hash:{
	    'contentBinding': ("this")
	  },hashTypes:{'contentBinding': "STRING"},hashContexts:{'contentBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n    ");
	  return buffer;
	  }

	function program76(depth0,data) {
	  
	  
	  data.buffer.push("\r\n            <span class=\"optional-indicator\">Optional:</span>\r\n        ");
	  }

	function program78(depth0,data) {
	  
	  
	  data.buffer.push("\r\n            You may return cards here.\r\n        ");
	  }

	function program80(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n            ");
	  stack1 = helpers['if'].call(depth0, "view.content.allowOnlyOneCard", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(83, program83, data),fn:self.program(81, program81, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        ");
	  return buffer;
	  }
	function program81(depth0,data) {
	  
	  
	  data.buffer.push("\r\n                Drag a card here.\r\n            ");
	  }

	function program83(depth0,data) {
	  
	  
	  data.buffer.push("\r\n                Drag one or more cards here.\r\n            ");
	  }

	function program85(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                        <input type=\"submit\" class=\"add-writein-card\" ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addAWriteInCard", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
	  data.buffer.push(" value=\"Add a Write-In Card\"/>\r\n                    ");
	  return buffer;
	  }

	function program87(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                            <tr valign=\"bottom\">\r\n                                <th rowspan=\"2\" width=\"100%\"><div><i>");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.topLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</i></div></th>\r\n                                <td ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'colspan': ("view.definition.radioButtons.length")
	  },hashTypes:{'colspan': "STRING"},hashContexts:{'colspan': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" class=\"radio-button-header\">");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.radioButtonLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</td>\r\n                            </tr>\r\n                            <tr valign=\"bottom\">\r\n                                ");
	  stack1 = helpers.each.call(depth0, "view.definition.radioButtons", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(88, program88, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                            </tr>\r\n                        ");
	  return buffer;
	  }
	function program88(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                                    <td class=\"radio-button-label\">");
	  stack1 = helpers._triageMustache.call(depth0, "label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</td>\r\n                                ");
	  return buffer;
	  }

	function program90(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                            <tr><th><div><i>");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.topLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</i></div></th></tr>\r\n                        ");
	  return buffer;
	  }

	function program92(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                            <tr>\r\n                                <td width=\"100%\">\r\n                                    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.CardRankContainer", {hash:{
	    'contentBinding': ("container")
	  },hashTypes:{'contentBinding': "STRING"},hashContexts:{'contentBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                                </td>\r\n                                ");
	  stack1 = helpers['if'].call(depth0, "view.definition.enableRadioButtonsOnDropTargets", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(93, program93, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                            </tr>\r\n                        ");
	  return buffer;
	  }
	function program93(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                                    ");
	  stack1 = helpers.each.call(depth0, "view.definition.radioButtons", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(94, program94, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                                ");
	  return buffer;
	  }
	function program94(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                                        <td class=\"radio-button\">\r\n                                            <input type=\"radio\" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'title': ("label")
	  },hashTypes:{'title': "STRING"},hashContexts:{'title': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" name=\"card-rank-radio-");
	  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "container.multipleChoiceNum", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'value': ("dataKey")
	  },hashTypes:{'value': "STRING"},hashContexts:{'value': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" />\r\n                                        </td>\r\n                                    ");
	  return buffer;
	  }

	function program96(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                        <th>");
	  stack1 = helpers._triageMustache.call(depth0, "label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</th>\r\n                    ");
	  return buffer;
	  }

	function program98(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                <tr>\r\n                    ");
	  stack1 = helpers['with'].call(depth0, "", "as", "row", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(99, program99, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                </tr>\r\n                ");
	  return buffer;
	  }
	function program99(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                        ");
	  stack1 = helpers.each.call(depth0, "columns", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(100, program100, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                    ");
	  return buffer;
	  }
	function program100(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                            <td>");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.TabularInputTextField", {hash:{
	    'valueBinding': ("text"),
	    'widgetBinding': ("view"),
	    'rowBinding': ("row")
	  },hashTypes:{'valueBinding': "STRING",'widgetBinding': "STRING",'rowBinding': "STRING"},hashContexts:{'valueBinding': depth0,'widgetBinding': depth0,'rowBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("</td>\r\n                        ");
	  return buffer;
	  }

	function program102(depth0,data) {
	  
	  var buffer = '', helper, options;
	  data.buffer.push("\r\n            ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "uncertainty-range-slider", options) : helperMissing.call(depth0, "partial", "uncertainty-range-slider", options))));
	  data.buffer.push("\r\n        ");
	  return buffer;
	  }

	function program104(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    <div class=\"tickmark center\"><div class=\"line\">&nbsp;</div>");
	  stack1 = helpers._triageMustache.call(depth0, "view.data.text", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</div>\r\n                    <div class=\"tickmark min-label\"><div class=\"line\">&nbsp;</div>");
	  stack1 = helpers._triageMustache.call(depth0, "view.uncertaintyRangeMin", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</div>\r\n                    <div class=\"tickmark max-label\"><div class=\"line\">&nbsp;</div>");
	  stack1 = helpers._triageMustache.call(depth0, "view.uncertaintyRangeMax", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</div>\r\n                ");
	  return buffer;
	  }

	function program106(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n    <div class=\"label\">");
	  stack1 = helpers._triageMustache.call(depth0, "label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</div>\r\n");
	  return buffer;
	  }

	function program108(depth0,data) {
	  
	  
	  data.buffer.push("\r\n    <div class=\"drag-me\">Drag Me</div>\r\n");
	  }

	function program110(depth0,data) {
	  
	  
	  data.buffer.push("\r\n    <div class=\"dragger\"> </div>\r\n");
	  }

	function program112(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    <span ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'class': (":series-name isCurrentSeries complete")
	  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'style': ("labelStyle")
	  },hashTypes:{'style': "STRING"},hashContexts:{'style': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'title': ("title")
	  },hashTypes:{'title': "STRING"},hashContexts:{'title': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(">");
	  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</span>\r\n                ");
	  return buffer;
	  }

	function program114(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                ");
	  stack1 = helpers.view.call(depth0, "EAT.TimeTrendSeriesView", {hash:{
	    'seriesBinding': ("this"),
	    'frameBinding': ("view.frame")
	  },hashTypes:{'seriesBinding': "STRING",'frameBinding': "STRING"},hashContexts:{'seriesBinding': depth0,'frameBinding': depth0},inverse:self.noop,fn:self.program(115, program115, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            ");
	  return buffer;
	  }
	function program115(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                    ");
	  stack1 = helpers.each.call(depth0, "reversePoints", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(116, program116, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                ");
	  return buffer;
	  }
	function program116(depth0,data) {
	  
	  var buffer = '';
	  data.buffer.push("\r\n                        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.TimeTrendPointView", {hash:{
	    'pointBinding': ("this"),
	    'frameBinding': ("view.frame")
	  },hashTypes:{'pointBinding': "STRING",'frameBinding': "STRING"},hashContexts:{'pointBinding': depth0,'frameBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                    ");
	  return buffer;
	  }

	function program118(depth0,data) {
	  
	  var buffer = '', stack1;
	  data.buffer.push("\r\n                <div class=\"status\">\r\n                    ");
	  stack1 = helpers._triageMustache.call(depth0, "view.frame.pointBeingDraggedYStatus", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                </div>\r\n            ");
	  return buffer;
	  }

	  data.buffer.push("<script type=\"text/x-handlebars\" data-template-name=\"text-area\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n    <div class=\"widget text-area\">\r\n        ");
	  stack1 = helpers['if'].call(depth0, "view.definition.optional", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
	    'placeholderBinding': ("view.definition.placeholder"),
	    'rowsBinding': ("view.definition.numRows"),
	    'valueBinding': ("view.data.text")
	  },hashTypes:{'placeholderBinding': "STRING",'rowsBinding': "STRING",'valueBinding': "STRING"},hashContexts:{'placeholderBinding': depth0,'rowsBinding': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"multiple-choice-table-row\">\r\n    <td class=\"row-label\">");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.MarkdownLabel", {hash:{
	    'contentBinding': ("row.definition.label"),
	    'elicitationBinding': ("view.elicitation")
	  },hashTypes:{'contentBinding': "STRING",'elicitationBinding': "STRING"},hashContexts:{'contentBinding': depth0,'elicitationBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push(" ");
	  stack1 = helpers._triageMustache.call(depth0, "view.fetchMe", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</td>\r\n    ");
	  stack1 = helpers.each.call(depth0, "cell", "in", "row.cells", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"multiple-choice-table\">\r\n    <div class=\"widget multiple-choice-table\">\r\n        ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n        <table width=\"100%\">\r\n            <thead>\r\n                <tr>\r\n                    <th></th>\r\n                    ");
	  stack1 = helpers.each.call(depth0, "col", "in", "view.data.table.cols", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                </tr>\r\n            </thead>\r\n    \r\n            ");
	  stack1 = helpers['if'].call(depth0, "view.showTableFooter", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n\r\n            <tbody>\r\n            ");
	  stack1 = helpers.each.call(depth0, "row", "in", "view.data.table.reorderedRows", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(17, program17, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            </tbody>\r\n        </table>\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"allocation-table-cell-chips\">\r\n    ");
	  stack1 = helpers.each.call(depth0, "chip", "in", "view.content.chips", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(19, program19, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"allocation-table-cell-graphic\">\r\n    <div class=\"dragtest\">\r\n\r\n    </div>\r\n    <div class=\"graphic\" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'style': ("view.graphicStyle")
	  },hashTypes:{'style': "STRING"},hashContexts:{'style': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(">\r\n            <div class=\"oversize\">");
	  stack1 = helpers._triageMustache.call(depth0, "view.content.allocatedString", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</div>\r\n    </div>\r\n</script>\r\n\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"allocation-table-cell\">\r\n    ");
	  stack1 = helpers['if'].call(depth0, "view.graphicalInput", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(23, program23, data),fn:self.program(21, program21, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"allocation-table\">\r\n    <div class=\"widget allocation-table\">\r\n        <label class=\"switch-to-graphical-input\">\r\n            ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Checkbox", {hash:{
	    'checkedBinding': ("view.data.graphicalInput")
	  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n            Experimental graphical input\r\n        </label>\r\n\r\n        ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n\r\n\r\n        <table cellpadding=\"0\" cellspacing=\"0\">\r\n            <thead>\r\n            <tr>\r\n                <th>\r\n                </th>\r\n                ");
	  stack1 = helpers.each.call(depth0, "col", "in", "view.data.table.cols", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(25, program25, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                ");
	  stack1 = helpers['if'].call(depth0, "view.showRowSums", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(27, program27, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            </tr>\r\n            </thead>\r\n            <tbody>\r\n            ");
	  stack1 = helpers.each.call(depth0, "row", "in", "view.data.table.rows", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(29, program29, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            ");
	  stack1 = helpers['if'].call(depth0, "view.showColSums", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(34, program34, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            </tbody>\r\n        </table>\r\n        <p style=\"font-size: 80%\">\r\n            ");
	  stack1 = helpers['if'].call(depth0, "view.data.fullyAllocated", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(41, program41, data),fn:self.program(39, program39, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        </p>\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"agree-disagree\">\r\n    <div class=\"widget agree-disagree\">\r\n        <div id=\"statement\">");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.MarkdownLabel", {hash:{
	    'contentBinding': ("view.definition.label"),
	    'elicitationBinding': ("view.elicitation")
	  },hashTypes:{'contentBinding': "STRING",'elicitationBinding': "STRING"},hashContexts:{'contentBinding': depth0,'elicitationBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("</div>\r\n        <div class=\"radiobox\">\r\n            <label><input type=\"radio\" value=\"agree\" name=\"agreeDisagree");
	  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.agreeDisagreeNum", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\">I agree</label> \r\n            <label><input type=\"radio\" value=\"disagree\" name=\"agreeDisagree");
	  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.agreeDisagreeNum", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\">I disagree</label>\r\n        </div>\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"multiple-choice\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n    <div class=\"widget multiple-choice\">\r\n        ");
	  stack1 = helpers.each.call(depth0, "choice", "in", "view.definition.choices", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(43, program43, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        ");
	  stack1 = helpers['if'].call(depth0, "view.definition.writein", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(45, program45, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"image\">\r\n    <div ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'class': (":widget :image view.definition.alignCenter")
	  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(">\r\n        ");
	  stack1 = helpers['if'].call(depth0, "view.imageURL", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(49, program49, data),fn:self.program(47, program47, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        ");
	  stack1 = helpers['if'].call(depth0, "view.definition.label", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(51, program51, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"likert\">\r\n    <div class=\"widget likert\">\r\n        ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n        <table class=\"degrees\">\r\n            <tr>\r\n                <td><label>");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.stronglyNegativeLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("<br /><input type=\"radio\" value=\"stronglynegative\" name=\"likert");
	  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.likertNum", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\"></label></td>\r\n                <td><label>");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.negativeLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("<br /><input type=\"radio\" value=\"negative\" name=\"likert");
	  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.likertNum", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\"></label></td>\r\n                <td><label>");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.neutralLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("<br /><input type=\"radio\" value=\"neutral\" name=\"likert");
	  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.likertNum", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\"></label></td>\r\n                <td><label>");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.positiveLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("<br /><input type=\"radio\" value=\"positive\" name=\"likert");
	  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.likertNum", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\"></label></td>\r\n                <td><label>");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.stronglyPositiveLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("<br /><input type=\"radio\" value=\"stronglypositive\" name=\"likert");
	  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.likertNum", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\"></label></td>\r\n            </tr>\r\n        </table>\r\n    </div>\r\n</script>\r\n\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"area-allocation\">\r\n    <div class=\"widget area-allocation\">\r\n        <i style=\"display: block; background-color: #f00; color: white; padding: 10px; font-size: 120%\">\r\n            WARNING: the area allocation widget is deprecated, and will soon be removed. If the \"allocation table\" widget is NOT\r\n            a suitable replacement, please contact me ASAP. <br/>-<a href=\"mailto:snickell@gmail.com\">Seth</a>\r\n        </i>\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"new-area-allocation\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n    <div class=\"widget area-allocation\">\r\n        ");
	  stack1 = helpers.each.call(depth0, "view.definition.rows", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(53, program53, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"area-allocation-row\">\r\n    <div class=\"row\" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'color': ("color")
	  },hashTypes:{'color': "STRING"},hashContexts:{'color': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'dataKey': ("dataKey")
	  },hashTypes:{'dataKey': "STRING"},hashContexts:{'dataKey': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" >\r\n        ");
	  stack1 = helpers['if'].call(depth0, "label", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(55, program55, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        <div class=\"colbox\" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'style': ("style")
	  },hashTypes:{'style': "STRING"},hashContexts:{'style': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(">\r\n            ");
	  stack1 = helpers.each.call(depth0, "cols", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(57, program57, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        </div>\r\n        <div id=\"percent\"></div>\r\n    </div>\r\n    <div class='rowdragger'></div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"old-area-allocation\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n    <div class=\"widget area\">\r\n        ");
	  stack1 = helpers.each.call(depth0, "view.definition.rows", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(53, program53, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    </div>\r\n</script>\r\n<script type=\"text/x-handlebars\" data-template-name=\"old-area-allocation-row\">\r\n    <div class=\"row\" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'color': ("color")
	  },hashTypes:{'color': "STRING"},hashContexts:{'color': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'dataKey': ("dataKey")
	  },hashTypes:{'dataKey': "STRING"},hashContexts:{'dataKey': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" >\r\n        ");
	  stack1 = helpers['if'].call(depth0, "label", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(55, program55, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        <div class=\"colbox\" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'style': ("style")
	  },hashTypes:{'style': "STRING"},hashContexts:{'style': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(">\r\n            ");
	  stack1 = helpers.each.call(depth0, "cols", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(57, program57, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        </div>\r\n        <div id=\"percent\"></div>\r\n    </div>\r\n    <div class='rowdragger'></div>\r\n</script>\r\n\r\n\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"box-and-whiskers\">\r\n    <div class=\"widget box-and-whiskers\">\r\n        <div id=\"instructions-and-label\">\r\n            <div id=\"instructions\">\r\n                ");
	  stack1 = helpers['if'].call(depth0, "view.doneClicking", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(61, program61, data),fn:self.program(59, program59, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            </div>\r\n            ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n            <div class=\"clear-float\"></div>\r\n        </div>\r\n        <div id=\"instruction\" style=\"display: none\">\r\n            ");
	  stack1 = helpers['if'].call(depth0, "view.doneClicking", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(65, program65, data),fn:self.program(63, program63, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        </div>\r\n        ");
	  stack1 = helpers.view.call(depth0, "view.BoxPlotSubView", {hash:{
	    'boxAndWhiskersBinding': ("view")
	  },hashTypes:{'boxAndWhiskersBinding': "STRING"},hashContexts:{'boxAndWhiskersBinding': depth0},inverse:self.noop,fn:self.program(67, program67, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    </div>\r\n\r\n    <div class=\"DEBUG\">\r\n        Location: ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
	    'valueBinding': ("view.location")
	  },hashTypes:{'valueBinding': "STRING"},hashContexts:{'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push(" <div id=\"location-slider\"></div><br/>\r\n        Scale: ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
	    'valueBinding': ("view.scale")
	  },hashTypes:{'valueBinding': "STRING"},hashContexts:{'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push(" <div id=\"scale-slider\"></div><br/>\r\n        Shape: ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
	    'valueBinding': ("view.shape")
	  },hashTypes:{'valueBinding': "STRING"},hashContexts:{'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push(" <div id=\"shape-slider\"></div>\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"card-rank-card\">\r\n    <div ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'class': (":card hasDefinition:defined-term")
	  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'dataKey': ("dataKey")
	  },hashTypes:{'dataKey': "STRING"},hashContexts:{'dataKey': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(" ");
	  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
	    'title': ("popup")
	  },hashTypes:{'title': "STRING"},hashContexts:{'title': depth0},contexts:[],types:[],data:data})));
	  data.buffer.push(">\r\n        ");
	  stack1 = helpers['if'].call(depth0, "writein", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(72, program72, data),fn:self.program(70, program70, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"card-rank-container\">\r\n    ");
	  stack1 = helpers.each.call(depth0, "view.content.cards", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(74, program74, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    <div class='instruction-card'>\r\n        ");
	  stack1 = helpers['if'].call(depth0, "view.content.optional", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(76, program76, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        ");
	  stack1 = helpers['if'].call(depth0, "view.content.initial", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(80, program80, data),fn:self.program(78, program78, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"card-rank\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n    <div class=\"widget card-rank\">\r\n        <table class=\"everything\">\r\n            <tr valign=\"top\">\r\n                <td class=\"initial-cards-column\">\r\n                    ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.CardRankContainer", {hash:{
	    'contentBinding': ("view.definition.initialCardsContainer")
	  },hashTypes:{'contentBinding': "STRING"},hashContexts:{'contentBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n\r\n                    ");
	  stack1 = helpers['if'].call(depth0, "view.definition.allowWriteInCards", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(85, program85, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                </td>\r\n                <td align=\"center\" width=\"100%\">\r\n                    <table class=\"drop-targets\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\r\n                        ");
	  stack1 = helpers['if'].call(depth0, "view.definition.enableRadioButtonsOnDropTargets", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(90, program90, data),fn:self.program(87, program87, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                        ");
	  stack1 = helpers.each.call(depth0, "container", "in", "view.definition.containers", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(92, program92, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                        <tr>\r\n                            <th rowspan=\"2\">\r\n                                <div><i>");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.bottomLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</i></div>\r\n                            </th>\r\n                        </tr>\r\n                    </table>\r\n                </td>\r\n\r\n            </tr>\r\n        </table>\r\n        <div class=\"draggable-parent\"></div>\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"dropdown\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n    <div class=\"widget dropdown\">\r\n        <span class=\"outline\">\r\n            ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
	    'contentBinding': ("view.selections"),
	    'promptBinding': ("view.definition.placeholder"),
	    'selectionBinding': ("view.data.selection")
	  },hashTypes:{'contentBinding': "STRING",'promptBinding': "STRING",'selectionBinding': "STRING"},hashContexts:{'contentBinding': depth0,'promptBinding': depth0,'selectionBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n        </span>\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"paragraph\">\r\n    <div class=\"widget paragraph\">\r\n        ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n    </div>\r\n</script>\r\n\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"slider-allocation\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n    <div class=\"widget zero-sum-slider\">\r\n        <div valign='bottom' id='leftLabel'>\r\n            ");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.leftLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            <div id='value'>");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.unitPrefix", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  stack1 = helpers._triageMustache.call(depth0, "view.data.leftValue", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.unitSuffix", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</div>\r\n        </div>\r\n\r\n        <div valign='bottom' id='rightLabel'>\r\n            ");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.rightLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            <div id='value'>");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.unitPrefix", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  stack1 = helpers._triageMustache.call(depth0, "view.data.rightValue", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.unitSuffix", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</div>\r\n        </div>\r\n\r\n        <div id='slider' valign='bottom' width='100%'>\r\n            <div id='jquery-slider'></div>\r\n        </div>\r\n    </div>\r\n</script>\r\n\r\n\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"tabular-input\">\r\n    <div class=\"widget tabular-input\">\r\n        ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n        <table>\r\n            <thead>\r\n                <tr valign=\"bottom\">\r\n                    ");
	  stack1 = helpers.each.call(depth0, "view.definition.columns", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(96, program96, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n                </tr>\r\n            </thead>\r\n            <tbody>\r\n                ");
	  stack1 = helpers.each.call(depth0, "view.data.rows", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(98, program98, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            </tbody>\r\n        </table>\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"text-box\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n    <div class=\"widget text-box\">\r\n        <div class=\"answer-box\">\r\n            ");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.unitPrefix", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
	    'classNames': ("answer"),
	    'valueBinding': ("view.data.text")
	  },hashTypes:{'classNames': "STRING",'valueBinding': "STRING"},hashContexts:{'classNames': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n            ");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.unitSuffix", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n        </div>\r\n        ");
	  stack1 = helpers['if'].call(depth0, "view.definition.askForUncertaintyRange", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(102, program102, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"uncertainty-range-slider\">\r\n    <div class=\"prompt\">");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.MarkdownLabel", {hash:{
	    'contentBinding': ("view.definition.uncertaintyRangeLabel"),
	    'elicitationBinding': ("view.elicitation")
	  },hashTypes:{'contentBinding': "STRING",'elicitationBinding': "STRING"},hashContexts:{'contentBinding': depth0,'elicitationBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("</div>\r\n    <div class='uncertainty-range'>\r\n        <div id='slider'>\r\n            <div id='jquery-slider'>\r\n\r\n                ");
	  stack1 = helpers['if'].call(depth0, "view.uncertaintyRangeMin", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(104, program104, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n\r\n                <a class=\"ui-slider-handle ui-state-default ui-corner-left\" href=\"#\" >\r\n                    <div class=\"label\">");
	  stack1 = helpers._triageMustache.call(depth0, "view.data.uncertaintyRangeLower", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</div>\r\n                </a>\r\n                <a class=\"ui-slider-handle ui-state-default ui-corner-right\" href=\"#\" >\r\n                    <div class=\"label\">");
	  stack1 = helpers._triageMustache.call(depth0, "view.data.uncertaintyRangeUpper", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</div>\r\n                </a>\r\n\r\n            </div>\r\n        </div>\r\n    </div>\r\n</script>\r\n\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"time-trend-point\">\r\n");
	  stack1 = helpers['if'].call(depth0, "label", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(106, program106, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n");
	  stack1 = helpers['if'].call(depth0, "isNextUndefinedPoint", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(108, program108, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n");
	  stack1 = helpers.unless.call(depth0, "fixedValue", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(110, program110, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n<div class=\"dot\"> </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"time-trend\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n    <div class=\"widget time-trend\">\r\n	    <div class=\"frame\">\r\n            <div class=\"series-names\">\r\n                ");
	  stack1 = helpers.each.call(depth0, "view.frame.series", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(112, program112, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n            </div>\r\n            <div class=\"value-axis-label-clipping\">\r\n                <div class=\"value-axis-label-holder\">\r\n                    <div class=\"value-axis-label\">\r\n                        ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.MarkdownLabel", {hash:{
	    'contentBinding': ("view.definition.valueAxisLabel"),
	    'elicitationBinding': ("view.elicitation")
	  },hashTypes:{'contentBinding': "STRING",'elicitationBinding': "STRING"},hashContexts:{'contentBinding': depth0,'elicitationBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n                    </div>\r\n                </div>\r\n            </div>\r\n		    <canvas id=\"axis\"></canvas>\r\n            <canvas id=\"lines\"></canvas>\r\n            ");
	  stack1 = helpers.each.call(depth0, "view.frame.series", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(114, program114, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n\r\n            ");
	  stack1 = helpers['if'].call(depth0, "view.frame.aPointIsBeingDragged", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(118, program118, data),contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n	    </div>\r\n        <div class=\"time-axis-label\">\r\n            ");
	  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EAT.MarkdownLabel", {hash:{
	    'contentBinding': ("view.definition.timeAxisLabel"),
	    'elicitationBinding': ("view.elicitation")
	  },hashTypes:{'contentBinding': "STRING",'elicitationBinding': "STRING"},hashContexts:{'contentBinding': depth0,'elicitationBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
	  data.buffer.push("\r\n        </div>\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"custom-scripting\">\r\n    <div class=\"widget custom-scripting\">\r\n        <b>Custom Script: </b>");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("\r\n\r\n\r\n        <div class=\"script-editor-box\">\r\n            <h3>\r\n                BeforeEnteringPage(api, unsupported) \r\n                <button ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "testEventHandler", "beforeEnteringPage", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
	  data.buffer.push(">Run Script</button>\r\n            </h3>\r\n            <div><div class=\"script-editor\" id=\"beforeEnteringPage\"></div></div>\r\n\r\n\r\n            <h3>\r\n                BeforeExitingPage(api, unsupported)\r\n                <button ");
	  data.buffer.push(escapeExpression(helpers.action.call(depth0, "testEventHandler", "beforeExitingPage", {hash:{
	    'target': ("view")
	  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
	  data.buffer.push(">Run Script</button>\r\n            </h3>\r\n            <div><div class=\"script-editor\" id=\"beforeExitingPage\"></div></div>\r\n        </div>\r\n\r\n\r\n    </div>\r\n</script>\r\n\r\n<script type=\"text/x-handlebars\" data-template-name=\"iea-wind-lcoe\">\r\n    ");
	  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "widget-label", options) : helperMissing.call(depth0, "partial", "widget-label", options))));
	  data.buffer.push("\r\n\r\n    <div class=\"widget iea-wind-lcoe\" ng-controller=\"calcController\">\r\n\r\n        <p>");
	  stack1 = helpers._triageMustache.call(depth0, "label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("</p>\r\n\r\n        <form class=\"form-horizontal lcoe-calculator-form\">\r\n            <!-- CapEx -->\r\n            <div class=\"form-group\">\r\n                <label class=\"col-xs-3 control-label\">\r\n                    Total capital costs (");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.currPrefix", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("/kW):\r\n                </label>\r\n                <div class=\"col-xs-1\">\r\n                    <input type=\"text\" class=\"form-control\" ng-model=\"cap_ex\" enabled />\r\n                </div>\r\n                <div class=\"col-xs-5 bg-info\" style=\"padding: 5px; color: #000\" id=\"slider-capex\">\r\n                    <rzslider rz-slider-model=\"cap_ex\" rz-slider-floor=\"cap_ex_min\" rz-slider-ceil=\"cap_ex_max\" rz-slider-step=\"50\" rz-slider-translate=\"translateKW\"></rzslider>\r\n                </div>\r\n            </div>\r\n\r\n            <!-- OpEx -->\r\n            <div class=\"form-group\">\r\n                <label class=\"col-xs-3 control-label\">\r\n                    Levelized operating expenditures (");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.currPrefix", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("/kW-yr):\r\n                </label>\r\n                <div class=\"col-xs-1\">\r\n                    <input type=\"text\" class=\"form-control\" ng-model=\"opex_avg_annual\" ng-blur=\"calculateLCOE()\" enabled />\r\n                </div>\r\n                <div class=\"col-xs-5 bg-info\" style=\"padding: 5px\">\r\n                    <rzslider rz-slider-model=\"opex_avg_annual\" rz-slider-floor=\"opex_avg_annual_min\" rz-slider-ceil=\"opex_avg_annual_max\" rz-slider-step=\"5\" rz-slider-translate=\"translateKWOpex\"></rzslider>\r\n                </div>\r\n            </div>\r\n\r\n            <!-- Net Capacity Factor -->\r\n            <div class=\"form-group\">\r\n                <label class=\"col-xs-3 control-label\">\r\n                    Net project-level capacity factor (%):\r\n                </label>\r\n                <div class=\"col-xs-1\">\r\n                    <input type=\"text\" class=\"form-control\" ng-model=\"net_capacity_factor\" ng-blur=\"calculateLCOE()\" enabled />\r\n                </div>\r\n                <div class=\"col-xs-5 bg-info\" style=\"padding: 5px\">\r\n                    <rzslider rz-slider-model=\"net_capacity_factor\" rz-slider-floor=\"net_capacity_factor_min\" rz-slider-ceil=\"net_capacity_factor_max\" rz-slider-step=\"1\" rz-slider-translate=\"translatePercent\"></rzslider>\r\n                </div>\r\n            </div>\r\n\r\n            <!-- Project Design Life -->\r\n            <div class=\"form-group\">\r\n                <label class=\"col-xs-3 control-label\">\r\n                    Project design life (years):\r\n                </label>\r\n                <div class=\"col-xs-1\">\r\n                    <input type=\"text\" class=\"form-control\" ng-model=\"project_design_life\" ng-blur=\"calculateLCOE()\" enabled />\r\n                </div>\r\n                <div class=\"col-xs-5 bg-info\" style=\"padding: 5px\">\r\n                    <rzslider rz-slider-model=\"project_design_life\" rz-slider-floor=\"project_design_life_min\" rz-slider-ceil=\"project_design_life_max\" rz-slider-step=\"1\" rz-slider-translate=\"translateYears\"></rzslider>\r\n                </div>\r\n            </div>\r\n\r\n            <!-- WACC -->\r\n            <div class=\"form-group\">\r\n					<label class=\"col-xs-3 control-label\">\r\n                    Cost of financing (after-tax WACC, % nominal):\r\n                    </label>\r\n					<div class=\"col-xs-1\">\r\n						<input type=\"text\" class=\"form-control\" ng-model=\"wacc_nominal\" ng-blur=\"calculateLCOE()\" enabled />\r\n					</div>\r\n					<div class=\"col-xs-5 bg-info\" style=\"padding: 5px\">\r\n						<rzslider rz-slider-model=\"wacc_display_value\" rz-slider-floor=\"wacc_nominal_min\" rz-slider-ceil=\"wacc_nominal_max\" rz-slider-step=\"1\" rz-slider-translate=\"translatePercentWacc\"></rzslider> \r\n					</div> \r\n				</div>\r\n\r\n            <!-- Real LCOE -->\r\n            <div class=\"form-group alert alert-info\">\r\n                <h2 class=\"text-center\">\r\n                    <label class=\"col-xs-3 control-label\">\r\n                        Real LCOE (");
	  stack1 = helpers._triageMustache.call(depth0, "view.definition.currPrefix", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
	  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
	  data.buffer.push("/MWh):\r\n                        <span class=\"form-control-static\" ng-bind=\"(real_lcoe | number:0)\"></span>\r\n                    </label>\r\n                </h2>\r\n            </div>\r\n\r\n        </form>\r\n    </div>\r\n\r\n</script>");
	  return buffer;
	  
	});

/***/ },
/* 29 */
/***/ function(module, exports) {

	(function (EAT, window, undefined) {
	    "use strict";

	    var DEBUG_MASQUERADE_AS_IE8 = false;
	    var OLD_IE_DEADLINE = 5000; // ms

	    function isIE7or8() {
	        if (DEBUG_MASQUERADE_AS_IE8) {
	            console.log("WARNING DEBUG CODE IS ON: DEBUG_MASQUERADE_AS_IE8=true in rate-limited-view.js, forcibly enabling rate limited views!");
	            return true;
	        }

	        var ieVersion = getInternetExplorerVersion();
	        return ieVersion == 8 || ieVersion == 7;
	    }

	    // Returns the version of Internet Explorer or a -1
	    // (indicating the use of another browser).
	    function getInternetExplorerVersion() {
	        var rv = -1; // Return value assumes failure.
	        if (navigator.appName == 'Microsoft Internet Explorer') {
	            var ua = navigator.userAgent;
	            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
	            if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
	        }
	        return rv;
	    }

	    // FIXME: not sure we'll need context, but leaving it in for now
	    var CONTEXT = null;
	    var toShowQueue = [];

	    function showChunkOfViews() {
	        console.log("showChunkOfViews, n=", toShowQueue.length);

	        var endAtTime = Date.now() + OLD_IE_DEADLINE;

	        while (toShowQueue.length > 0 && Date.now() < endAtTime) {
	            var toShow = toShowQueue.pop();
	            Ember.run(function () {
	                toShow.showRateLimitedView();
	            });
	            //console.log("\titem shown: ", endAtTime - Date.now(), "ms remain");
	        }

	        console.log("\tdone: ", endAtTime - Date.now(), "ms remain");

	        if (toShowQueue.length > 0) {
	            console.log("\ttime's up! rescheduling");
	            Ember.run.scheduleOnce("render", CONTEXT, showChunkOfViews);
	        }
	        console.log("\ttoShowQueue.length=", toShowQueue.length);
	    }

	    // Ways to make RateLimitedViews not render...
	    /*
	    
	    1: Require a child-view wrapper in all cases
	    PRO: didInsertElement won't be called until its actually ready
	    CON: requires an extra wrapper widget for each element.... on all platforms
	     2: Set layout to a blank layout, later unset the layout (or replace with an existing layoutName?), and rerender
	    PRO: quick-hack to allow rows and stuff to be rate limited
	    CON: didInsertElement will be called, could have complex + undesirable interactiosn with existing layout
	     */
	    var blankTemplate = Ember.Handlebars.compile('');

	    var RateLimitedViewMixin = Ember.Mixin.create({
	        _shouldBeVisible: false,
	        init: function init() {
	            this._super();
	            toShowQueue.push(this);
	            Ember.run.scheduleOnce("render", CONTEXT, showChunkOfViews);
	        },
	        template: function () {
	            console.log('template:');
	            if (this.get('_shouldBeVisible')) {
	                console.log("\tReturning the real template!");
	                return this._super();
	                this.rerender();
	            } else {
	                console.log("\tBlank template");
	                return blankTemplate;
	            }
	        }.property('_shouldBeVisible'),
	        render: function render(buffer) {
	            console.log("Render called...");
	            this._super(buffer);
	        },
	        showRateLimitedView: function showRateLimitedView() {
	            console.log("showRateLimitedView()");
	            this.set('_shouldBeVisible', true);
	            //this.set('layoutName', 'rate-limited-view-is-not-blank');

	            /*
	            FIXME: rerender is resulting in TWO copies of the shit in question. UGH!
	            Maybe nest as a child view (UGH, how to avoid interfering with NON ie8 case?)
	            Or maybe just make this a special case thing, use it in the table related views,
	            trust that is enough (is it?) and move on with our lives.... still what about slower
	            views like, say, having 5 time-trends on the page???
	            */
	        },
	        fetchMe: function () {
	            console.log("RateLimitedView.fetchMe()");
	            if (!this.get('_shouldBeVisible')) {
	                throw "Fetch me should not be accessed until it _shouldBeVisible!";
	                console.log("Fetch me should not be accessed until it _shouldBeVisible!");
	            } else {
	                console.log("\tok: should be visible");
	                return "*";
	            }
	        }.property()
	    });

	    if (isIE7or8()) {
	        console.log("Loading rate-limited-view.js");
	        EAT.RateLimitedViewMixin = RateLimitedViewMixin;
	    } else {
	        console.log("Not on IE7/8, just using straight-up Ember.View");
	        EAT.RateLimitedViewMixin = Ember.Mixin.create({});
	    }
	})(EAT, window);

/***/ },
/* 30 */
/***/ function(module, exports) {

	(function (EAT, ElicitationUtils, window, undefined) {
	    "use strict";

	    // WARNING: NOT STATELESS, NOT THREAD-SAFE, NOT GOOD: see containsAVariableSubstution

	    function CreateMarkdownConverter(elicitation) {
	        var markdownConverter = new Markdown.getSanitizingConverter();
	        var singleQuotes = new RegExp("[']", 'g');

	        markdownConverter.hooks.chain("postConversion", function (text) {
	            var definitions = elicitation.get("phraseDefinitions");
	            var text = text.replace(/\[\[([^\[\]]*)\]\]/gi, function (match, p1) {
	                // We do this to add to the list of definitions to be defined automatically
	                definitions.getDefinitionOrCreate(p1);

	                return "<span class='defined-term'><span class='phrase'>" + p1 + "</span></span>";
	            });

	            var variableSubstitutions = Ember.A();
	            var text = text.replace(/\{\{([^\{\}]*)\}\}/gi, function (match, p1) {
	                p1 = p1.replace(singleQuotes, ""); // delete single quotes, for great justice
	                variableSubstitutions.push(p1);
	                return "<span class='substituted-variable' variable='" + p1 + "'></span>";
	            });
	            markdownConverter.variableSubstitutions = variableSubstitutions;

	            return "<div class='markdown'>" + text + "</div>";
	        });
	        return markdownConverter;
	    }

	    var MarkdownLabel = Ember.View.extend({
	        content: null,
	        elicitation: undefined, // this must be bound on creation
	        classNames: ["markdown-label"],
	        init: function init() {
	            this._super();
	            Ember.assert("MarkdownLabel.elicitation must be set to an elicitation", !Ember.isNone(this.get('elicitation')));
	        },
	        template: Ember.Handlebars.compile("{{view.html}}"),
	        variableSubstitutions: [],
	        setupVariableSubstitutionObservers: function () {
	            var self = this;

	            // We have to get(elicitation.variableScope) at least once
	            // or the observers below won't hook in and fire when it changes
	            self.get("elicitation.variableScope");
	            var variableSubstitutions = this.get('variableSubstitutions');
	            if (variableSubstitutions) {
	                self.addObserver("elicitation.variableScope", function () {
	                    Ember.run.once(function () {
	                        var variableScope = self.get("elicitation.variableScope");

	                        variableSubstitutions.forEach(function (variable) {
	                            //var variablePath = 'elicitation.variableScope.' + variable;
	                            //var value = self.get(variablePath);
	                            var value = undefined;
	                            try {
	                                value = ElicitationUtils.evalInScope(variable, variableScope);
	                            } catch (e) {
	                                // catch errors evaluating variable substitutions
	                            }

	                            var subtitutedVariable = self.$(".substituted-variable").filter("[variable='" + variable + "']");
	                            if (typeof value === "number" && value !== parseInt(value, 10)) {
	                                // its a float, lets truncate it for sanity
	                                // if somebody really wants more preicison, they can
	                                // preconvert to a string themselves
	                                value = value.toPrecision(3);
	                            } else {
	                                value = String(value);
	                            }
	                            subtitutedVariable.html(value);
	                        });
	                    });
	                });
	            }
	        }.observes('variableSubstitutions.@each'),
	        html: function () {
	            /* Ember.Handlebars.compile(this.get('html')) */
	            var content = this.get('content');
	            if (!Ember.isNone(content)) {
	                var markdownConverter = this.get('elicitation.markdownConverter');
	                markdownConverter.variableSubstitutions = undefined;
	                var result = markdownConverter.makeHtml(content).htmlSafe();
	                this.set('variableSubstitutions', markdownConverter.variableSubstitutions);
	                return result;
	            } else {
	                return "";
	            }
	        }.property('content', 'elicitation.phraseDefinitions.@each'),
	        didInsertElement: function didInsertElement() {
	            var elicitation = this.get('elicitation');
	            var phraseDefinitions = elicitation.get('phraseDefinitions');
	            this.$().on("mouseenter", ".defined-term", function (evt) {
	                var term = $(this);
	                var editMode = elicitation.get('editMode');

	                var phraseToFind = term.text();
	                var definition = elicitation.get('phraseDefinitions').getDefinitionOrCreate(phraseToFind);

	                if (!definition.get('isDefined') && !editMode) {
	                    console.log("Phrase ", phraseToFind, " is not yet defined");
	                    return;
	                }

	                term.addClass("popped-out");
	                var popup = $("<div class='popup'/>");
	                var defHTML = elicitation.get('markdownConverter').makeHtml(definition.get('definition'));
	                popup.html(defHTML);

	                if (editMode) {
	                    var editButton = $("<input type='submit' value='Edit Definition'/>");
	                    editButton.click(function (evt) {
	                        definition.scrollToDefinition();
	                    });
	                    var editDiv = $("<div class='edit-bar'></div>");
	                    editDiv.append(editButton);
	                    popup.append(editDiv);
	                }

	                term.append(popup);
	            }).on("mouseleave", ".defined-term", function (evt) {
	                var term = $(this);

	                term.find(".popup").remove();
	                term.removeClass("popped-out");
	            }).on("click", "img", function (evt) {
	                var img = $(this);
	                var url = img.attr("src");
	                window.open(url);
	            });
	        }
	    });

	    // VanillaMarkdownLabel doesn't handle definitions, etc
	    // Useful in cases where you want some markdown, but you don't
	    // have an elicitation in the context
	    var VanillaMarkdownLabel = Ember.View.extend({
	        content: null,
	        classNames: ["markdown-label"],
	        template: Ember.Handlebars.compile("{{view.html}}"),
	        html: function () {
	            /* Ember.Handlebars.compile(this.get('html')) */
	            var content = this.get('content');
	            if (!Ember.isNone(content)) {
	                var markdownConverter = CreateVanillaMarkdownConverter();
	                var result = markdownConverter.makeHtml(content).htmlSafe();
	                return result;
	            } else {
	                return "";
	            }
	        }.property('content'),
	        didInsertElement: function didInsertElement() {
	            this.$().on("click", "img", function (evt) {
	                var img = $(this);
	                var url = img.attr("src");
	                window.open(url);
	            });
	        }
	    });

	    function CreateVanillaMarkdownConverter() {
	        var markdownConverter = new Markdown.getSanitizingConverter();
	        markdownConverter.hooks.chain("postConversion", function (text) {
	            return "<div class='markdown'>" + text + "</div>";
	        });
	        return markdownConverter;
	    }

	    // EXPORTS
	    EAT.MarkdownLabel = MarkdownLabel;
	    EAT.CreateMarkdownConverter = CreateMarkdownConverter;
	    EAT.VanillaMarkdownLabel = VanillaMarkdownLabel;
	})(EAT, ElicitationUtils, window);

/***/ },
/* 31 */
/***/ function(module, exports) {

	(function (EAT, ElicitationUtils, window, undefined) {
	    "use strict";

	    EAT.PhraseDefinition = Ember.Object.extend(Ember.Evented, {
	        phrase: "",
	        definition: "",
	        isDefined: function () {
	            var definition = this.get('definition');
	            return definition != undefined && definition.length > 0;
	        }.property('definition'),
	        serializeDefinition: function serializeDefinition(doc) {
	            var serialized = $(doc.createElement("definition"));
	            serialized.attr('phrase', this.get('phrase'));
	            serialized.text(this.get('definition'));
	            return serialized;
	        },
	        scrollToDefinition: function scrollToDefinition() {
	            this.trigger('scrollToDefinition');
	        }
	    });

	    EAT.PhraseDefinitionView = Ember.View.extend({
	        init: function init() {
	            this._super();
	            this.get('content').on('scrollToDefinition', this, 'scrollToDefinition');
	        },
	        scrollToDefinition: function scrollToDefinition() {
	            var phrasesView = this.get('phrases');
	            phrasesView.set('showBody', true);
	            var definitionDOM = this.$();
	            setTimeout(function () {
	                phrasesView.$(".box-body").scrollTo(definitionDOM, function () {
	                    definitionDOM.find("textarea").focus().select();
	                });
	            }, 500);
	        }
	    });

	    EAT.PhraseDefinitionsView = Ember.View.extend({
	        classNames: ['phrase-definitions-view'],
	        templateName: 'phrase-definitions-view',
	        showBody: false,
	        togglePopout: function togglePopout() {
	            this.set('showBody', !this.get('showBody'));
	        }
	    });

	    EAT.PhraseDefinitionsController = Ember.ArrayController.extend({
	        definePhrase: function definePhrase(phrase, definition) {
	            var def = this.getDefinitionOrCreate(phrase);
	            def.set('definition', definition);
	            return def;
	        },
	        getDefinition: function getDefinition(phrase) {
	            var definition = this.find(function (def) {
	                return def.phrase === phrase;
	            });
	            return definition;
	        },
	        getDefinitionOrCreate: function getDefinitionOrCreate(phrase) {
	            var definition = this.getDefinition(phrase);
	            if (Ember.isNone(definition)) {
	                var definition = EAT.PhraseDefinition.create({
	                    phrase: phrase
	                });
	                this.pushObject(definition);
	            }
	            return definition;
	        },
	        content: [],
	        unknownProperty: function unknownProperty(key) {
	            return this.getDefinition(key);
	        },
	        isNamespace: false,
	        serializeDefinition: function serializeDefinition(doc) {
	            return this.filterProperty('isDefined').map(function (definition) {
	                return definition.serializeDefinition(doc);
	            });
	        },
	        loadPhrasesFromXML: function loadPhrasesFromXML(phrasesXML) {
	            var self = this;

	            phrasesXML.each(function () {
	                self.definePhrase($(this).attr("phrase"), $(this).text());
	            });
	        }
	    });
	})(EAT, ElicitationUtils, window);

/***/ },
/* 32 */
/***/ function(module, exports) {

	(function (EAT, ElicitationUtils, window, undefined) {
	    "use strict";

	    EAT.Page = Ember.Object.extend({
	        pagesController: undefined, // define this in when creating
	        elicitationBinding: 'pagesController.elicitation',
	        widgets: null,
	        authorNotes: "",
	        init: function init() {
	            this._super();

	            var widgets = Ember.A(this.get('widgets'));
	            this.set('widgets', widgets);

	            var page = this;

	            var serializedDefinition = this.get('serializedDefinition');
	            if (serializedDefinition) {
	                serializedDefinition.children().each(function () {
	                    var widgetName = this.nodeName.toLowerCase();
	                    if (widgetName in EAT.Widgets) {
	                        var widgetClass = EAT.Widgets[widgetName];
	                        widgets.pushObject(widgetClass.create({
	                            serializedDefinition: $(this),
	                            elicitation: page.get('elicitation')
	                        }));
	                    } else if (widgetName == "author-notes") {
	                        page.set('authorNotes', $(this).text());
	                    } else {
	                        console.log("Cannot de-serialize unknown widget named: " + widgetName);
	                    }
	                });
	            }
	        },
	        createNewWidget: function createNewWidget(widgetNameToAdd) {
	            if (Ember.isNone(widgetNameToAdd)) return;

	            var widgetClass = EAT.Widgets[widgetNameToAdd];
	            var widget = widgetClass.create({
	                elicitation: this.get('elicitation')
	            });
	            this.get('widgets').pushObject(widget);
	            this.set('elicitation.widgetBeingEdited', widget);
	        },
	        redraw: function redraw() {
	            this.get('widgets').forEach(function (widget) {
	                widget.redraw();
	            });
	        },
	        // Work around: https://github.com/emberjs/ember.js/issues/541
	        fixmeAvoidEachBugNumWidgets: function () {
	            return this.get('widgets.length');
	        }.property('widgets.length'),
	        title: 'Click Here to Edit the Page Title',
	        pageNum: function (key, value) {
	            // Note: pageNum is "1-indexed"

	            var pages = this.get('pagesController');
	            var currentIndex = pages.indexOf(this);
	            if (arguments.length === 1) {
	                return currentIndex + 1;
	            } else {
	                var newIndex = value - 1;

	                if (newIndex != currentIndex) {
	                    pages.removeAt(currentIndex);
	                    pages.insertAt(newIndex, this);
	                }
	                return value;
	            }
	        }.property('pagesController.@each'),
	        firstPageAfterResume: function () {
	            return this.get('pageNum') == this.get('elicitation.resumedStartingOnPageNum');
	        }.property('pageNum', 'elicitation.resumedStartingOnPageNum'),
	        isFirstPage: function () {
	            return this.get('pageNum') == 1;
	        }.property('pageNum'),
	        isLastPage: function () {
	            return this.get('pagesController.numPages') == this.get('pageNum');
	        }.property('pageNum', 'pagesController.numPages'),
	        isCurrentPage: function () {
	            var currentPage = this.get("pagesController.currentPage");
	            return currentPage === this;
	        }.property('pagesController.currentPage'),
	        serializeDefinition: function serializeDefinition(doc) {
	            var serialized = $(doc.createElement("page"));
	            serialized.attr('title', this.get('title'));

	            this.get('widgets').forEach(function (widget) {
	                serialized.append(widget.serializeDefinition(doc));
	            });

	            var authorNotes = this.get('authorNotes');
	            if (!Ember.isNone(authorNotes)) {
	                var notes = $(doc.createElement("author-notes"));
	                notes.text(authorNotes);
	                serialized.append(notes);
	            }

	            return serialized;
	        },
	        dataKeyBinding: 'title',
	        serializedData: function () {
	            var data = EAT.SerializedData.create();
	            var validationErrors = [];

	            var pageTitle = this.get('title');

	            var savedSomeData = false;

	            var allowEditing = this.get('elicitation.allowEditing');
	            this.get('widgets').forEach(function (widget) {
	                var result = widget.get('serializedData');
	                if (result) {
	                    savedSomeData = true;
	                    jQuery.extend(validationErrors, result.get('errors'));
	                    var dataKey = widget.get('dataKey');
	                    if (allowEditing && !dataKey) {
	                        alert("WARNING: widget without a valid dataKey, probably no title defined," + "data may be lost");
	                    }
	                    data[dataKey] = {
	                        data: result.get('data'),
	                        dataKeyText: widget.get('dataKeyText')
	                    };
	                }
	            });

	            data['metadata'] = {
	                secondsExpertOnPage: this.get('secondsExpertOnPage')
	            };

	            // Not really valid if we're always setting metadata...
	            // if (!savedSomeData) return null;

	            return EAT.StoreDataResult.create({
	                data: data,
	                errors: validationErrors
	            });
	        }.property().volatile(),
	        expertOnPage: false, // set by the pagesController
	        beforeEnteringPage: function beforeEnteringPage() {
	            var page = this;
	            this.get('widgets').forEach(function (widget) {
	                widget.beforeEnteringPage(page);
	            });
	        },
	        beforeExitingPage: function beforeExitingPage() {
	            var page = this;
	            this.get('widgets').forEach(function (widget) {
	                widget.beforeExitingPage(page);
	            });
	        },
	        _msExpertOnPage: 0.0,
	        timeExpertEnteredPage: null,
	        accumulateTimeOnPage: function accumulateTimeOnPage() {
	            var timeExpertEnteredPage = this.get('timeExpertEnteredPage');
	            if (!Ember.isNone(timeExpertEnteredPage)) {
	                var now = Date.now();
	                var msToAccumulate = now - timeExpertEnteredPage;
	                this.set('_msExpertOnPage', this.get('_msExpertOnPage') + msToAccumulate);
	                this.set('timeExpertEnteredPage', now);
	            }
	        },
	        startOrStopTiming: function () {
	            var expertOnPage = this.get('expertOnPage');
	            if (expertOnPage) {
	                // Start timing
	                this.set('timeExpertEnteredPage', Date.now());
	                // console.log("Started timer on: ", this.get('title'));
	            } else {
	                // Stop timing
	                this.accumulateTimeOnPage();
	                this.set('timeExpertEnteredPage', null);
	                // console.log("Stopped timer on: ", this.get('title'), " at ", this.get('secondsExpertOnPage'));
	            }
	        }.observes('expertOnPage'),
	        secondsExpertOnPage: function () {
	            this.accumulateTimeOnPage();
	            return this.get('_msExpertOnPage') / 1000;
	        }.property('_msExpertOnPage').volatile()
	    });

	    var AddWidgetToPage = Ember.View.extend({
	        page: undefined, // should be set when creating
	        elicitationBinding: 'page.elicitation',
	        classNames: ['add-widget-to-page'],
	        change: function change(event) {
	            // This fires when the select/dropdown changes, we detect which action
	            // to perform, and set the select back to the "Add widget:" prompt

	            var page = this.get('page');
	            var elicitation = this.get('elicitation');

	            var selectElement = this.$("select");
	            var selected = selectElement.val();
	            if (selected === "prompt-no-action-required") {
	                return; // important to return here so we don't get an infinite loop
	            } else if (selected === "show-gallery") {
	                elicitation.set('widgetGalleryIsOpen', true);
	                elicitation.set('widgetGalleryAddsToPage', page);
	            } else {
	                var widgetName = selected;
	                page.createNewWidget(widgetName);
	            }
	            selectElement.val("prompt-no-action-required");
	        },
	        widgetNames: function () {
	            var widgetNames = Ember.A();
	            for (var widgetName in EAT.Widgets) {
	                widgetNames.pushObject(Ember.Object.create({
	                    widgetName: widgetName,
	                    prettyName: EAT.Widgets[widgetName].prettyName
	                }));
	            }
	            widgetNames = widgetNames.sort(function (a, b) {
	                return a.get('prettyName') <= b.get('prettyName') ? -1 : 1;
	            });
	            return widgetNames;
	        }.property()
	    });

	    EAT.PageView = Ember.View.extend({
	        /* isVisible begins false, with no templates rendered, but once a page is made visible,
	           we set templateName and rerender. This way, pages are not rendered until they are needed
	           but once rendered, they are never re-rendered (which would lose HTML state!)
	           */
	        isVisible: false,
	        templateName: null, // templateName only gets set once the element is visible
	        setTemplateOnceVisible: function () {
	            if (this.get('isVisible') && Ember.isNone(this.get('templateName'))) {
	                this.set('templateName', 'page');
	                this.rerender();
	            }
	        }.observes('isVisible'),
	        pageBinding: 'content',
	        pagesControllerBinding: 'content.pagesController',
	        classNames: ['page-view'],
	        nextButtonDisabled: false,
	        pageDOM: function () {
	            return this.$().closest('.page');
	        }.property(),
	        nextButtonLabel: function () {
	            var page = this.get('page');
	            if (Ember.isNone(page)) return "Next";

	            if (page.get('isLastPage')) {
	                return "Submit Elicitation";
	            } else {
	                return "Next »";
	            }
	        }.property("page.pageNum"),
	        actions: {
	            gotoNextPage: function gotoNextPage(event) {
	                this.get('pagesController').gotoNextPage();
	            },
	            gotoPrevPage: function gotoPrevPage(event) {
	                this.get('pagesController').gotoPrevPage();
	            },
	            restartElicitationWithoutPriorData: function restartElicitationWithoutPriorData(e) {
	                function insertParam(key, value) {
	                    key = encodeURI(key);value = encodeURI(value);

	                    var kvp = document.location.search.substr(1).split('&');

	                    var i = kvp.length;var x;while (i--) {
	                        x = kvp[i].split('=');

	                        if (x[0] == key) {
	                            x[1] = value;
	                            kvp[i] = x.join('=');
	                            break;
	                        }
	                    }

	                    if (i < 0) {
	                        kvp[kvp.length] = [key, value].join('=');
	                    }

	                    //this will reload the page, it's likely better to store this until finished
	                    document.location.search = kvp.join('&');
	                }

	                if (confirm("Are you sure you want to start over from scratch?\n\nPLEASE NOTE: clicking ok will ABANDON ANY PREVIOUS RESPONSES and you'll have to reenter them.")) {
	                    insertParam("resumePriorSessionData", "false");
	                }
	            },
	            removePage: function removePage() {
	                if (!confirm("Delete the entire page? This will delete all the widgets on the page too.")) return;
	                this.get('pagesController').removeObject(this.get('page'));
	            },
	            movePageUp: function movePageUp() {
	                var pages = this.get('pagesController');
	                var page = this.get('page');
	                var index = pages.indexOf(page);
	                var firstPage = index == 0;
	                if (!firstPage) {
	                    pages.removeAt(index);
	                    pages.insertAt(index - 1, page);
	                }
	            },
	            movePageDown: function movePageDown() {
	                var pages = this.get('pagesController');
	                var page = this.get('page');
	                var index = pages.indexOf(page);
	                var lastPage = index == pages.get('length') - 1;
	                if (!lastPage) {
	                    pages.removeAt(index);
	                    pages.insertAt(index + 1, page);
	                }
	            },
	            insertNewPageAfter: function insertNewPageAfter() {
	                var pages = this.get('pagesController');
	                var page = this.get('page');
	                var index = pages.indexOf(page);
	                pages.addNewPage(index + 1);
	            }
	        },
	        addWidgetToPageView: AddWidgetToPage
	    });
	})(EAT, ElicitationUtils, window);

/***/ },
/* 33 */
/***/ function(module, exports) {

	(function (EAT, ElicitationUtils, window, undefined) {
	    "use strict";

	    EAT.PagesView = ElicitationUtils.CurrentCollectionView.extend({
	        elicitationBinding: 'controller.elicitation',
	        classNames: ['pages'],
	        itemViewClass: EAT.PageView,
	        contentBinding: 'elicitation.pagesController',
	        currentContentBinding: 'elicitation.pagesController.currentPage',
	        showAllContentBinding: 'elicitation.showAllPages'
	    });

	    EAT.PagesController = Ember.ArrayController.extend({
	        elicitation: undefined, // this needs to be set when initializing
	        content: [],
	        pageHistory: undefined,
	        init: function init() {
	            this._super();
	            this.set('pageHistory', Ember.A());
	        },
	        numPages: function () {
	            return this.get('content').length;
	        }.property('@each'),
	        currentPage: null,
	        currentPageNum: function (key, value) {
	            if (arguments.length > 1) {
	                var newPageNum = value - 1;
	                var newPage = this.get('content')[newPageNum];
	                if (!Ember.isNone(newPage)) {
	                    this.set('currentPage', newPage);
	                }
	            }

	            var currentPage = this.get('currentPage');
	            return this.indexOf(currentPage) + 1;
	        }.property('currentPage'),
	        redrawWidgetsOnShowAllPagesChange: function () {
	            if (this.get('elicitation.showAllPages')) {
	                var self = this;
	                // FIXME: we use setTimeout to make sure the DOM has re-rendered
	                // this should really be pushed into the PageView, but I can't figure
	                // out what event hook to use??? there's no "afterRender" hook
	                window.setTimeout(function () {
	                    self.forEach(function (page) {
	                        page.redraw();
	                    });
	                }, 50);
	            } else {
	                this.redrawWidgetsOnPageChange();
	            }
	        }.observes('elicitation.showAllPages'),
	        informPageExpertIsLeaving: function () {
	            var leavingPage = this.get('currentPage');
	            if (!Ember.isNone(leavingPage)) {
	                leavingPage.set('expertOnPage', false);
	            }
	        }.observesBefore('currentPage'),
	        informPageExpertIsEntering: function () {
	            var page = this.get('currentPage');
	            if (!Ember.isNone(page)) {
	                if (this.get('elicitation.editMode')) {
	                    page.set('expertOnPage', false);
	                } else {
	                    page.set('expertOnPage', true);
	                }
	            }
	        }.observes('currentPage', 'elicitation.editMode'),
	        redrawWidgetsOnPageChange: function () {
	            var page = this.get('currentPage');
	            // FIXME: we use setTimeout to make sure the DOM has re-rendered
	            // this should really be pushed into the PageView, but I can't figure
	            // out what event hook to use??? there's no "afterRender" hook

	            var self = this;
	            window.setTimeout(function () {
	                if (!self.get('elicitation.showAllPages')) {
	                    $(window).scrollTop(0);
	                }
	                page.redraw();
	            }, 50);
	        }.observes('currentPage'),
	        thePageBefore: function thePageBefore(page) {
	            var content = this.get('content');
	            var pageBeforeIndex = content.indexOf(page) - 1;
	            if (pageBeforeIndex < 0) return null;
	            return content[pageBeforeIndex];
	        },
	        thePageAfter: function thePageAfter(page) {
	            var content = this.get('content');
	            var pageAfterIndex = content.indexOf(page) + 1;
	            if (pageAfterIndex >= content.length) return null;
	            return content[pageAfterIndex];
	        },
	        gotoPage: function gotoPage(page) {
	            console.log("gotoPage(), pageNum: ", page.get('pageNum'));
	            this.set('currentPage', page);
	            this.runBeforeEnteringOnCurrentPage();
	        },
	        gotoNextPage: function gotoNextPage() {
	            var elicitation = this.get('elicitation');
	            var currentPage = this.get('currentPage');
	            if (Ember.isNone(currentPage)) return;

	            var result = currentPage.get('serializedData');
	            if (result) {
	                var errors = result.get('errors');
	                if (errors.length > 0) {
	                    if (!confirm("This page isn't fully filled out, continue anyway?\n" + errors.join("\n"))) return;
	                }
	                elicitation.set('serializedDataIsEmpty', false);
	                var dataKey = currentPage.get('dataKey');
	                if (!dataKey && elicitation.get('allowEditing')) {
	                    alert("WARNING: page without a valid dataKey, probably no title defined");
	                }

	                elicitation.setSerializedDataForPage(dataKey, result.get('data'));
	            }

	            var isLastPage = currentPage.get('isLastPage');

	            // We always try to submit data, even if flipping pages throws an exception
	            try {
	                if (currentPage.get('isLastPage')) {
	                    currentPage.set('nextButtonDisabled', true);
	                } else {
	                    currentPage.beforeExitingPage();
	                    this.get('pageHistory').push(currentPage);

	                    var scriptChangedPages = currentPage !== this.get('currentPage');

	                    // Advance to next page (unless the beforeexitingpage script already did)
	                    if (!scriptChangedPages) {
	                        this.gotoPage(this.thePageAfter(currentPage));
	                    }

	                    //this.runBeforeEnteringOnCurrentPage();
	                }
	            } finally {
	                // update current page number & variables
	                elicitation.updateSerializedDataMetadata(isLastPage);
	                elicitation.submitData(isLastPage);
	            }
	        },
	        runBeforeEnteringOnCurrentPage: function runBeforeEnteringOnCurrentPage() {
	            this.get('currentPage').beforeEnteringPage();

	            /* OUTDATED: now gotoPage() calls before entering script, so customScripting.api.gotoPage() will recursively
	            executed before entering scripts too.... rendering do loop unnecessary.
	            var currentPage;
	            do {
	            currentPage = this.get('currentPage');
	            currentPage.beforeEnteringPage();
	            } while (currentPage != this.get('currentPage')) // keep going until the page stops changing
	            */
	        },
	        gotoPrevPage: function gotoPrevPage() {
	            var prevPage = this.get('pageHistory').pop();

	            if (Ember.isNone(prevPage)) {
	                console.warn("pages.gotoPrevPage(): page history stack is empty, going to previous page by number instead");
	                var currentPage = this.get('currentPage');
	                if (Ember.isNone(currentPage)) return;
	                prevPage = this.thePageBefore(currentPage);
	            }

	            this.gotoPage(prevPage);
	        },
	        ensureCurrentPageIsValid: function () {
	            if (!this.get('content').contains(this.get('currentPage'))) {
	                this.set('currentPage', this.get('content').get('firstObject'));
	            }
	        }.observes('content', 'currentPage'),
	        allWidgets: function () {
	            var widgets = [];
	            this.forEach(function (page) {
	                page.get('widgets').forEach(function (widget) {
	                    widgets.push(widget);
	                });
	            });
	            return widgets;
	        }.property('@each.fixmeAvoidEachBugNumWidgets'),
	        loadPagesFromXML: function loadPagesFromXML(pagesXML) {
	            var self = this;

	            pagesXML.each(function () {
	                self.pushObject(EAT.Page.create({
	                    serializedDefinition: $(this),
	                    title: $(this).attr("title"),
	                    pagesController: self
	                }));
	            });

	            // If we're not already somewhere, start on the first page
	            if (Ember.isNone(this.get('currentPage'))) {
	                this.set('currentPage', this.get('firstObject'));
	            }
	        },
	        addNewPage: function addNewPage(index) {
	            var newPage = EAT.Page.create({
	                pagesController: this
	            });
	            if (Ember.isNone(index)) {
	                this.addObject(newPage);
	            } else {
	                this.insertAt(index, newPage);
	            }
	        },
	        pageRangeForSelect: function () {
	            var pageRange = [];
	            var numPages = this.get('numPages');
	            for (var i = 1; i <= numPages; i++) {
	                pageRange.push(i);
	            }
	            return pageRange;
	        }.property('numPages'),
	        renameDuplicatePageTitles: function renameDuplicatePageTitles() {
	            var pageKeys = Ember.Set.create();
	            pageKeys.add('metadata'); // reserved word
	            var cancelSave = false;
	            this.forEach(function (page) {
	                var pageKey = page.get('dataKey');
	                if (pageKeys.contains(pageKey)) {
	                    var oldTitle = page.get('title');
	                    var newTitle = oldTitle + " " + Math.floor(Math.random() * 1e6).toString();
	                    page.set('title', newTitle);
	                }
	                pageKeys.add(page.get('dataKey'));
	            });
	        }
	    });
	})(EAT, ElicitationUtils, window);

/***/ },
/* 34 */
/***/ function(module, exports) {

	(function (EAT, ElicitationUtils, window, undefined) {
	    "use strict";

	    EAT.WidgetGalleryView = Ember.View.extend({
	        addToPage: undefined, // page that will be added to!
	        elicitationBinding: "controller.elicitation",

	        templateName: "widget-gallery",
	        classNames: ["widget-gallery"],
	        widgetClicked: function widgetClicked(widget) {
	            this.set('elicitation.widgetGalleryIsOpen', false);

	            var widgetName = widget.widgetName;
	            var pageToAddTo = this.get('addToPage');
	            this.get('addToPage').createNewWidget(widgetName);
	        },
	        closeWidgetGallery: function closeWidgetGallery() {
	            this.set('elicitation.widgetGalleryIsOpen', false);
	        },
	        widgets: function () {
	            var widgetGalleryThumbnailsURL = this.get('elicitation.widgetGalleryThumbnailsURL');
	            var widgetNames = Ember.A();
	            for (var widgetName in EAT.Widgets) {
	                widgetNames.pushObject(Ember.Object.extend({
	                    widgetName: widgetName,
	                    prettyName: EAT.Widgets[widgetName].prettyName,
	                    thumbnailURL: function () {
	                        return widgetGalleryThumbnailsURL + '/' + this.get('widgetName') + ".png";
	                    }.property('widgetName')
	                }).create());
	            }
	            widgetNames = widgetNames.sort(function (a, b) {
	                return a.get('prettyName') <= b.get('prettyName') ? -1 : 1;
	            });
	            return widgetNames;
	        }.property()
	    });
	})(EAT, ElicitationUtils, window);

/***/ },
/* 35 */
/***/ function(module, exports) {

	(function (EAT, window, undefined) {
	    "use strict";

	    EAT.reopen({
	        makeDataKeyFromText: function makeDataKeyFromText(title) {
	            if (title) {
	                return title.toLowerCase().replace(/ /g, "_").replace(/[^_a-z0-9]/g, "");
	            } else {
	                console.log("WARNING: blank data key text was specified");
	                return null;
	            }
	        },
	        Widgets: {},
	        isMobileDevice: function () {
	            return window.isMobileDevice;
	        }.property(),
	        unsupportedBrowser: function () {
	            if (BrowserDetection.msie && BrowserDetection.version < 8) {
	                return true;
	            } else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
	                return false;
	            } else {
	                return false;
	            }
	        }.property(),
	        unsupportedBrowserForEditing: function () {
	            if (BrowserDetection.msie && BrowserDetection.version < 9) {
	                return true;
	            } else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
	                return true;
	            } else {
	                return false;
	            }
	        }.property(),
	        definitionDOMElements: Ember.Set.create(),
	        WidgetResultsViews: Ember.Object.create()
	    });

	    EAT.PageFooterController = Ember.Object.extend({
	        label: "",
	        serializeDefinition: function serializeDefinition(doc) {
	            var serialized = $(doc.createElement("page-footer"));
	            serialized.text(this.get('label'));
	            return serialized;
	        },
	        loadFromXML: function loadFromXML(pageFooterXML) {
	            this.set('label', $(pageFooterXML).text());
	        }
	    });

	    EAT.CustomWidgetsController = Ember.Object.extend({
	        javascript: "",
	        css: "",
	        serializeDefinition: function serializeDefinition(doc) {
	            var customWidget = doc.createElement("custom-widget");
	            var javascript = doc.createElement("javascript");
	            var css = doc.createElement("css");
	            $(javascript).text(this.get("javascript"));
	            $(css).text(this.get("css"));
	            customWidget.appendChild(javascript);
	            customWidget.appendChild(css);
	            return customWidget;
	        },
	        loadFromXML: function loadFromXML(customWidgetXMLs) {
	            var javascript = "";
	            var css = "";

	            customWidgetXMLs.find("javascript").each(function () {
	                javascript += $(this).text();
	            });

	            customWidgetXMLs.find("css").each(function () {
	                css += $(this).text();
	            });

	            this.set('javascript', javascript);
	            this.set('css', css);

	            this.injectCSSAndJavascript();
	        },
	        injectCSSAndJavascript: function injectCSSAndJavascript() {

	            try {
	                // Run javascript
	                window.eval(this.get('javascript'));

	                // Update CSS
	                $("style#custom-widget").remove();
	                $("<style></style>").attr("id", "custom-widget").text(this.get('css')).appendTo($("body"));
	            } catch (e) {
	                console.log("Error loading custom widget javascript or CSS: ", e);
	                alert("Error loading custom widget javascript / css, see console for details.");
	            }
	        }
	    });

	    EAT.SerializedData = Ember.Object.extend();
	    EAT.RootSerializedData = EAT.SerializedData.extend({
	        getDataForWidget: function getDataForWidget(widget) {
	            var key = widget.get('dataKey');
	            return this.getDataForWidgetID(key);
	        },
	        getDataForWidgetID: function getDataForWidgetID(key) {
	            for (var pageKey in this) {
	                if (this.hasOwnProperty(pageKey)) {
	                    var page = this[pageKey];
	                    if (Ember.isNone(page)) continue;
	                    var data = page[key];
	                    if (!Ember.isNone(data)) return data.data;
	                }
	            }
	        }
	    });

	    // We need to know about any DOM elements for working around IE8 html parser issues
	    EAT.definitionDOMElements.addObject("elicitation-definition").addObject("elicitation").addObject("page").addObject("phraseDefinitions").addObject("definition");

	    EAT.Variable = Ember.Object.extend({
	        key: undefined,
	        value: undefined
	    });

	    EAT.DataDidntValidate = Ember.Object.extend({
	        init: function init() {
	            this._super();
	            this.set('errors', Ember.A(this.get('errors')));
	        },
	        errors: null
	    });

	    EAT.WidgetResultsView = Ember.View.extend({
	        perExpertDataBinding: 'content.perExpertData',
	        layoutName: 'results-chart-layout'
	    });

	    EAT.WidgetResultsData = Ember.Object.extend({
	        json: undefined,
	        rawJSON: undefined,
	        questionTextBinding: 'json.questionText',
	        perExpertDataBinding: 'json.data'
	    });

	    /* Example of an EmberJS setter:
	        id: function (key, val) {
	            if (arguments.length > 1) {
	                this.set('_id', val);
	            }
	            return this.get('_id');
	        }.property('_id')
	    */

	    EAT.StoreDataResult = Ember.Object.extend({
	        init: function init() {
	            this.set('errors', Ember.A(this.get('errors')));
	        },
	        dataKey: null,
	        dataKeyText: null,
	        errors: null,
	        data: null
	    });

	    window.EAT = EAT;
	})(EAT, window);

/***/ },
/* 36 */
/***/ function(module, exports) {

	(function (EAT, window, undefined) {
	    "use strict";

	    EAT.EditableWidgetView = Ember.View.extend({
	        content: null,
	        elicitationBinding: 'controller.elicitation',
	        widgetBinding: 'content',
	        classNameBindings: [':editable-widget', ':could-be-edited', 'beingEdited'],
	        templateName: 'editable-widget',
	        pageBinding: 'parentView.page',
	        actions: {
	            editWidget: function editWidget() {
	                this.set('elicitation.widgetBeingEdited', this.get('widget'));
	            },
	            moveWidgetUp: function moveWidgetUp() {
	                var page = this.get('page');
	                var widgets = page.get('widgets');
	                var widget = this.get('widget');
	                var index = widgets.indexOf(widget);
	                var firstWidget = index == 0;

	                if (firstWidget) {
	                    var prevPage = this.get('elicitation.pagesController').thePageBefore(page);
	                    if (prevPage) {
	                        widgets.removeObject(widget);
	                        prevPage.get('widgets').pushObject(widget);
	                    }
	                } else {
	                    widgets.removeAt(index);
	                    widgets.insertAt(index - 1, widget);
	                }
	                widget.scrollTo();
	            },
	            moveWidgetDown: function moveWidgetDown() {
	                var page = this.get('page');
	                var widgets = page.get('widgets');
	                var widget = this.get('widget');
	                var index = widgets.indexOf(widget);
	                var lastWidget = index == widgets.length - 1;

	                if (lastWidget) {
	                    var nextPage = this.get('elicitation.pagesController').thePageAfter(page);
	                    if (!Ember.isNone(nextPage)) {
	                        widgets.removeObject(widget);
	                        nextPage.get('widgets').unshiftObject(widget);
	                    }
	                } else {
	                    widgets.removeAt(index);
	                    widgets.insertAt(index + 1, widget);
	                }
	                widget.scrollTo();
	            },
	            removeWidget: function removeWidget() {
	                if (!confirm("Delete widget?")) return;

	                var page = this.get('page');
	                var widgets = page.get('widgets');
	                var widget = this.get('widget');
	                widgets.removeObject(widget);

	                if (this.get('elicitation.widgetBeingEdited') === widget) {
	                    console.log("Unsetting the widgetBeingEdited as it is being deleted");
	                    this.set('elicitation.widgetBeingEdited', null);
	                }
	            }
	        },
	        beingEdited: function () {
	            return this.get('elicitation.widgetBeingEdited') === this.get('widget');
	        }.property('elicitation.widgetBeingEdited'),
	        scrollToMeIfImBeingEdited: function () {
	            if (this.get('beingEdited')) {
	                this.get('widget').scrollTo();
	            }
	        }.observes('beingEdited')
	    });

	    EAT.WidgetViewWrapper = Ember.ContainerView.extend({
	        currentView: null,
	        contentBinding: 'currentView',
	        classNames: ['widget-view-wrapper'],
	        // THIS IS A BAD HACK TO KEEP FROM DESTROYING THE WIDGET WHEN
	        // WE DO A MOVE (remove, followed by add)
	        // REALLY.... widgets should be built from models, and not be
	        // a view in and of themselves, which would remove the need
	        // to prevent the widgetView from being destroyed in the first place
	        willDestroyElement: function willDestroyElement() {
	            var widget = this.get('currentView');
	            this.removeObject(widget);
	            this._super();
	        }
	    });

	    EAT.PageFooterView = Ember.View.extend({
	        templateName: 'page-footer',
	        classNames: ['page-footer']
	    });

	    EAT.CustomWidgetsView = Ember.View.extend({
	        templateName: 'custom-widgets',
	        classNames: ['custom-widgets'],
	        actions: {
	            injectCSSAndJavascript: function injectCSSAndJavascript() {
	                console.log("Applying custom css and javascript");
	                this.get('content').injectCSSAndJavascript();
	            }
	        }
	    });

	    EAT.EditSidebarView = Ember.View.extend({
	        elicitation: Ember.computed.alias('controller.elicitation'),
	        templateName: 'edit-sidebar',
	        classNames: ['edit-sidebar', 'slim-scrollbars'],
	        onInit: function () {
	            this.set('elicitation.hasBeenEdited', true);
	        }.on('init'),
	        actions: {
	            closeWidgetEditor: function closeWidgetEditor() {
	                this.set('elicitation.widgetBeingEdited', null);
	            }
	        },
	        scrollToTopWhenWidgetChanges: function () {
	            this.$().scrollTop(0);
	        }.observes('elicitation.widgetBeingEdited'),
	        connectWidgetBeingEditedOutlet: function () {
	            var widgetBeingEdited = this.get('elicitation.widgetBeingEdited');

	            console.log("EAT.EditSidebarView, widgetBeingEdited is now: ", widgetBeingEdited);
	            debug.widgetBeingEdited = widgetBeingEdited;

	            if (!Ember.isNone(widgetBeingEdited)) {
	                this.disconnectOutlet('widgetBeingEdited'); // Added this line to avoid deprecation warning: DEPRECATION: Using the defaultContainer is no longer supported. [defaultContainer#lookup] see: http://git.io/EKPpnA

	                // We do this in the Ember.run.next() to workaround a mysterious bug where editing a widget, then editing another widget, then switching back
	                // to edit widget one would result in the editor pane "sticking" to widget 2.
	                // see: https://app.asana.com/0/117084615272/7853252127811
	                var self = this;
	                Ember.run.next(function () {
	                    self.connectOutlet('widgetBeingEdited', widgetBeingEdited.get('definitionEditorView'));
	                });
	            } else {
	                this.disconnectOutlet('widgetBeingEdited');
	            }
	        }.observes('elicitation.widgetBeingEdited')
	    });

	    EAT.EditControlsView = Ember.View.extend({
	        elicitationBinding: 'controller.elicitation', // bind at creation,
	        classNames: ["edit-controls"],
	        templateName: 'edit-controls',
	        actions: {
	            addNewPage: function addNewPage() {
	                this.get('elicitation.pagesController').addNewPage();
	            },
	            saveChanges: function saveChanges() {
	                this.get('elicitation').saveChanges();
	            },
	            returnToDiscussion: function returnToDiscussion() {
	                if (confirm("Return to discussion? Make sure you've saved!")) {
	                    window.location.href = this.get('elicitation.discussionURL');
	                }
	            },
	            toggleEditMode: function toggleEditMode(event) {
	                this.toggleProperty('elicitation.editMode');
	            }
	        },
	        editedSinceSavingBinding: 'elicitation.hasBeenEdited',
	        toggleEditModeLabel: function () {
	            if (this.get('elicitation.editMode')) {
	                return "Preview";
	            } else if (this.get('editedSinceSaving')) {
	                return "Done...";
	            } else {
	                return "Edit";
	            }
	        }.property('elicitation.editMode', 'editedSinceSaving')
	    });

	    EAT.PostSubmitView = Ember.View.extend({
	        templateName: "post-submit",
	        classNames: ['post-submit'],
	        actions: {
	            gotoDiscussion: function gotoDiscussion() {
	                window.location.href = this.get('elicitation.discussionURL');
	            }
	        }
	    });

	    EAT.CloseEmbeddedView = Ember.View.extend({
	        actions: {
	            closeEmbeddedViewConfirm: function closeEmbeddedViewConfirm() {
	                if (confirm("Close this elicitation before submitting?\n\nYour responses will NOT be saved.")) {
	                    parent.hideElicitationPopup();
	                }
	            },
	            closeEmbeddedViewPostSubmit: function closeEmbeddedViewPostSubmit() {
	                parent.hideElicitationPopupPostSubmit();
	            }
	        }
	    });
	})(EAT, window);

/***/ },
/* 37 */
/***/ function(module, exports) {

	(function (EAT, Ember, ElicitationUtils, window, undefined) {
	    "use strict";

	    EAT.Elicitation = Ember.Object.extend({
	        /* BEGIN: initialization properties: These properties should probably be initialized or bound upon creation */
	        elicitationDefinition: null, // bind this to a string to load the elicitation definition XML
	        priorSessionData: null, // serialized data from a previous session of eliciting
	        priorDataRaw: null, // elicitation author defined per-person data, will be bound into variables

	        resumedFromPriorSessionData: false,
	        resumedStartingOnPageNum: null,

	        embedded: false,
	        allowEditing: false,
	        editorWithoutAssignment: false, // if true, can edit, but can't submit responses
	        switchToEditModeAfterLoading: false, // this property is a bad hack, but something goes wrong if we default to editMode: true
	        switchToReviewModeAfterLoading: false,

	        email: null,
	        notTheLatestRevision: null,
	        elicitationDefinitionID: null,
	        cannotReachServer: false,

	        saveDataURL: null,
	        discussionURL: null,
	        saveDefinitionURL: null,
	        redirectAfterSubmitURL: null,
	        imageURL: null,
	        uploadImageURL: null,

	        /* admin urls */
	        reviewAdminURL: null,
	        assignedToAdminURL: null,
	        dataAdminURL: null,
	        changeHistoryAdminURL: null,

	        completePageMessage: null,
	        completePageIncludeLinkToDiscussion: null,

	        personID: null,

	        /* END: initialization properties */

	        init: function init() {
	            this._super();

	            window.debug.elicitation = this;

	            // restore serialized data from a previous run of eliciting, if it exists
	            var priorSessionData = {};
	            var resumeFromPriorSessionData = false;
	            try {
	                priorSessionData = JSON.parse(this.get('priorSessionData'));
	                resumeFromPriorSessionData = true;
	            } catch (e) {}

	            // First setup the various controllers and objects
	            this.set('pageFooter', EAT.PageFooterController.create());
	            this.set('customWidgets', EAT.CustomWidgetsController.create());
	            this.set('phraseDefinitions', EAT.PhraseDefinitionsController.create());
	            this.set('pagesController', EAT.PagesController.create({ elicitation: this }));
	            this.set('serializedData', EAT.RootSerializedData.create(priorSessionData));
	            this.set('markdownConverter', EAT.CreateMarkdownConverter(this));

	            // Now load the serialized elicitation from an XML string
	            this.loadFromXML(this.get('elicitationDefinition'));

	            var customScriptingVariables = Ember.ArrayController.create();
	            this.set('customScriptingVariables', customScriptingVariables);

	            // parse priorDataRaw into custom scripting variables
	            try {
	                var priorData = JSON.parse(this.get('priorDataRaw'));
	                for (var key in priorData) {
	                    if (priorData.hasOwnProperty(key)) {
	                        customScriptingVariables.pushObject(Ember.Object.create({
	                            name: key,
	                            value: priorData[key]
	                        }));
	                    }
	                }
	            } catch (e) {
	                console.error("Couldn't parse priorData: ", e);
	            };

	            if (resumeFromPriorSessionData) {
	                this.resumeFromPriorSessionData();
	            }

	            // Run BeforeEntering scripts on the initial page (=page1 unless we resumed on a later page)
	            Ember.run.next(this, function () {
	                // we do this in the next run loop so variable bindings have been resolved
	                this.get('pagesController').runBeforeEnteringOnCurrentPage();
	            });

	            var self = this;

	            // FIXME: bad hack, mysterious "inBuffer" problem if editMode defaults to 'true'
	            if (this.get('switchToEditModeAfterLoading')) {
	                window.setTimeout(function () {
	                    self.set('editMode', true);
	                }, 500);
	            } else if (this.get('switchToReviewModeAfterLoading')) {
	                window.setTimeout(function () {
	                    self.set('reviewMode', true);
	                }, 500);
	            }

	            // FIXME: this should probably be unbound to clean up the resources
	            // see: https://github.com/emberjs/ember.js/issues/1603
	            $(window).bind('beforeunload', function () {
	                return self.beforeUnload();
	            });

	            confidentialityIndicator.initialize($("#confidentiality-indicator-box"));
	            confidentialityIndicator.setPolicy({
	                "Your Participation": "Public",
	                "Your Responses (not attributed)": "Panel Only",
	                "Your Responses (attributed)": "Confidential"
	            });
	        },
	        resumeFromPriorSessionData: function resumeFromPriorSessionData() {
	            var currentPageNum;
	            if (currentPageNum = this.get('serializedData.metadata.currentPageNum')) {
	                console.log("elicitation.resumeFromPriorSessionData(): setting page num to ", currentPageNum);
	                this.set('pagesController.currentPageNum', currentPageNum);
	                this.set('resumedFromPriorSessionData', true);
	                this.set('resumedStartingOnPageNum', currentPageNum);
	            }
	        },
	        loadFromXML: function loadFromXML(elicitationDefinitionString) {
	            var xml = $($.parseXML(elicitationDefinitionString));
	            var elicitationXML = xml.find("elicitation");

	            this.get('customWidgets').loadFromXML(elicitationXML.children("custom-widget"));

	            // Load pages from XML
	            this.get('pagesController').loadPagesFromXML(elicitationXML.children("page"));

	            // Load phrase definitions from XML file
	            this.get('phraseDefinitions').loadPhrasesFromXML(elicitationXML.children("definition"));

	            this.get('pageFooter').loadFromXML(elicitationXML.children("page-footer"));
	        },

	        numPages: Ember.computed.alias('pagesController.numPages'),
	        currentPageBinding: 'pagesController.currentPage',
	        widgets: Ember.computed.alias('pagesController.allWidgets'),

	        editMode: false,
	        reviewMode: false,
	        widgetGalleryIsOpen: false,
	        widgetGalleryAddsToPage: null,
	        hideScrollbarsWhenWidgetGalleryIsShown: function () {
	            if (this.get('widgetGalleryIsOpen')) {
	                $("html").css('overflow-y', 'hidden');
	            } else {
	                $("html").css('overflow-y', 'auto');
	            }
	        }.observes('widgetGalleryIsOpen'),

	        hasBeenEdited: false,
	        saveInProgress: false,
	        saveMessage: null,
	        widgetBeingEdited: null,
	        markdownConverter: null, // set in ready()
	        customScriptingVariables: undefined,
	        closeWidgetBeingEditedOnEditModeChange: function () {
	            this.set('widgetBeingEdited', null);
	        }.observes('editMode'),
	        beforeUnload: function beforeUnload() {
	            var firefox = /Firefox[\/\s](\d+)/.test(navigator.userAgent);

	            if (this.get('allowEditing') && !this.get('definitionIsSaved')) {
	                return "You may have unsaved changes to the elicitation.";
	            } else if (!(this.get('submitted') || this.get('serializedDataIsEmpty') || firefox)) {
	                return "You can resume where you left off by visiting this elicitation again at a later time. You won't be able to go backward from this point, but all your previous responses will be preserved if you resume later.";
	            }
	        },
	        print: function print() {
	            window.print();
	        },
	        saveChangesAs: function saveChangesAs() {
	            var newName = prompt("Title for new elicitation?");
	            if (Ember.isNone(newName)) {
	                // cancel, nothing to do
	            } else if (newName.length < 4) {
	                alert("WARNING: The title for the new elicitation was too short, not saving, please try again.");
	            } else {
	                this.saveChanges(newName);
	            }
	        },
	        saveChanges: function saveChanges(saveAsNewElicitationName) {
	            var saveAsNewElicitation = saveAsNewElicitationName != undefined;

	            this.set('saveInProgress', true);
	            this.set('saveMessage', undefined);

	            var url = this.get('saveDefinitionURL');

	            var serialized = this.serializeDefinition()[0];
	            ElicitationUtils.removeXMLInvalidCharacters(serialized);
	            serialized = ElicitationUtils.outerXML(serialized);

	            if (this.get('notTheLatestRevision') && !confirm("Warning: you are editing a revision, saving" + " changes will replace the latest version.")) {
	                return;
	            }

	            // FIXME: disabled until we can make it optional
	            // nobody except seth actually summarizes anyway, so its just a hassle, right?
	            //
	            //var changeSummary = prompt("Saving Elicitation. Summarize what you changed:");
	            var changeSummary = "";

	            if (Ember.isNone(changeSummary)) return;

	            // console.log("saveChanges(), saving: ", serialized);

	            var dataToSubmit = {
	                ElicitationDefinition: serialized,
	                ChangeSummary: changeSummary,
	                SaveAsNewElicitation: saveAsNewElicitation,
	                SaveAsNewElicitationName: saveAsNewElicitationName
	            };

	            // We set this here instead of after successfully saving because they may
	            // start editing between, and we don't want to overwrite that state
	            // but if we fail, we'll mark this true again
	            this.set('definitionHasBeenEdited', false);

	            var self = this;
	            jQuery.post(url, dataToSubmit, function (data, textStatus, jqXHR) {
	                var date = new Date();
	                var hours = date.getHours();
	                var suffix = hours > 12 ? "p" : "a";
	                hours = hours > 12 ? hours - 12 : hours;
	                var minutes = date.getMinutes();
	                minutes = minutes < 10 ? " " + minutes.toString() : minutes.toString();
	                var timeSaved = hours + ":" + minutes + suffix;

	                var saveMessage = "Last save: " + timeSaved;
	                if (saveAsNewElicitation) {
	                    saveMessage = "Saved a copy";
	                    alert("A new elicitation named '" + saveAsNewElicitationName + "' has been created. You can access it from the discussion.");
	                }
	                self.set('saveMessage', saveMessage);

	                console.log("saveChanges(), server response:", data);
	            }).fail(function (jqXHR, textStatus, errorThrown) {
	                window.debug.JqXHR = jqXHR;
	                window.debug.TextStatus = textStatus;
	                window.debug.ErrorThrown = errorThrown;

	                // We didn't save, so the definition is (probably, might as well be safe) dirty
	                self.set('definitionHasBeenEdited', true);

	                alert("Error saving elicitation, is your internet still connected? Please try to save again.\n\n\t" + jqXHR.responseText);
	                self.set('saveMessage', "Problem saving!");
	                console.error("elicitation.saveChanges(), window.debug.definition=");
	                window.debug.definition = serialized;
	                console.warn(window.debug.definition);
	                console.error("Error was:", jqXHR.responseText);
	            }).always(function () {
	                self.set('saveInProgress', false);
	            });
	        },
	        definitionIsSaved: function () {
	            return !(this.get('definitionHasBeenEdited') || this.get('saveInProgress'));
	        }.property('definitionHasBeenEdited', 'saveInProgress'),
	        definitionHasBeenEdited: false,
	        watchWhenDefinitionIsEdited: function () {
	            this.set('definitionHasBeenEdited', true);
	        }.observes('widgetBeingEdited'),
	        serializeDefinition: function serializeDefinition() {
	            // This is required because the javascript data output format
	            // can't have duplicate page keys (title).
	            // Oops. Can be fixed by giving each page a UUID
	            this.get('pagesController').renameDuplicatePageTitles();

	            var doc = $.parseXML("<elicitation></elicitation>");
	            var serialized = $(doc).find("elicitation");

	            this.get('pagesController').forEach(function (page) {
	                serialized.append(page.serializeDefinition(doc));
	            });

	            serialized.append(this.get('phraseDefinitions').serializeDefinition(doc));
	            serialized.append(this.get('pageFooter').serializeDefinition(doc));
	            serialized.append(this.get('customWidgets').serializeDefinition(doc));

	            return serialized;
	        },
	        variables: function () {
	            var variables = [];
	            var widgets = this.get('widgets');
	            if (!Ember.isNone(widgets)) {
	                widgets.forEach(function (widget) {
	                    widget.get('definition.variables').forEach(function (variable) {
	                        variables.push(variable);
	                    });
	                });
	            }

	            // merge in customScriptingVariables
	            var customScriptingVariables = this.get('customScriptingVariables');
	            customScriptingVariables.forEach(function (variable) {
	                variables.push(variable);
	            });

	            return variables;
	        }.property('widgets.@each.definition.variables.@each', 'customScriptingVariables.@each'),
	        variableScope: function () {
	            var scope = {};
	            this.get('variables').forEach(function (variable) {
	                try {
	                    scope[variable.get('name')] = variable.get('value');
	                } catch (e) {
	                    console.error("\tvariableScope(): error getting a variable", variable, e);
	                }
	            });
	            return scope;
	        }.property('variables', 'variables.@each', 'variables.@each.name', 'variables.@each.value'),
	        submitted: false,
	        pendingSubmitDataRequest: null,
	        submitData: function submitData(finalSubmission) {
	            var data = this.get('serializedData');
	            window.debug.lastSubmitData = data;

	            if (finalSubmission) console.log("submitData(): ", data);

	            var email = this.get('email');
	            var dataToSubmit = [{
	                name: 'email',
	                value: email
	            }, {
	                name: "elicitation_definition_id",
	                value: this.get('elicitationDefinitionID')
	            }];

	            if (finalSubmission) {
	                dataToSubmit.push({ name: 'completed', value: '1' });
	                $("input#next").val("Submitting...").attr("disabled", "disabled");
	            }

	            var json = JSON.stringify(data);
	            dataToSubmit.push({
	                name: 'json',
	                value: json
	            });

	            var pendingSubmitDataRequest = this.get('pendingSubmitDataRequest');
	            if (pendingSubmitDataRequest) {
	                pendingSubmitDataRequest.abort();
	            }

	            var url = this.get('saveDataURL');
	            if (url == undefined) url = '/';

	            if (finalSubmission) console.log(json);
	            window.debug.lastSubmitJSON = json;

	            if (this.get('editorWithoutAssignment')) {
	                console.warn("submitData(): moderator/admin without assignment, not submitting. see window.debug.lastSubmitJSON");

	                if (finalSubmission) {
	                    alert("As an admin/moderator you can edit this elicitation.\n\nBut you haven't assigned it to yourself, so you can't submit data responses to the server (yet).\n\nIf you want to test data submission, first assign the elicitation to yourself, then try submitting again.");
	                } else {
	                    return; // silently surpress non-final submissions if we don't have an assignment, but we ARE an admin
	                }
	            }

	            var elicitation = this;
	            pendingSubmitDataRequest = jQuery.post(url, dataToSubmit, function (data, textStatus, jqXHR) {
	                elicitation.set('pendingSubmitDataRequest', null);
	                elicitation.set('errorSubmittingToServer', false);

	                if (finalSubmission) {
	                    /* FIXME: ollllllld relic, this should be emberified! */
	                    elicitation.set('submitted', true);
	                    $("div#footer").fadeOut();
	                    $(".elicitation").fadeOut('fast', function () {
	                        var onSubmit = $("div.post-submit").attr("onSubmit");
	                        if (onSubmit != null && onSubmit.length > 0) {
	                            eval(onSubmit);
	                        } else if (elicitation.get('redirectAfterSubmitURL')) {
	                            window.location = elicitation.get('redirectAfterSubmitURL');
	                        } else {
	                            $("div.post-submit").fadeIn('fast');
	                        }
	                    });
	                }
	            }).fail(function (jqXHR, textStatus, errorThrown) {
	                window.debug.JqXHR = jqXHR;
	                window.debug.TextStatus = textStatus;
	                window.debug.ErrorThrown = errorThrown;
	                window.debug.ResponseText = jqXHR.responseText;

	                console.warn("window.debug.lastSubmitData = ", window.debug.lastSubmitData);
	                console.warn("window.debug.lastSubmitJSON = ", window.debug.lastSubmitJSON);
	                console.error("submitData() failed, server responded with an error:\n\n", debug.ErrorThrown, "\n", debug.ResponseText, "\n");

	                elicitation.set('errorSubmittingToServer', true);

	                if (finalSubmission) {
	                    $("input#next").val("Try to Submit Again").attr("disabled", false);
	                    alert("Uhoh! We couldn't connect to the server to save your response data. Try submitting again?\n\nIf that doesn't work, please follow the instructions at the bottom of the page to submit by email.");
	                    elicitation.set('showSerializedData', "URL: " + url + "\n" + "Email: " + email + "\n" + "Date: " + new Date().toString() + "\nData:\n" + json);
	                }
	            });

	            this.set('pendingSubmitDataRequest', pendingSubmitDataRequest);
	        },
	        stateSave: function stateSave() {
	            var widgetState = {};
	            this.get('widgets').forEach(function (widget) {
	                try {
	                    widgetState[widget.get('dataKey')] = widget.stateSave();
	                } catch (e) {
	                    console.log("Error saving state of widget ", widget.get('dataKey'), e);
	                }
	            });
	            return {
	                widgets: widgetState
	            };
	        },
	        stateResume: function stateResume(state) {
	            var widgets = this.get('widgets');
	            var widgetState = state.widgets;
	            Ember.keys(widgetState).forEach(function (widgetID) {
	                try {
	                    var widget = widgets.findBy('dataKey', widgetID);
	                    widget.stateResume(widgetState[widgetID]);
	                    widget.redraw();
	                } catch (e) {
	                    console.log("Error restoring state of widget ", widgetID, e);
	                }
	            });
	        },

	        getSerializedData: function getSerializedData() {
	            return JSON.parse(JSON.stringify(this.get('serializedData')));
	        },
	        getSerializedDataFor: function getSerializedDataFor(widgetID) {
	            var allData = this.getSerializedData();
	            var keys = Ember.keys(allData);
	            for (var i = 0; i < keys.length; i++) {
	                var page = allData[keys[i]];
	                var widget = page[widgetID];
	                if (widget) {
	                    return widget.data;
	                }
	            }
	            return undefined;
	        },

	        // Used by EAT.Test.ping to ensure we've loaded an elicitation
	        ping: function ping(message) {
	            console.log("Elicitation.ping: ", message);
	            return "ping: " + message;
	        },

	        /*
	        debugWatchVariables: function () {
	            console.log("Variables changed:");
	            this.get('variables').forEach(function (variable) {
	                console.log("\t", variable);
	            });
	        }.observes('variables'),
	        */

	        firstWidget: function () {
	            return this.get('pagesController.firstObject.widgets.firstObject');
	        }.property().volatile(), // volatile because this is mostly a debug method
	        showAllPages: function () {
	            return this.get('editMode') || this.get('reviewMode');
	        }.property('editMode', 'reviewMode'),

	        serializedDataIsEmpty: true,

	        // Initialized in init()
	        pageFooter: null,
	        customWidgets: null,
	        serializedData: null,
	        setSerializedDataForPage: function setSerializedDataForPage(pageDataKey, dataForPage) {
	            var data = this.get('serializedData');
	            data[pageDataKey] = dataForPage;

	            this.notifyPropertyChange('serializedData');
	        },
	        updateSerializedDataMetadata: function updateSerializedDataMetadata(elicitationComplete) {
	            this.get('serializedData')['metadata'] = {
	                currentPageNum: this.get('pagesController.currentPageNum'),
	                elicitationIsComplete: elicitationComplete,
	                resumedFromPriorSessionData: this.get('resumedFromPriorSessionData')
	            };

	            this.notifyPropertyChange('serializedData');
	        },
	        phraseDefinitions: null,
	        pagesController: null
	    });
	})(EAT, Ember, ElicitationUtils, window);

/***/ },
/* 38 */
/***/ function(module, exports) {

	(function (EAT, ElicitationUtils, window, undefined) {
	    "use strict";

	    EAT.Schema = Ember.ArrayController.extend({
	        init: function init() {
	            this.set('content', Ember.A(this.get('content')));
	        },
	        propertiesBinding: 'content',
	        definitionModel: EAT.WidgetDefinition,
	        createDefinition: function createDefinition(parent, serializedDefinition) {
	            var definition = this.get('definitionModel').create({
	                schema: this,
	                parent: parent
	            });
	            var newParent = definition;

	            this.forEach(function (property) {
	                var propertyAccessor = property.accessor;
	                var value = undefined;
	                var propName = property.get('name');

	                if (Ember.isNone(propertyAccessor)) {
	                    console.log("WARNING: property '" + propName + "' has no accessor defined in its definitionSchema");
	                }

	                if (serializedDefinition) {

	                    value = propertyAccessor.loadFromDefinition(newParent, serializedDefinition);
	                }

	                if (Ember.isNone(value)) {
	                    value = definition.get(propName);
	                    if (Ember.isNone(value) && propertyAccessor.getDefault) {
	                        value = propertyAccessor.getDefault();
	                    }
	                }

	                // Now cast the property to the correct type
	                if (!Ember.isNone(value)) {
	                    var propType = property.get('type');
	                    if (propType == "Boolean") {
	                        value = value == "true";
	                    }
	                }

	                definition.set(propName, value);
	            });
	            return definition;
	        },
	        addProperty: function addProperty(name, newProperty) {
	            newProperty.set('name', name);
	            newProperty.set('schema', this);
	            this.pushObject(newProperty);
	        }
	    });

	    EAT.Schema.reopenClass({
	        createFromHash: function createFromHash(schemaHash) {
	            var initial = {};
	            var schema = EAT.Schema.create();

	            for (var propName in schemaHash) {
	                if (propName == "model") continue;
	                var newProperty = EAT.SchemaProperty.create(schemaHash[propName]);
	                schema.addProperty(propName, newProperty);
	            }

	            if (schemaHash.model) {
	                schema.set('definitionModel', schemaHash.model);
	            } else {
	                schema.set('definitionModel', EAT.WidgetDefinition);
	            }

	            return schema;
	        }
	    });

	    EAT.SchemaProperty = Ember.Object.extend({
	        name: undefined,
	        category: "",
	        type: "String",
	        emphasizeWhenEmpty: false, // for HasMany SchemaProperties, set to true to freak out if empty
	        editorView: function () {
	            return EAT.PropertyEditors.get(this.get('type'));
	        }.property(),
	        prettyName: function () {
	            var name = this.get('name');
	            return name.charAt(0).toUpperCase() + name.slice(1);
	        }.property('name'),
	        prettyNamePlural: function () {
	            return this.get('prettyName') + "s";
	        }.property('prettyName'),
	        hasMany: function () {
	            return this.get('type') === "HasMany";
	        }.property('type'),
	        visible: true
	    });
	})(EAT, ElicitationUtils, window);

/***/ },
/* 39 */
/***/ function(module, exports) {

	(function (EAT, ElicitationUtils, window, undefined) {
	    "use strict";

	    EAT.PropertyEditorView = Ember.View.extend({
	        content: null,
	        value: undefined,
	        property: undefined,
	        parentDefinition: undefined,
	        toggleHelpText: function toggleHelpText() {
	            var helpText = this.$().find(".help-text");
	            if (helpText.is(":visible")) {
	                helpText.slideUp();
	            } else {
	                helpText.slideDown();
	            }
	        }
	    });

	    var EnumPropertyEditorView = EAT.PropertyEditorView.extend({
	        templateName: 'property-editor-enum',
	        classNames: ['property-editor', 'property-editor-enum']
	    });

	    var ImagePropertyEditorView = EAT.PropertyEditorView.extend({
	        templateName: 'property-editor-image',
	        classNameBindings: [':property-editor', ':property-editor-image', 'uploadInProgress'],
	        uploadInProgress: false,
	        message: undefined,
	        clearFileInput: function clearFileInput() {
	            this.$(':file')[0].value = "";
	        },
	        actions: {
	            fileChanged: function fileChanged() {
	                var fileInput = this.$(':file')[0];
	                var file = fileInput.files[0];

	                var name = file.name;
	                var size = file.size;
	                var type = file.type;

	                var rejectFile = false;
	                if (file.size > 2000000) {
	                    alert("The maximuum file size we permit is 2MB.\n\nPlease resize the image '" + file.name + "'in an image editor such as Adobe Photoshop, and/or save it in JPEG format.");
	                    rejectFile = true;
	                }

	                if (!["image/jpeg", "image/png", "image/gif"].contains(file.type)) {
	                    alert("We do not support images in '" + file.type + "' format.\n\nPlease convert the image to JPEG, PNG or GIF format using an image editor such as Adobe Photoshop.");
	                    rejectFile = true;
	                }

	                if (rejectFile) {
	                    this.clearFileInput();
	                } else {
	                    this.uploadImage();
	                }
	            }
	        },
	        uploadImage: function uploadImage() {
	            var self = this;

	            // FIXME: do we want to rely on controller. methods here?
	            // But its pretty far to inject the elicitation... dunno
	            var url = this.get('controller.elicitation.uploadImageURL');

	            var formData = new FormData(this.$('form.image-upload')[0]);

	            function progressHandlingFunction(e) {
	                if (e.lengthComputable) {
	                    self.$('progress').attr({ value: e.loaded, max: e.total });
	                }
	            }

	            this.set('uploadInProgress', true);
	            this.set('message', "Uploading image...");

	            $.ajax({
	                url: url,
	                type: 'POST',
	                dataType: 'json',
	                xhr: function xhr() {
	                    var myXhr = $.ajaxSettings.xhr();
	                    if (myXhr.upload) {
	                        myXhr.upload.addEventListener('progress', progressHandlingFunction, false);
	                    }
	                    return myXhr;
	                },
	                // Form data
	                data: formData,
	                //Options to tell JQuery not to process data or worry about content-type
	                cache: false,
	                contentType: false,
	                processData: false
	            }).done(function (data) {
	                if (Ember.isNone(data)) {
	                    alert("Upload failed, not sure why, are you connected to the internet?");
	                    self.set('message', "Upload failed");
	                } else if (!data.success) {
	                    alert("Error uploading image:\n" + data.errorMessage);
	                    self.set('message', "Upload failed: " + data.errorMessage);
	                } else {
	                    self.set('value', data.imageID);
	                    self.set('message', "New image uploaded!");
	                }
	            }).fail(function (jqXHR, textStatus, errorThrown) {
	                console.log("Error was: ", errorThrown);
	                alert("Upload failed, not sure why, are you connected to the internet?");
	                self.set('message', "Upload failed");
	                window.debug.jqXHR = jqXHR;
	            }).always(function () {
	                self.set('uploadInProgress', false);
	                self.clearFileInput();
	            });
	        }
	    });

	    EAT.PropertyEditors = Ember.Object.create({
	        String: EAT.PropertyEditorView.extend({
	            templateName: 'property-editor-string',
	            classNames: ['property-editor', 'property-editor-string']
	        }),
	        Boolean: EAT.PropertyEditorView.extend({
	            templateName: 'property-editor-boolean',
	            classNames: ['property-editor', 'property-editor-boolean']
	        }),
	        Formula: EAT.PropertyEditorView.extend({
	            elicitationBinding: 'controller.elicitation',
	            templateName: 'property-editor-formula',
	            classNames: ['property-editor', 'property-editor-formula'],

	            // FIXME: we should really not hardcode this, and a property
	            // on the schema should specify what key to read this from
	            // or it should be a field on the condition itself
	            resultBinding: "parentDefinition.formulaResult",
	            formulaElements: function () {
	                console.log("Getting formula elements");
	                var elements = this.get('elicitation.variables').getEach('name');
	                elements.push(">");
	                elements.push("<");
	                elements.push(">=");
	                elements.push("<=");
	                elements.push("==");
	                console.log("Returning", elements);
	                return elements;
	            }.property('elicitation.variables.@each.name'),
	            appendDataKey: function () {
	                var dataKeyToAppend = this.get('dataKeyToAppend');
	                if (Ember.isNone(dataKeyToAppend)) return;

	                var value = this.get('value');
	                value += dataKeyToAppend;
	                this.set('value', value);

	                this.set('dataKeyToAppend', null);
	            }.observes('dataKeyToAppend')
	        }),
	        Text: EAT.PropertyEditorView.extend({
	            templateName: 'property-editor-text',
	            classNames: ['property-editor', 'property-editor-text']
	        }),
	        MillionsOfDollars: EAT.PropertyEditorView.extend({
	            templateName: 'property-editor-millions-of-dollars',
	            classNames: ['property-editor', 'property-editor-millions-of-dollars']
	        }),
	        Image: ImagePropertyEditorView,
	        Enum: EnumPropertyEditorView,
	        /* Use Enum like this:
	            choiceType: {
	                prettyName: "Type of column",
	                type: "Enum",
	                values: [
	                    { value: "radio", label: "Radio" },
	                    { value: "checkbox", label: "Check Box" },
	                    { value: "text", label: "Text Entry" }
	                ],
	                accessor: EAT.WidgetDefinition.Attr('choice-type')
	            }
	        */
	        Color: EAT.PropertyEditorView.extend({
	            templateName: 'property-editor-color',
	            classNames: ['property-editor', 'property-editor-color'],
	            didInsertElement: function didInsertElement() {
	                this._super();
	                console.log("Converting to miniColors");
	                this.$().find("input#color").miniColors({
	                    letterCase: 'uppercase',
	                    change: function change(hex, rgb) {
	                        console.log("Change happened", hex);
	                    }
	                });
	            }
	        }),
	        HasMany: EAT.PropertyEditorView.extend({
	            templateName: 'property-editor-hasmany',
	            classNames: ['property-editor', 'property-editor-hasmany'],
	            childrenBinding: 'value',
	            moveChild: function moveChild(child, directionToMove) {
	                var children = this.get('children');
	                var childIndex = children.indexOf(child);
	                var newChildIndex = childIndex + directionToMove;
	                if (newChildIndex >= 0 && newChildIndex < children.get('length')) {
	                    children.removeAt(childIndex);
	                    children.insertAt(newChildIndex, child);
	                }
	            },
	            actions: {
	                addChild: function addChild() {
	                    var children = this.get('children');
	                    var schema = children.get('schema');
	                    var newChild = schema.createDefinition(this.get('parentDefinition'));
	                    children.pushObject(newChild);
	                },
	                removeChild: function removeChild(child) {
	                    var children = this.get('children');
	                    children.removeObject(child);
	                },

	                moveChildUp: function moveChildUp(child) {
	                    this.moveChild(child, -1);
	                },
	                moveChildDown: function moveChildDown(child) {
	                    this.moveChild(child, 1);
	                }
	            }
	        })
	    });
	})(EAT, ElicitationUtils, window);

/***/ },
/* 40 */
/***/ function(module, exports) {

	(function (EAT, ElicitationUtils, window, undefined) {
	    "use strict";

	    EAT.WidgetDefinition = Ember.Object.extend({
	        schema: null,
	        label: "What is your question?",
	        categories: function () {
	            var propsAndValues = this.get('propertiesAndValues');
	            var categories = {};
	            var categoryNames = Ember.Set.create();
	            propsAndValues.forEach(function (propAndValue) {
	                var category = propAndValue.get('property.category');
	                var props = Ember.A(categories[category]);
	                props.pushObject(propAndValue);
	                categories[category] = props;
	                categoryNames.push(category);
	            });
	            return categoryNames.toArray().sort().map(function (categoryName) {
	                return {
	                    name: categoryName,
	                    propertiesAndValues: categories[categoryName],
	                    defaultCategory: categoryName === ""
	                };
	            });
	        }.property('schema', 'propertiesAndValues'),
	        propertiesAndValues: function () {
	            var schemaProperties = this.get('schema.properties');
	            var props = [];
	            for (var i = 0; i < schemaProperties.length; i++) {
	                var property = schemaProperties[i];
	                props.pushObject(Ember.Object.create({
	                    property: property,
	                    definition: this,
	                    valueBinding: 'definition.' + property.get('name')
	                }));
	            }
	            return props;
	        }.property('schema'),
	        serialize: function serialize(toElement) {
	            var schemaProperties = this.get('schema.properties').filter(function (property) {
	                return !(property.get('dontSerialize') == true);
	            });
	            for (var i = 0; i < schemaProperties.length; i++) {
	                var property = schemaProperties[i];
	                var value = this.get(property.get('name'));

	                property.get('accessor').serialize(toElement, value);
	            }
	        },
	        dataKeyTextBinding: 'label',
	        dataKey: function () {
	            var dataKeyText = this.get('dataKeyText');
	            if (!dataKeyText) {
	                console.log("WARNING: this widget has no dataKey() attribute, nor a dataKeyText() attribute defined to make a dataKey from. Data loss will probably occur");
	            }
	            return EAT.makeDataKeyFromText(dataKeyText);
	        }.property('dataKeyText')
	    });

	    EAT.WidgetDefinition.reopenClass({
	        HasManyArray: Ember.ArrayController.extend(),
	        ChildNode: function ChildNode(tagName) {
	            EAT.definitionDOMElements.addObject(tagName);

	            tagName = tagName.toLowerCase();
	            return {
	                loadFromDefinition: function loadFromDefinition(parent, def) {
	                    return def.children(tagName).text();
	                },
	                serialize: function serialize(def, value) {
	                    var doc = def[0].ownerDocument;
	                    var newTag = $(doc.createElement(tagName));
	                    newTag.text(value);
	                    def.append(newTag);
	                }
	            };
	        },
	        Attr: function Attr(attrName) {
	            attrName = attrName.toLowerCase();
	            return {
	                loadFromDefinition: function loadFromDefinition(parent, def) {
	                    return def.attr(attrName);
	                },
	                serialize: function serialize(def, value) {
	                    def.attr(attrName, value);
	                }
	            };
	        },
	        Contents: function Contents() {
	            return {
	                loadFromDefinition: function loadFromDefinition(parent, def) {
	                    // This used to use def.html() on load and serialize
	                    // but now we're using only the text(), which means
	                    // all contents must be CDATA. Probably not a problem
	                    // given the way we /actually/ use this in the EAT
	                    // but something to be aware of.
	                    return def.text();
	                },
	                serialize: function serialize(def, value) {
	                    // FIXME: might be smart to check that def is all textNodes
	                    // before we save here
	                    var doc = def[0].ownerDocument;
	                    def.append(doc.createTextNode(value));
	                }
	            };
	        },
	        HasMany: function HasMany(tagName, schemaHash, hasManyModel) {
	            EAT.definitionDOMElements.addObject(tagName);
	            tagName = tagName.toLowerCase();
	            var schema = EAT.Schema.createFromHash(schemaHash);

	            if (Ember.isNone(hasManyModel)) hasManyModel = EAT.WidgetDefinition.HasManyArray;

	            return {
	                getDefault: function getDefault() {
	                    return hasManyModel.create({
	                        content: [],
	                        schema: schema
	                    });
	                },
	                loadFromDefinition: function loadFromDefinition(parent, def) {
	                    var many = [];
	                    def.children(tagName).each(function () {
	                        var childSerializedDefinition = $(this);
	                        var childDefinition = schema.createDefinition(parent, childSerializedDefinition);
	                        many.pushObject(childDefinition);
	                    });

	                    return hasManyModel.create({
	                        content: many,
	                        schema: schema
	                    });
	                },
	                serialize: function serialize(def, childDefinitions) {
	                    var doc = def[0].ownerDocument;

	                    childDefinitions.forEach(function (childDefinition) {
	                        var newTag = $(doc.createElement(tagName));
	                        childDefinition.serialize(newTag);
	                        def.append(newTag);
	                    });
	                }
	            };
	        }
	    });

	    EAT.WidgetDefinitionEditorView = Ember.View.extend({
	        contentBinding: 'definition',
	        definition: null,
	        templateName: "widget-definition-editor"
	    });

	    EAT.WidgetDefinitionEditorCategoryView = Ember.View.extend({
	        expanded: false,
	        actions: {
	            toggleExpanded: function toggleExpanded() {
	                this.set('expanded', !this.get('expanded'));
	            }
	        }
	    });
	})(EAT, ElicitationUtils, window);

/***/ },
/* 41 */
/***/ function(module, exports) {

	(function (EAT, ElicitationUtils, window, undefined) {
	    "use strict";

	    // HERE

	    EAT.WidgetQualification = Ember.Object.extend({
	        widget: undefined,
	        content: undefined,
	        propertyName: undefined,
	        prettyName: undefined,
	        xmlAttr: undefined,
	        editorView: EAT.QualificationEditorView,
	        serializedDataBinding: 'content',
	        init: function init() {
	            this._super();

	            // Bind to widget.definition.#propertyName# and widget.data.#propertyName#
	            this.bind('enabledInDefinition', 'widget.definition.' + this.get('propertyName'));
	            this.bind('enabledInData', 'widget.data.' + this.get('propertyName'));
	        },
	        enabledInDefinition: undefined, // bound in init
	        enabledInData: undefined, // bound in init
	        beenHighlightedByView: false, // BAD: breaks separation of concerns
	        showQualification: function () {
	            return this.get('enabledInDefinition'); // || this.get('enabledInData');
	        }.property('enabledInDefinition', 'enabledInData'),
	        disableTogglingForParticipant: function () {
	            return this.get('enabledInDefinition');
	        }.property('enabledInDefinition')
	    });

	    EAT.QualificationEditorView = Ember.View.extend({
	        classNames: ["qualification-editor"],
	        content: undefined, // bound to the associated qualification
	        didInsertElement: function didInsertElement() {
	            if (this.get('content.showQualification') && !this.get('content.enabledInDefinition') && !this.get('content.beenHighlightedByView')) {
	                // This was just toggled on, for the first time, so lets highlight it (scroll to it, and flash it)
	                this.highlight();
	            }
	        },
	        highlight: function highlight() {
	            this.set('content.beenHighlightedByView', true);
	            var widget = this;
	            window.setTimeout(function () {
	                var domElement = widget.$();
	                $.scrollTo(domElement, 300, {
	                    offset: { top: -500 },
	                    axis: 'y',
	                    onAfter: function onAfter() {
	                        // jQuery-UI's animate function wets the bed (in bad ways: elicitations stop submitting!!!)
	                        // if you try to animate a backgroundColor on IE8
	                        // UGH!
	                        if (!(window.BrowserDetection.msie && window.BrowserDetection.version < 9)) {
	                            domElement.animate({ backgroundColor: "rgba(255,0,0,1.0)" }).animate({ backgroundColor: "rgba(255,255,255,0.0)" });
	                        }
	                    }
	                });
	            }, 50);
	        }
	    });

	    var DropdownQualificationEditorView = EAT.QualificationEditorView.extend({
	        templateName: "dropdown-qualification-editor-view",
	        selections: [{ value: 0, label: "0 - None" }, { value: 1, label: "1" }, { value: 2, label: "2 - Medium" }, { value: 3, label: "3" }, { value: 4, label: "4 - High" }]
	    });
	    var TextCommentQualificationEditorView = EAT.QualificationEditorView.extend({
	        templateName: "text-comment-qualification-editor-view",
	        classNames: ["text-comment"]
	    });

	    // This array defines the qualifications that experts (and elicitation authors) can apply to widgets
	    EAT.qualifications = Ember.A([EAT.WidgetQualification.extend({
	        propertyName: "qualifyExpertise",
	        prettyName: "Your Expertise",
	        xmlAttr: "qualify-expertise",
	        serializedDataBinding: "content.value",
	        editorView: DropdownQualificationEditorView
	    }), EAT.WidgetQualification.extend({
	        propertyName: "qualifyConfidence",
	        prettyName: "Your Confidence",
	        xmlAttr: "qualify-confidence",
	        serializedDataBinding: "content.value",
	        editorView: DropdownQualificationEditorView
	    }), EAT.WidgetQualification.extend({
	        propertyName: "qualifyTextComment",
	        prettyName: "Text Comment",
	        xmlAttr: "qualify-text-comment",
	        editorView: TextCommentQualificationEditorView
	    }) /*,
	       EAT.WidgetQualification.extend({
	         propertyName: "qualifyMostExpertParticipants",
	         prettyName: "Most Expert Participants",
	         xmlAttr: "qualify-most-expert-participants"
	       })*/
	    ]);
	})(EAT, ElicitationUtils, window);

/***/ },
/* 42 */
/***/ function(module, exports) {

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	(function (EAT, ElicitationUtils, window, undefined) {
	    "use strict";

	    EAT.WidgetData = Ember.Object.extend({
	        widget: undefined,
	        definition: undefined
	    });

	    EAT.WidgetData.reopenClass({
	        CreateTable: function CreateTable(args) {
	            var properties = $.extend({
	                tableModel: Ember.Object,
	                rowModel: Ember.Object,
	                colModel: Ember.Object,
	                cellModel: Ember.Object,
	                dataModel: null,
	                rowDefinitionsBinding: 'dataModel.definition.rows',
	                colDefinitionsBinding: 'dataModel.definition.cols'
	            }, args);

	            Ember.assert("Parameter dataModel must be specified", !Ember.isNone(properties.dataModel));

	            var Table = properties.tableModel.extend({
	                dataModel: properties.dataModel,
	                colDefinitionsBinding: properties.colDefinitionsBinding,
	                rowDefinitionsBinding: properties.rowDefinitionsBinding,
	                cols: function () {
	                    var table = this;
	                    return Ember.A(this.get('colDefinitions')).map(function (colDefinition) {
	                        return properties.colModel.create({
	                            definition: colDefinition,
	                            cells: null,
	                            table: table
	                        });
	                    });
	                }.property('colDefinitions.@each'),
	                rows: function () {
	                    var table = this;
	                    var cols = this.get('cols');

	                    // Reset the cols' cells, which are defined in this function
	                    cols.forEach(function (col) {
	                        col.set('cells', Ember.A([]));
	                    });

	                    var rows = Ember.A(this.get('rowDefinitions')).map(function (rowDefinition) {
	                        var row = properties.rowModel.create({
	                            definition: rowDefinition,
	                            table: table
	                        });
	                        row.set('cells', cols.map(function (col) {
	                            var cellModel = properties.cellModel.create({
	                                row: row,
	                                col: col,
	                                table: table
	                            });

	                            // Now make sure the cols know about it too!
	                            col.cells.pushObject(cellModel);

	                            return cellModel;
	                        }));
	                        return row;
	                    });
	                    return rows;
	                }.property('cols.@each', 'rowDefinitions.@each')
	            });

	            return Table.create();
	        },
	        tabularPropertyOld: function tabularPropertyOld(args) {
	            var properties = $.extend({
	                rowModel: Ember.Object,
	                cellModel: Ember.Object,
	                selfKeyName: 'dataModel'
	            }, args);

	            var definitionRowPath = properties.rowPath;
	            var definitionColPath = properties.colPath;
	            var selfKeyName = properties.selfKeyName;
	            var rowModelClass = properties.rowModel;
	            var cellModelClass = properties.cellModel;
	            var tableModelClass = properties.tableModel;

	            var rowPath_each = definitionRowPath + '.@each';
	            var colPath_each = definitionColPath + '.@each';

	            return function () {
	                var rowDefinitions = this.get(definitionRowPath);
	                var colDefinitions = this.get(definitionColPath);
	                var self = this;

	                var result = rowDefinitions.map(function (rowDefinition) {
	                    var row = rowModelClass.create({
	                        rowDefinition: rowDefinition
	                    });
	                    return;
	                    row.set('cells', colDefinitions.map(function (colDefinition) {
	                        var cellModel = cellModelClass.create({
	                            row: row,
	                            col: col
	                        });
	                        cellModel.set(selfKeyName, self);
	                        return cellModel;
	                    }));
	                });
	                return result;
	            }.property(rowPath_each, colPath_each);
	        }
	    });

	    function findLeafNodes(data, leafNodes, currentPath) {
	        if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) == "object") {
	            for (var key in data) {
	                if (!data.hasOwnProperty(key)) continue;
	                var childPath = Ember.isNone(currentPath) ? key : currentPath + "→" + key;
	                findLeafNodes(data[key], leafNodes, childPath);
	            }
	        } else {
	            leafNodes.push(Ember.Object.create({ key: currentPath, value: data }));
	        }
	    }

	    function JSONToPathArray(data) {
	        data = JSON.parse(JSON.stringify(data));
	        var leafNodes = [];
	        findLeafNodes(data, leafNodes);
	        return leafNodes;
	    }

	    EAT.WidgetDataExplorer = Ember.View.extend({
	        widget: undefined,
	        widgetID: function () {
	            return this.get('widget.dataKey');
	        }.property('widget.dataKey'),
	        data: undefined,
	        errors: undefined,
	        onInit: function () {
	            this.set('data', Ember.A(this.get('data')));
	        }.on('init'),
	        actions: {
	            storeData: function storeData() {
	                var widget = this.get('widget');
	                var dataStoreResult = widget.get('serializedData');
	                this.set('errors', dataStoreResult.get('errors'));

	                var rawData = dataStoreResult.get('data');

	                var leafNodes = JSONToPathArray(rawData);
	                this.set('data', leafNodes);
	                return;

	                // For greater authenticity, lets stringify to JSON and back
	                rawData = JSON.parse(JSON.stringify(rawData));

	                var data = Ember.A();
	                if ((typeof rawData === 'undefined' ? 'undefined' : _typeof(rawData)) === "object") {
	                    for (var key in rawData) {
	                        if (!rawData.hasOwnProperty(key)) continue;

	                        data.pushObject(Ember.Object.create({
	                            key: key,
	                            value: JSON.stringify(rawData[key])
	                        }));
	                    }
	                } else {
	                    data.pushObject(Ember.Object.create({
	                        key: "value",
	                        value: rawData.toString()
	                    }));
	                }
	                this.set('data', data);
	            }
	        },
	        templateName: "widget-data-explorer"
	    });
	})(EAT, ElicitationUtils, window);

/***/ },
/* 43 */
/***/ function(module, exports) {

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	(function (EAT, ElicitationUtils, window, undefined) {
	    "use strict";

	    EAT.Widget = Ember.View.extend({
	        stateGetPropertyNames: function stateGetPropertyNames(maxDepth, includeUndefinedProperties) {
	            maxDepth = maxDepth | 8;
	            includeUndefinedProperties = includeUndefinedProperties | false;

	            function IsComputedPropertyWithNoSetter(obj, prop) {
	                var meta = Ember.meta(obj);
	                if (meta && meta.descs && meta.descs[prop] && meta.descs[prop].func) {
	                    return meta.descs[prop].func.length < 2;
	                } else {
	                    return false;
	                }
	            }

	            /* ====================== */

	            function getPropertiesFor(widget, maxDepth, includeUndefinedProperties, skipKeys, skipPaths) {
	                var alreadyTraversed = new Set([widget, widget.get('definition'), widget.get('data')]);

	                function keys(x) {
	                    var keys = Ember.keys(x);
	                    if (x && x._stateSkipKeys) {
	                        keys = keys.filter(function (key) {
	                            return !x._stateSkipKeys.contains(key);
	                        });
	                    }
	                    return keys;
	                }

	                function getProperties(x, depth, fullPath) {
	                    if (depth > maxDepth) return [];

	                    return keys(x).filter(function (key) {
	                        return !(key[0] == "@" || key.slice(-7) == "Binding" || skipKeys.has(key));
	                    }).map(function (key) {
	                        var childPath = fullPath + "." + key;
	                        if (skipPaths.has(childPath)) return [];

	                        try {
	                            var child = Ember.get(x, key);

	                            if (typeof child === "string" || typeof child === "number" || typeof child === "boolean" || child === null | (includeUndefinedProperties && child === undefined)) {
	                                if (IsComputedPropertyWithNoSetter(x, key)) return []; // we don't want to override a 'read-only' property (i.e. no setter)
	                                // JSON value...
	                                return [childPath];
	                            } else if (Array.isArray(child) || (typeof child === 'undefined' ? 'undefined' : _typeof(child)) === "object" && child instanceof Ember.Object) {
	                                // Don't keep looking at it if we've already traversed the object
	                                if (alreadyTraversed.has(child)) return [];
	                                alreadyTraversed.add(child);

	                                return getProperties(child, depth + 1, childPath);
	                            } else {
	                                // If its not a JSON value, and its not an Array, and its not an Ember.Object, ignore it!
	                                return [];
	                            }
	                        } catch (e) {
	                            console.log("Couldn't get " + childPath, e);
	                            return [];
	                        }
	                    }).filter(function (x) {
	                        return x && x.length > 0;
	                    }).reduce(function (a, b) {
	                        return a.concat(b);
	                    }, []);
	                }

	                var defProps = getProperties(widget.get('definition'), 0, "definition");
	                var dataProps = getProperties(widget.get('data'), 0, "data");
	                return defProps.concat(dataProps);
	            }

	            /* ================= */
	            var skipPaths = new Set(this.statePathsToSkip());
	            var skipKeys = new Set(this.stateKeyNamesToSkip());

	            return getPropertiesFor(this, maxDepth, includeUndefinedProperties, skipKeys, skipPaths);
	        },
	        lastSerializedData: function () {
	            // FIXME: this is slow, it requires the elicitation to serialized/deserialize the entire property
	            // tree per-widget call..... optimize this sometime if stateSave / stateResume are too slow
	            return this.get('elicitation').getSerializedDataFor(this.get('dataKey'));
	        }.property().volatile(),
	        stateSave: function stateSave() {
	            return {
	                'properties': this.getProperties(this.stateGetPropertyNames()),
	                'serializedData': this.get('lastSerializedData')
	            };
	        },
	        resumeFromSerializedData: function resumeFromSerializedData(serializedData) {},
	        stateResume: function stateResume(state) {
	            this.setProperties(state.properties);
	            this.resumeFromSerializedData(state.serializedData);

	            if (this.afterStateResume) {
	                this.afterStateResume();
	            }

	            this.redraw();
	        },
	        stateKeyNamesToSkip: function stateKeyNamesToSkip() {
	            return ['schema', 'propertiesAndValues'];
	        },
	        statePathsToSkip: function statePathsToSkip() {
	            return ['definition.schema', 'definition.visibleWhens', 'definition.variables'];
	        },
	        classNameBindings: [':elicitation-widget-view', 'conditionallyHidden', 'hasQualificationsToShow'],
	        serializedDefinition: null,
	        definition: undefined,
	        data: null,
	        qualifications: function () {
	            var widget = this;
	            return EAT.qualifications.map(function (qualification) {
	                return qualification.create({
	                    widget: widget
	                });
	            });
	        }.property('elicitation.qualifications'),
	        qualificationsToShow: function () {
	            return this.get('qualifications').filterProperty('showQualification', true);
	        }.property('qualifications.@each.showQualification'),
	        hasQualificationsToShow: function () {
	            return this.get('qualificationsToShow').length > 0;
	        }.property('qualificationsToShow'),
	        layoutName: "widget-layout",
	        dataModel: EAT.WidgetData,
	        fixmeWatchVariables: function () {
	            this.get('elicitation').notifyPropertyChange('variables');
	        }.observes('definition.variables.@each'),
	        addExtraPropertiesToSchema: function addExtraPropertiesToSchema(schema) {
	            // Now add schema properties common to ALL widgets
	            schema.addProperty("visibleWhens", EAT.SchemaProperty.create({
	                type: "HasMany",
	                category: "Variables",
	                prettyName: 'Visible-When',
	                accessor: EAT.WidgetDefinition.HasMany('visible-when', {
	                    model: EAT.WidgetDefinition.extend({
	                        condition: "SomeVariableName > 30.5",
	                        formulaResult: undefined
	                    }),
	                    condition: { accessor: EAT.WidgetDefinition.Attr("condition"), type: "Formula" }
	                })
	            }));

	            schema.addProperty("variables", EAT.SchemaProperty.create({
	                type: "HasMany",
	                category: "Variables",
	                prettyName: 'Variable',
	                accessor: EAT.WidgetDefinition.HasMany('variable', {
	                    model: WidgetVariable.extend({ widget: this }),
	                    name: { accessor: EAT.WidgetDefinition.Attr("name"), type: "String" },
	                    property: { accessor: EAT.WidgetDefinition.Contents(), type: "String" }
	                })
	            }));

	            schema.addProperty("id", EAT.SchemaProperty.create({
	                type: "String",
	                prettyName: 'id',
	                visible: false,
	                accessor: EAT.WidgetDefinition.Attr("id")
	            }));

	            schema.addProperty("hideOptionalQualifications", EAT.SchemaProperty.create({
	                type: "Boolean",
	                category: "Default Qualifications",
	                prettyName: "Hide Qualify Your Answer",
	                accessor: EAT.WidgetDefinition.Attr("hideOptionalQualifications")
	            }));

	            schema.addProperty("responseIsOptional", EAT.SchemaProperty.create({
	                type: "Boolean",
	                prettyName: "Response is Optional",
	                accessor: EAT.WidgetDefinition.Attr("responseIsOptional")
	            }));

	            // Add qualifications
	            this.get('qualifications').forEach(function (qualification) {
	                schema.addProperty(qualification.propertyName, EAT.SchemaProperty.create({
	                    type: "Boolean",
	                    category: "Default Qualifications",
	                    prettyName: qualification.prettyName,
	                    accessor: EAT.WidgetDefinition.Attr(qualification.xmlAttr)
	                }));
	            });
	        },
	        _widget_OnInit: function () {
	            Ember.assert("widget.elicitation must be set to an elicitation", !Ember.isNone(this.get('elicitation')));

	            // Initialize Widget.data
	            this.set('data', this.get('dataModel').create({ widget: this, definitionBinding: "widget.definition" }));

	            // Initialize the Widget.definition object from the Widget.definitionSchema
	            var schemaHash = this.get('definitionSchema');
	            Ember.assert("Widget must have a definitionSchema set", !Ember.isNone(schemaHash));
	            var schema = EAT.Schema.createFromHash(schemaHash);

	            // FIXME: ideally, rather than using a MIXIN, we would require all widgets to inherit
	            // their definitionModel(s) from the RootWidgetDefinition class
	            var rootModel = schema.get('definitionModel').extend(RootWidgetDefinition, {});
	            schema.set('definitionModel', rootModel);

	            this.addExtraPropertiesToSchema(schema);

	            var definition = schema.createDefinition(this, this.get('serializedDefinition'));
	            this.set('definition', definition);

	            // Call the widget's init method (until we resolve how to chain .on('init') handlers
	            this.initWidget();
	        }.on('init'),
	        initWidget: function initWidget() {/* TO BE OVERRIDDEN BY WIDGETS */},
	        conditionallyHidden: function () {
	            var elicitation = this.get('elicitation');

	            var visibleWhens = this.get('definition.visibleWhens.content');

	            var visible = true;
	            if (!Ember.isNone(visibleWhens) && visibleWhens.length > 0) {
	                visibleWhens.forEach(function (visibleWhen) {
	                    var variableScope = elicitation.get('variableScope');
	                    // console.log("Doing eval in context", variableScope);

	                    try {
	                        visible = visible && ElicitationUtils.evalInScope(visibleWhen.condition, variableScope);
	                        visibleWhen.set('formulaResult', visible);
	                    } catch (e) {
	                        visibleWhen.set('formulaResult', e.toString());
	                    }
	                });
	            }
	            return !visible;
	        }.property('definition.visibleWhens.@each.condition', 'elicitation.variableScope'),
	        scrollTo: function scrollTo() {
	            var widget = this;
	            window.setTimeout(function () {
	                var domElement = widget.$();
	                $.scrollTo(domElement, 300, {
	                    offset: { top: -60 },
	                    axis: 'y'
	                });
	            }, 50);
	        },
	        definitionSchema: null,
	        description: function () {
	            return this.getDefinitionTag();
	        }.property(),
	        definitionEditorViewClass: function () {
	            return EAT.WidgetDefinitionEditorView;
	        }.property(),
	        definitionEditorView: function () {
	            return this.get('definitionEditorViewClass').create({
	                definition: this.get('definition'),
	                widget: this
	            });
	        }.property('definition', 'definitionEditorViewClass').volatile(),
	        getDefinitionTag: function getDefinitionTag() {
	            return this.get('definitionTag');
	        },
	        serializeDefinition: function serializeDefinition(doc) {
	            var tag = this.getDefinitionTag();
	            var serialized = $(doc.createElement(tag));
	            var definition = this.get('definition');
	            definition.serialize(serialized);
	            return serialized;
	        },
	        serializedMetadata: function () {
	            var metadata = EAT.SerializedData.create();

	            this.get('qualificationsToShow').forEach(function (qualification) {
	                var propertyName = qualification.get('propertyName');
	                var result = qualification.get('serializedData');
	                metadata.set(propertyName, result);
	            });

	            return metadata;
	        }.property().volatile(),
	        responseIsOptional: Ember.computed.alias('definition.responseIsOptional'),
	        serializedData: function () {
	            var data = EAT.SerializedData.create();
	            var errors = [];

	            if (!Ember.isNone(this.serializeData)) {
	                this.serializeData(data, errors);
	            } else {
	                return null;
	            }

	            // Now store metadata, like qualifications
	            data.set('metadata', this.get('serializedMetadata'));

	            if (this.get('responseIsOptional')) {
	                errors = [];
	            }

	            return EAT.StoreDataResult.create({
	                data: data,
	                errors: errors
	            });
	        }.property().volatile(),
	        dataKeyBinding: 'definition.id',
	        dataKeyTextBinding: 'definition.dataKeyText',
	        redraw: function redraw() {},
	        didInsertElement: function didInsertElement() {
	            this.setupDOM();
	        },
	        setupDOM: function setupDOM() {},
	        focusSelector: null,
	        beforeEnteringPage: function beforeEnteringPage(page) {},
	        beforeExitingPage: function beforeExitingPage(page) {}
	    });

	    EAT.Widget.reopenClass({
	        register: function register(definitionTag, def) {
	            def['definitionTag'] = definitionTag;

	            var newWidget = this.extend(def);
	            newWidget.reopenClass({
	                definitionTag: definitionTag,
	                prettyName: def.prettyName,
	                widgetResults: def.widgetResults
	            });

	            EAT.definitionDOMElements.addObject(definitionTag);
	            EAT.Widgets[definitionTag] = newWidget;
	            return newWidget;
	        }
	    });

	    // This mixin is applied to the ROOT definition object, i.e. widget.definition
	    var RootWidgetDefinition = Ember.Mixin.create({
	        _id: undefined,
	        id: function (key, val) {
	            if (arguments.length > 1) {
	                this.set('_id', val);
	            }
	            var id = this.get('_id');
	            if (Ember.isNone(id)) {
	                id = ElicitationUtils.makeUUID();
	                this.set('_id', id);
	            }
	            return id;
	        }.property('_id')
	    });

	    var allArrows = new RegExp("→", 'g');
	    var WidgetVariable = EAT.WidgetDefinition.extend({
	        widget: undefined, // bind
	        elicitationBinding: 'widget.elicitation',
	        name: "SomeVariableName",
	        property: undefined,
	        value: function () {
	            try {
	                var serializedData = this.get('elicitation.serializedData');
	                if (Ember.isNone(serializedData)) {
	                    throw "elicitation.serializedData was null";
	                }

	                var widget = this.get('widget');
	                var widgetData = this.get('elicitation.serializedData').getDataForWidget(widget);

	                var property = this.get('property');

	                // Arrows are the "technically valid" syntax, and eventually, we'll want to do this as a
	                // recusive series of get() calls, NOT using Ember's auto-recurse. The reason is that we
	                // may (conceivably) have property names that include a period (oops), for example, the
	                // series names in a time-trend are directly stored as-is.
	                property = property.replace(allArrows, ".");

	                return widgetData ? Ember.get(widgetData, property) : undefined;
	            } catch (e) {
	                console.log("Error getting widget value: ", e);
	                return undefined;
	            }
	        }.property('elicitation.serializedData', 'widget.dataKey', 'property'),
	        watchValue: function () {
	            // FIXME: do we really need to do this fetch? probably was working around an
	            // ember bug, forcing value to compute because deeper observers weren't working
	            // ... might not be relevant anymore? needs testing.
	            var value = this.get('value');
	            //console.log("Variable ", this.get('name'), "=", value);
	        }.observes('value')
	    });
	})(EAT, ElicitationUtils, window);

/***/ },
/* 44 */
/***/ function(module, exports) {

	
	if (BrowserDetection.msie && BrowserDetection.version < 9) {
	    // IE8 and 7 don't allow unknown DOM elements (which we use for elicitation
	    // definitions), unless they're first created using document.createElement
	    EAT.definitionDOMElements.forEach(function (domElement) {
	        console.log("Registering " + domElement);
	        document.createElement(domElement);
	    });
	}

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(46);

	__webpack_require__(47);

	__webpack_require__(48);

	__webpack_require__(49);

	__webpack_require__(50);

	__webpack_require__(51);

	__webpack_require__(52);

	__webpack_require__(53);

	__webpack_require__(54);

	__webpack_require__(55);

	__webpack_require__(56);

	__webpack_require__(57);

	__webpack_require__(58);

	__webpack_require__(59);

	__webpack_require__(60);

	__webpack_require__(61);

	__webpack_require__(62);

/***/ },
/* 46 */
/***/ function(module, exports) {

	
	(function (EAT) {
	    "use strict;";

	    // FIXME: We use this global to create radio "groups"...
	    // is there a better way?

	    var globalAgreeDisagreeNum = 0;

	    EAT.Widget.register('agree-disagree', {
	        agreeDisagreeNum: null,
	        prettyName: "Agree/Disagree",
	        initWidget: function initWidget() {
	            this.set('agreeDisagreeNum', globalAgreeDisagreeNum++);
	        },
	        templateName: 'agree-disagree',
	        definitionSchema: {
	            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" }
	        },
	        serializeData: function serializeData(data, errors) {
	            var agreement = this.$().find("input[type='radio']:checked").val();

	            data.set('agreement', agreement);
	            if (!agreement) {
	                errors.pushObject("You didn't indicate if you agree/disagreed with one of the statements");
	            }
	        },
	        resumeFromSerializedData: function resumeFromSerializedData(serializedData) {
	            if (serializedData && serializedData.agreement) {
	                var radioButton = this.$().find("input[type='radio']").toArray().find(function (x) {
	                    return $(x).val() === serializedData['agreement'];
	                });
	                $(radioButton).prop('checked', true);
	            }
	        }
	    });
	})(EAT);

/***/ },
/* 47 */
/***/ function(module, exports) {

	(function (EAT, Ember) {
	    "use strict;";

	    EAT.WidgetResultsViews.AllocationTable = EAT.WidgetResultsView.extend({
	        templateName: "allocation-table-results",
	        classNames: ["widget-results", "allocation-table"],
	        content: undefined, // An EAT.WidgetResultsData


	        /*
	        
	            "data": {
	                "a Electricity generation and storage": {
	                  "Allocation (%)": 30
	                },
	                "b Transportation": {
	                  "Allocation (%)": 20
	                },
	                "c Industrial use": {
	                  "Allocation (%)": 20
	                },
	                "d Agriculture": {
	                  "Allocation (%)": 10
	                },
	                "e Energy system efficiency": {
	                  "Allocation (%)": 20
	                },
	                "metadata": {}
	            },
	        
	        */

	        dataTableAndFriends: function () {
	            var dataTable = new google.visualization.DataTable();
	            dataTable.addColumn({
	                type: 'string'
	            });

	            var seriesNames = new Ember.Set();
	            var seriesNameToColNum = {};

	            //var expertNum = 0;
	            this.get('content.perExpertData').mapProperty('data').forEach(function (data) {
	                console.log("allocation-table-results-chart for data row:", data);
	                var expertNum = dataTable.addRow();

	                // set X position to expertNum
	                dataTable.setCell(expertNum, 0, expertNum.toString());

	                for (var seriesNameA in data) {
	                    if (seriesNameA != 'metadata' && data.hasOwnProperty(seriesNameA)) {
	                        for (var seriesNameB in data[seriesNameA]) {
	                            if (data[seriesNameA].hasOwnProperty(seriesNameB)) {
	                                console.log("a=", seriesNameA, ", b=", seriesNameB);
	                                var value = data[seriesNameA][seriesNameB];

	                                var seriesName = seriesNameA + ", " + seriesNameB;
	                                var colNum = null;
	                                if (!seriesNames.contains(seriesName)) {
	                                    console.log("new name " + seriesName + ": adding");
	                                    seriesNames.add(seriesName);
	                                    colNum = dataTable.addColumn({
	                                        type: 'number',
	                                        label: seriesName
	                                        /*role: role,
	                                        pattern: '@@##',*/
	                                    });
	                                    seriesNameToColNum[seriesName] = colNum;
	                                } else {
	                                    colNum = seriesNameToColNum[seriesName];
	                                }

	                                dataTable.setCell(expertNum, colNum, value);
	                            }
	                        }
	                    }
	                }
	            });

	            console.log("Returning allocation-table results data table");

	            return {
	                dataTable: dataTable,
	                seriesNameToColNum: seriesNameToColNum,
	                seriesNames: seriesNames
	            };
	        }.property('content.perExpertData'),

	        didInsertElement: function didInsertElement() {
	            this._super();

	            var chartDiv = this.$("div.google-chart-holder");
	            var self = this;

	            google.load("visualization", "1", {
	                packages: ["corechart"],
	                callback: function callback() {

	                    var chart = new google.visualization.LineChart(chartDiv.get(0));

	                    var options = {
	                        lineWidth: 0,
	                        pointSize: 5,
	                        //focusTarget: 'datum',
	                        backgroundColor: '#707580',
	                        titlePosition: 'none',
	                        vAxis: {
	                            viewWindowMode: 'pretty',
	                            textStyle: { color: 'white' },
	                            gridlines: { color: '#888' },
	                            baselineColor: '#707580'
	                        },
	                        //tooltip: { trigger: 'selection' },
	                        hAxis: {
	                            format: '#',
	                            viewWindowMode: 'pretty',
	                            textStyle: { color: 'white' },
	                            gridlines: { color: '#888' },
	                            baselineColor: '#707580'
	                        },
	                        theme: 'maximized'
	                    };

	                    var dataTableAndFriends = self.get('dataTableAndFriends');
	                    window.dataTableAndFriends = dataTableAndFriends;

	                    // Now assign each series to a color...
	                    var seriesColors = ['#19b5eb', 'rgb(217,76,116)', 'rgb(123,105,209)', 'rgb(235,136,35)', 'rgb(76,166,73)', 'rgb(64,133,198)', 'rgb(228,81,39)', 'rgb(90,86,196)', 'rgb(168,206,56)', 'rgb(255,205,5)', 'rgb(16,147,128)', 'rgb(154,61,168)'];
	                    var seriesOptions = {};
	                    dataTableAndFriends.seriesNames.forEach(function (seriesName) {
	                        var seriesColor = seriesColors.shift(); // snag a color for this series...
	                        var colNum = dataTableAndFriends.seriesNameToColNum[seriesName];
	                        seriesOptions[colNum] = { color: seriesColor };
	                    });

	                    options['series'] = seriesOptions;

	                    chart.draw(dataTableAndFriends.dataTable, options);
	                    debug.googleChart = chart;
	                    debug.googleChartDataTable = dataTableAndFriends.dataTable;
	                    self.set('googleAvailable', true);
	                }
	            });
	        }
	    });

	    $.widget("nz.dragdistance", $.ui.mouse, {
	        options: {
	            drag: null,
	            start: null,
	            stop: null
	        },
	        _create: function _create() {
	            this.element.disableSelection();
	            this._mouseInit();
	        },
	        _mouseStart: function _mouseStart(event) {
	            this.startEvent = event;
	            if (this.options.start) {
	                this.options.start();
	            }
	        },
	        _getDist: function _getDist(event) {
	            var x = event.screenX - this.startEvent.screenX;
	            var y = event.screenY - this.startEvent.screenY;
	            var dist = Math.sqrt(x * x + y * y);
	            return event.screenY < this.startEvent.screenY ? dist : -dist;
	        },
	        _mouseDrag: function _mouseDrag(event) {
	            if (this.options.drag) {
	                this.options.drag(this._getDist(event));
	            }
	        },
	        _mouseStop: function _mouseStop(event) {
	            if (this.options.stop) {
	                this.options.stop(this._getDist(event));
	            }
	            this.startEvent = null;
	        }
	    });

	    var GraphicView = Ember.View.extend({
	        templateName: "allocation-table-cell-graphic",
	        content: null,
	        classNameBindings: [":graphic-holder"],
	        inserted: false,
	        didInsertElement: function didInsertElement() {
	            this.set('inserted', true);

	            var self = this;
	            var startingAllocated;
	            var dragtest = this.$().dragdistance({
	                drag: function drag(dist) {
	                    dist /= 2.0;
	                    self.set('content.allocated', startingAllocated + dist);
	                },
	                start: function start() {
	                    startingAllocated = self.get('content.allocated');
	                },
	                stop: function stop(dist) {
	                    startingAllocated = null;
	                }
	            });
	        },
	        holderElement: function () {
	            if (!this.get('inserted')) return undefined;
	            return this.$();
	        }.property('inserted'),
	        holderWidth: function () {
	            var element = this.get('holderElement');
	            return Ember.isNone(element) ? undefined : element.width();
	        }.property('holderElement'),
	        makeHolderHeightMatchWidth: function () {
	            var holderElement = this.get('holderElement');
	            var holderWidth = this.get('holderWidth');
	            if (!(Ember.isNone(holderElement) || Ember.isNone(holderWidth))) {
	                holderElement.height(holderWidth);
	            }
	        }.observes('holderWidth'),
	        maxGraphicWidthBinding: 'holderWidth',
	        maxAllocatedBinding: 'content.table.maxAllocated',
	        graphicSizePx: function () {
	            var maxGraphicWidth = this.get('maxGraphicWidth');
	            var allocated = this.get('content.allocated');
	            var maxAllocated = this.get('maxAllocated');

	            var ratio = allocated / maxAllocated;
	            return ratio * maxGraphicWidth;
	        }.property('maxGraphicWidth', 'maxAllocated', 'content.allocated'),
	        graphicStyle: function () {
	            var graphicSizePx = this.get('graphicSizePx');

	            var style = "" + "width: " + graphicSizePx + "px;" + "height: " + graphicSizePx + "px;";
	            return style;
	        }.property('graphicSizePx')
	    });

	    var CellView = Ember.View.extend({
	        templateName: 'allocation-table-cell',
	        content: null,
	        tagName: "td",
	        graphicalInputBinding: "content.table.dataModel.graphicalInput",
	        classNameBindings: [':cell', 'content.allocatedStringIsInvalid', 'content.locked', 'graphicalInput'],
	        toggleLocked: function toggleLocked() {
	            this.toggleProperty('content.locked');
	        },
	        graphicView: GraphicView,
	        allocatedTextField: Ember.TextField.extend({
	            precision: null, /* bound to CellView.CellModel.allocatedStringPrecision */
	            valueBinding: 'allocated',
	            focused: false,
	            observeValueWhileFocused: function () {
	                if (this.get('focused')) {
	                    var value = this.get('value');
	                    this.set('allocated', value);

	                    // CHANGE allocatedStringPrecision (bound to precision)
	                    // if we have manually input more precision than is permitted
	                    // for other cells. The +1 adds one extra digit, so that
	                    // divisions are reflected.
	                    var sigFigs = ElicitationUtils.countSigFigs(value) + 1;
	                    var precision = this.get('precision');
	                    if (precision < sigFigs) {
	                        this.set('precision', sigFigs);
	                    }
	                }
	            }.observes('value'),
	            focusIn: function focusIn(evt) {
	                this.set('focused', true);
	                this.get('valueBinding').disconnect(this);
	            },
	            focusOut: function focusOut(evt) {
	                this.set('focused', false);

	                var value = this.get('value');
	                this.get('valueBinding').connect(this);
	                this.set('value', value);
	            }
	        })
	    });

	    var SummationCellView = CellView.extend({
	        tagName: "td",
	        classNameBindings: [':summation']
	    });

	    var AllocatedStringMixin = Ember.Mixin.create({
	        allocatedStringPrecision: undefined,
	        allocatedStringIsInvalid: false,
	        allocatedString: function (key, val) {
	            this.set('allocatedStringIsInvalid', false);
	            if (arguments.length > 1) {
	                var number = parseFloat(val);
	                if (!isNaN(number)) {
	                    this.set('allocated', number);
	                } else {
	                    this.set('allocatedStringIsInvalid', true);
	                }
	            }
	            var num = this.get('allocated');
	            var precision = this.get('allocatedStringPrecision');
	            return ElicitationUtils.toSigFig(num, precision);
	        }.property('allocated', 'numDigitsPrecision')
	    });

	    var CellModel = Ember.Object.extend(AllocatedStringMixin, {
	        allocatedStringPrecisionBinding: 'table.allocatedStringPrecision',
	        _stateSkipKeys: ['col', 'row', 'table', 'allocationStringPrecision'],
	        col: null,
	        row: null,
	        table: null,
	        allocated: 0,
	        locked: false
	    });

	    function sumProperty(enumerable, propName) {
	        return enumerable.mapProperty(propName).reduce(function (sum, item) {
	            return sum + item;
	        }, 0);
	    }

	    var SumChildAllocated = Ember.Mixin.create(AllocatedStringMixin, {
	        deepChildrenBinding: 'children',
	        unlockedChildren: function () {
	            return this.get('deepChildren').rejectProperty('locked');
	        }.property('deepChildren.@each.locked'),
	        allocated: function (key, newAllocated) {
	            if (arguments.length > 1) {
	                if (newAllocated != 0.0) {
	                    var currentAllocated = sumProperty(this.get('deepChildren'), 'allocated');
	                    var difference = newAllocated - currentAllocated;

	                    var unlockedChildren = this.get('unlockedChildren');
	                    var unlockedAllocated = sumProperty(unlockedChildren, 'allocated');

	                    if (unlockedAllocated != 0) {
	                        var newUnlockedAllocated = unlockedAllocated + difference;
	                        var ratio = newUnlockedAllocated / unlockedAllocated;

	                        unlockedChildren.forEach(function (child) {
	                            child.set('allocated', child.get('allocated') * ratio);
	                        });
	                    } else {
	                        var childValue = difference / unlockedChildren.get('length');
	                        unlockedChildren.setEach('allocated', childValue);
	                    }
	                }
	            }

	            return sumProperty(this.get('children'), 'allocated');
	        }.property('children.@each.allocated'),
	        locked: function (key, value) {
	            if (arguments.length > 1) {
	                this.get('deepChildren').setEach('locked', value);
	            }
	            return this.get('deepChildren').everyProperty('locked');
	        }.property('deepChildren.@each.locked')
	    });

	    var RowModel = Ember.Object.extend(SumChildAllocated, {
	        _stateSkipKeys: ['locked', 'allocated', 'label'],
	        definition: null,
	        labelBinding: 'definition.label',
	        childrenBinding: 'cells',
	        allocatedStringPrecisionBinding: 'table.allocatedStringPrecision'
	    });

	    var ColModel = Ember.Object.extend(SumChildAllocated, {
	        definition: null,
	        labelBinding: 'definition.label',
	        childrenBinding: 'cells',
	        allocatedStringPrecisionBinding: 'table.allocatedStringPrecision'
	    });

	    var TableModel = Ember.Object.extend(SumChildAllocated, {
	        allocatedStringPrecisionBinding: 'dataModel.allocatedStringPrecision',
	        childrenBinding: "rows",
	        deepChildrenBinding: 'cells',
	        cells: function () {
	            var cells = this.get('rows').mapProperty('cells').reduce(function (toReturn, rowCells) {
	                return toReturn.concat(rowCells);
	            }, []);
	            return cells;
	        }.property('rows.@each.cells.@each'),
	        maxAllocated: function () {
	            var minMax = 20; // FIXME: for demo only, set to null to have no minMax, and solve some other way
	            return this.get('cells').mapProperty('allocated').reduce(function (max, allocated) {
	                return max != null && max > allocated ? max : allocated;
	            }, minMax);
	        }.property('cells.@each.allocated')
	    });

	    var AllocationTableDataModel = EAT.WidgetData.extend(AllocatedStringMixin, {
	        allocatedStringPrecision: 2,
	        table: null,
	        graphicalInput: false,
	        init: function init() {
	            this._super();

	            this.set('table', EAT.WidgetData.CreateTable({
	                dataModel: this,
	                rowDefinitionsBinding: 'dataModel.definition.rows',
	                colDefinitionsBinding: 'dataModel.definition.cols',
	                rowModel: RowModel,
	                colModel: ColModel,
	                cellModel: CellModel,
	                tableModel: TableModel
	            }));
	        },
	        totalAllocationBinding: 'definition.totalAllocation',
	        allocated: Ember.computed.alias('table.allocated'),
	        fullyAllocated: function () {
	            var toAllocate = this.get('toAllocate');
	            return toAllocate <= 0.0000000000001 && toAllocate >= -0.0000000000001;
	        }.property('toAllocate'),
	        toAllocate: function () {
	            return this.get('totalAllocation') - this.get('allocated');
	        }.property('allocated', 'totalAllocation')
	    });

	    EAT.Widget.register('allocation-table', {
	        prettyName: "Allocation Table",
	        templateName: 'allocation-table',
	        widgetResults: EAT.WidgetResultsViews.AllocationTable,
	        dataModel: AllocationTableDataModel,
	        definitionSchema: {
	            model: EAT.WidgetDefinition.extend({
	                totalAllocation: 100
	            }),
	            label: { accessor: EAT.WidgetDefinition.ChildNode('label'), type: "Text" },
	            totalAllocation: {
	                accessor: EAT.WidgetDefinition.Attr('total-allocation'),
	                prettyName: "Allocation",
	                type: "String"
	            },
	            unitSuffix: { accessor: EAT.WidgetDefinition.Attr("unit-suffix"), prettyName: "Units", helpText: "Units for the value being allocated, e.g. the 'kg' in 50kg" },
	            unitPrefix: { accessor: EAT.WidgetDefinition.Attr("unit-prefix"), prettyName: "Prefix for Units", helpText: "Prefix to the value being allocated, e.g. the '$' in $50m" },
	            cols: {
	                type: "HasMany",
	                prettyName: 'Col',
	                emphasizeWhenEmpty: true,
	                accessor: EAT.WidgetDefinition.HasMany('column', {
	                    model: EAT.WidgetDefinition.extend({
	                        label: 'untitled col'
	                    }),
	                    label: { accessor: EAT.WidgetDefinition.ChildNode('label') }
	                })
	            },
	            rows: {
	                type: "HasMany",
	                prettyName: 'Row',
	                emphasizeWhenEmpty: true,
	                accessor: EAT.WidgetDefinition.HasMany('row', {
	                    model: EAT.WidgetDefinition.extend({
	                        label: 'untitled row'
	                    }),
	                    label: { accessor: EAT.WidgetDefinition.ChildNode('label') }
	                })
	            }
	        },
	        initWidget: function initWidget() {
	            this._super();
	            window.debugAllocationTable = this;
	        },
	        //row
	        setupDOM: function setupDOM() {},
	        serializeData: function serializeData(data, errors) {
	            var table = this.get('data.table');

	            table.get('rows').forEach(function (row) {
	                var colValues = {};
	                row.get('cells').forEach(function (cell) {
	                    var colPropertyName = ElicitationUtils.escapeForEmberProperty(cell.get('col.definition.label'));
	                    colValues[colPropertyName] = cell.get('allocated');
	                });

	                var rowPropertyName = ElicitationUtils.escapeForEmberProperty(row.get('definition.label'));
	                data.set(rowPropertyName, colValues);
	            });

	            if (!this.get('data.fullyAllocated')) {
	                var totalAllocation = data.get('totalAllocation');
	                var allocated = data.get('allocated');
	                errors.pushObject("You allocated " + allocated + ", but the requested allocation was " + totalAllocation);
	            }
	        },
	        stateKeyNamesToSkip: function stateKeyNamesToSkip() {
	            return this._super().concat(['allocatedStringIsInvalid', 'allocatedString', 'allocatedStringPrecision', '__each', 'deepChildren']);
	        },
	        statePathsToSkip: function statePathsToSkip() {
	            return this._super().concat(['data.table.cols', 'data.table.locked', 'data.table.allocated', 'data.totalAllocation', 'data.allocated']);
	        },
	        showRowSums: function () {
	            return this.get('data.table.cols.length') > 1;
	        }.property('data.table.cols.length'),
	        showColSums: function () {
	            return this.get('data.table.rows.length') > 1;
	        }.property('data.table.rows.length'),
	        cellView: CellView,
	        summationCellView: SummationCellView,
	        actions: {
	            scaleToTotal: function scaleToTotal() {
	                var value = this.get('data.totalAllocation');
	                this.set('data.table.allocatedString', value);
	            }
	        }
	    });
	})(EAT, Ember);

/***/ },
/* 48 */
/***/ function(module, exports) {

	(function (EAT, Ember) {})(EAT, Ember);

/***/ },
/* 49 */
/***/ function(module, exports) {

	(function (EAT, Ember, G_vmlCanvasManager) {
	    "use strict";

	    var DEBUG_BOX_AND_WHISKERS = false;
	    var LINE_WIDTH = 7;
	    var PERCENTILES = ['_0th', '_25th', '_50th', '_75th', '_100th'];

	    EAT.Widget.register('box-and-whiskers', {
	        prettyName: "Box n' Whiskers",
	        value: null,
	        shape: 0,
	        scale: 1,
	        location: 0,
	        doneWithWhiskers: false,
	        doneClicking: false,
	        templateName: 'box-and-whiskers',
	        dataModel: EAT.WidgetData.extend({
	            _0th: undefined,
	            _25th: undefined,
	            _50th: undefined,
	            _75th: undefined,
	            _100th: undefined,
	            percentilesAreDone: function () {
	                return !Ember.isNone(this.get('_50th'));
	            }.property('_50th')
	        }),
	        definitionSchema: {
	            model: EAT.WidgetDefinition.extend({
	                _min: 0.1,
	                _max: 4.0,
	                min: function (key, value) {
	                    if (arguments.length > 1) {
	                        this.set('_min', parseFloat(value));
	                    } else {
	                        return this.get('_min');
	                    }
	                }.property("_min").volatile(), // FIXME: why are these set volatile ?!? beats the hell out of me
	                max: function (key, value) {
	                    if (arguments.length > 1) {
	                        this.set('_max', parseFloat(value));
	                    } else {
	                        return this.get('_max');
	                    }
	                }.property("_max").volatile(),
	                axisLabel: "Axis Label (kg)",
	                label_0th: "Minimum",
	                label_25th: "25th Percentile",
	                label_50th: "Median",
	                label_75th: "75th Percentile",
	                label_100th: "Maximum"
	            }),
	            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
	            min: {
	                accessor: EAT.WidgetDefinition.Attr("min"),
	                prettyName: "Starting Min",
	                helpText: "The initial minimum value of the box-plot axis. Note that users can select smaller values by manually dragging the whiskers."
	            },
	            max: {
	                accessor: EAT.WidgetDefinition.Attr("max"),
	                prettyName: "Starting Max",
	                helpText: "The initial maximum value of the box-plot axis. Note that users can select larger values by manually dragging the whiskers."
	            },
	            axisLabel: {
	                accessor: EAT.WidgetDefinition.Attr("axis-label"),
	                prettyName: "Axis Label"
	            },
	            label_0th: {
	                accessor: EAT.WidgetDefinition.Attr("label-0th"),
	                prettyName: "0th Percentile",
	                category: "Percentile Labels"
	            },
	            label_25th: {
	                accessor: EAT.WidgetDefinition.Attr("label-25th"),
	                prettyName: "25th Percentile",
	                category: "Percentile Labels"
	            },
	            label_50th: {
	                accessor: EAT.WidgetDefinition.Attr("label-50th"),
	                prettyName: "50th Percentile",
	                category: "Percentile Labels"
	            },
	            label_75th: {
	                accessor: EAT.WidgetDefinition.Attr("label-75th"),
	                prettyName: "75th Percentile",
	                category: "Percentile Labels"
	            },
	            label_100th: {
	                accessor: EAT.WidgetDefinition.Attr("label-100th"),
	                prettyName: "100th Percentile",
	                category: "Percentile Labels"
	            }
	        },
	        initWidget: function initWidget() {
	            this._super();

	            if (DEBUG_BOX_AND_WHISKERS) {
	                this.get('data').setProperties({
	                    _0th: 5,
	                    _25th: 15,
	                    _50th: 20,
	                    _75th: 25,
	                    _100th: 45
	                });
	                this.setProperties({
	                    shape: 3,
	                    scale: 1.55,
	                    location: -1.7
	                });
	            }
	        },
	        afterStateResume: function afterStateResume() {
	            var percentiles = this.get('data').getProperties(PERCENTILES);
	            var boxPlotCompleted = PERCENTILES.every(function (p) {
	                return !Ember.isNone(percentiles[p]);
	            });
	            if (boxPlotCompleted) {
	                this.set('doneWithWhiskers', true);
	                this.set('doneClicking', true);
	            } else {
	                // OK, we cheat here.... the state for this widget is fairly complicated to half-resume because
	                // of issues with "values that are tentatively set, vs set in stone by clicking"
	                // so we refuse to half-resume a box-and-whiskers, and undo the resume
	                var data = this.get('data');
	                PERCENTILES.forEach(function (p) {
	                    data.set(p, undefined);
	                });
	            }
	        },
	        serializeData: function serializeData(data, errors) {
	            var percentiles = this.get('data').getProperties(PERCENTILES);

	            if (!this.get('data.percentilesAreDone')) {
	                errors.pushObject("You haven't finished specifying the percentiles.");
	            }

	            var currentQuestion = this.get('currentQuestion');
	            if (currentQuestion.length > 0) {
	                var modelKey = currentQuestion.attr("key");
	                console.log("Setting ", modelKey, " from ", percentiles[modelKey], " to undefined");
	                percentiles[modelKey] = undefined;
	            }

	            data.setProperties(percentiles);
	        },
	        setCurrentQuestionToMouseX: function setCurrentQuestionToMouseX(evt) {
	            var currentQuestion = this.get('currentQuestion');

	            var pixelX = evt.pageX - this.get('boxPlot').offset().left;
	            var modelX = this.get("pixelToModelCoords")(pixelX);
	            var modelKey = currentQuestion.attr("key");

	            if (DEBUG_BOX_AND_WHISKERS) console.log("Setting", modelKey, "to", modelX);

	            this.get('data').set(modelKey, modelX);

	            this.enforceModelConstraints();
	        },
	        BoxPlotSubView: Ember.View.extend({
	            boxAndWhiskers: undefined, // bound in the template
	            classNames: ["box-plot"],
	            click: function click(evt) {
	                this.get('boxAndWhiskers').boxPlotClicked(evt);
	            }
	        }),
	        updateCurrentQuestionText: function updateCurrentQuestionText() {
	            var currentQuestion = this.get('currentQuestion');
	            var labelKey = "label" + currentQuestion.attr("key");
	            this.set('currentQuestionText', this.get("definition").get(labelKey));
	        },
	        boxPlotClicked: function boxPlotClicked(evt) {
	            this.setCurrentQuestionToMouseX(evt);
	            var currentQuestion = this.get('currentQuestion');
	            if (currentQuestion.attr("key") == "_100th") {
	                this.set('doneWithWhiskers', true);
	            }

	            currentQuestion.removeClass("current");
	            currentQuestion.addClass("done");
	            currentQuestion = currentQuestion.nextAll("li").first();
	            if (currentQuestion.length == 0) {
	                this.set('doneClicking', true);
	            } else {
	                currentQuestion.addClass("current");
	                this.updateCurrentQuestionText();
	            }
	            this.redraw();
	        },
	        hideMouseCursorWhenDoneClicking: function () {
	            this.$().find("#mouse-cursor").remove();
	        }.observes('doneClicking'),
	        currentQuestionText: "Minimum",
	        redrawOnDefChange: function () {
	            if (this.get('haveSetupDOM')) {
	                this.redraw();
	            }
	        }.observes('definition.min', 'definition.max', 'shape', 'scale', 'location'),
	        redraw: function redraw() {
	            var boxPlot = this.get('boxPlot');
	            var model = this.get('data');
	            var definition = this.get('definition');

	            // Draw in the axis on the canvas
	            var axis = boxPlot.find("canvas#axis");

	            // Canvases have a fixed width and height that gets stretched, reset the width
	            // and height to match the DOM element's width and height so we have 1:1 pixels
	            var canvas = axis.get(0);

	            var width = canvas.width = boxPlot.width();
	            var height = canvas.height = boxPlot.height();

	            axis.width(width).height(height);

	            var drawWhiskers = model._0th && model._100th;
	            var drawBox = drawWhiskers && model._25th && model._75th;
	            var drawMedian = drawBox && model._50th;
	            var drawThePDF = this.get('doneClicking');
	            var doneWithWhiskers = this.get('doneWithWhiskers');

	            var min;var max;
	            if (doneWithWhiskers) {
	                if (DEBUG_BOX_AND_WHISKERS) console.log("Draw whiskers");
	                var range = model._100th - model._0th;
	                min = model._0th - range / 2;
	                max = model._100th + range / 2;
	            } else {
	                min = definition.get('min');
	                max = definition.get('max');
	                if (DEBUG_BOX_AND_WHISKERS) console.log("Using min and max", min, max);
	            }

	            var modelRange = max - min;
	            function pixelToModelCoords(pixelX) {
	                return pixelX / width * modelRange + min;
	            }
	            function modelToPixelCoords(modelX) {
	                return (modelX - min) / modelRange * width;
	            }

	            if (drawThePDF) {
	                drawDiscretizedPDF(canvas, model, modelToPixelCoords, pixelToModelCoords, this.get('shape'), this.get('scale'), this.get('location'));
	            }

	            drawAxis(canvas, min, max, modelToPixelCoords);

	            this.set("pixelToModelCoords", pixelToModelCoords);
	            this.set("modelToPixelCoords", modelToPixelCoords);

	            var whiskers = boxPlot.find("#whiskers");
	            var box = boxPlot.find("#box");
	            var median = boxPlot.find("#median");

	            var whiskersBorderWidth = 0;parseInt(whiskers.css('border-right-width'));
	            var boxBorderWidth = 0;parseInt(box.css('border-right-width'));

	            var whiskersLeft = modelToPixelCoords(model._0th);
	            var whiskersWidth = modelToPixelCoords(model._100th) - whiskersLeft - whiskersBorderWidth;
	            var boxLeft = modelToPixelCoords(model._25th);
	            var boxWidth = modelToPixelCoords(model._75th) - boxLeft - boxBorderWidth;
	            var medianLeft = modelToPixelCoords(model._50th);

	            if (drawWhiskers) {
	                whiskers.css({ left: whiskersLeft, width: whiskersWidth }).fadeIn();
	            } else {
	                whiskers.fadeOut();
	            }

	            if (drawBox) {
	                box.css({ left: boxLeft, width: boxWidth }).fadeIn();
	            } else {
	                box.fadeOut();
	            }

	            if (drawMedian) {
	                median.css({ left: medianLeft }).fadeIn();
	            } else {
	                median.fadeOut();
	            }
	        },
	        onBoxResize: function onBoxResize(evt, ui) {
	            var box = this.get('box');
	            var whiskers = this.get('whiskers');
	            var median = this.get('median');

	            var boxLeft = ui.position.left;
	            var boxWidth = ui.size ? ui.size.width : box.width();
	            var boxRHSLeft = boxLeft + boxWidth;

	            var whiskersLeft = parseFloat(whiskers.css('left')) + LINE_WIDTH;
	            var whiskersRHSLeft = whiskers.width() + whiskersLeft - 2 * LINE_WIDTH;

	            var medianLeft = parseFloat(median.css('left')) - LINE_WIDTH;
	            var medianRHSLeft = medianLeft + LINE_WIDTH;

	            if (boxLeft < whiskersLeft) {
	                box.css({
	                    left: whiskersLeft,
	                    width: boxWidth + (boxLeft - whiskersLeft)
	                });
	            }

	            if (boxLeft > medianLeft) {
	                box.css({
	                    left: medianLeft,
	                    width: boxWidth + (boxLeft - medianLeft)
	                });
	            }

	            if (boxRHSLeft < medianRHSLeft) {
	                box.css({
	                    width: medianRHSLeft - boxLeft
	                });
	            }

	            if (boxRHSLeft > whiskersRHSLeft) {
	                box.css({
	                    width: whiskersRHSLeft - boxLeft
	                });
	            }
	        },
	        // Keep Whiskers From Overlapping the Box
	        onWhiskersResize: function onWhiskersResize(evt, ui) {
	            var box = this.get('box');
	            var whiskers = this.get('whiskers');

	            var boxLeft = box.position().left - LINE_WIDTH;
	            var boxWidth = box.width();
	            var boxRHSLeft = boxLeft + boxWidth + 2 * LINE_WIDTH;

	            var whiskersLeft = ui.position.left;
	            var whiskersWidth = ui.size.width;
	            var whiskersRHSLeft = whiskersLeft + whiskersWidth;

	            if (whiskersLeft > boxLeft) {
	                whiskers.css({
	                    left: boxLeft,
	                    width: whiskersWidth + (whiskersLeft - boxLeft)
	                });
	            }

	            if (whiskersRHSLeft < boxRHSLeft) {
	                whiskers.css({
	                    width: boxRHSLeft - whiskersLeft
	                });
	            }
	        },
	        enforceModelConstraints: function enforceModelConstraints() {
	            var data = this.get('data');

	            var orderedProperties = ['_0th', '_25th', '_50th', '_75th', '_100th'];
	            var positions = data.getProperties(orderedProperties);

	            function setPosition(recipient, donor) {
	                positions[recipient] = positions[donor];
	                data.set(recipient, positions[donor]);
	            }

	            function enforceLessThan(lesser, greater, recipient, donor) {
	                if (positions[lesser] > positions[greater]) {
	                    setPosition(recipient, donor);
	                }
	            }

	            enforceLessThan('_0th', '_25th', '_25th', '_0th');
	            enforceLessThan('_25th', '_50th', '_50th', '_25th');
	            enforceLessThan('_50th', '_75th', '_50th', '_75th');
	            enforceLessThan('_75th', '_100th', '_75th', '_100th');

	            // Don't allow _0th to equal _100th
	            if (positions['_0th'] >= positions['_100th']) {
	                data.set('_100th', data.get('_0th') + 0.01);
	            }
	        },
	        updateModelValuesFromPixelPositions: function updateModelValuesFromPixelPositions() {
	            var pixelToModelCoords = this.get("pixelToModelCoords");

	            var model = this.get('data');
	            var box = this.get('box');
	            var whiskers = this.get('whiskers');
	            var median = this.get('median');

	            var boxLeft = box.position().left;
	            var boxRHSLeft = boxLeft + box.width();

	            var whiskersLeft = whiskers.position().left;
	            var whiskersRHSLeft = whiskers.width() + whiskersLeft;

	            var medianLeft = median.position().left;
	            var medianRHSLeft = medianLeft;

	            model.setProperties({
	                _0th: pixelToModelCoords(whiskersLeft),
	                _25th: pixelToModelCoords(boxLeft),
	                _50th: pixelToModelCoords(medianLeft),
	                _75th: pixelToModelCoords(boxRHSLeft),
	                _100th: pixelToModelCoords(whiskersRHSLeft)
	            });

	            this.enforceModelConstraints();

	            this.redraw();
	        },
	        boxPlot: function () {
	            return this.$().find(".box-plot");
	        }.property(),
	        box: function () {
	            return this.$().find("#box");
	        }.property(),
	        whiskers: function () {
	            return this.$().find("#whiskers");
	        }.property(),
	        median: function () {
	            return this.$().find("#median");
	        }.property(),
	        currentQuestion: function () {
	            return this.$().find(".current");
	        }.property().volatile(),
	        setupDebugSliders: function setupDebugSliders() {
	            var widget = this;
	            var setupSlider = function setupSlider(selector, path, min, max) {
	                var slider = widget.$().find(selector);
	                var locChanged = function locChanged() {
	                    var val = parseFloat(slider.slider("value"));
	                    widget.set(path, val);
	                };
	                slider.slider({
	                    change: locChanged,
	                    slide: locChanged,
	                    min: min,
	                    max: max,
	                    step: 0.01,
	                    value: widget.get(path)
	                });
	            };

	            setupSlider("#location-slider", 'location', -3, 3);
	            setupSlider("#scale-slider", 'scale', 0, 3);
	            setupSlider("#shape-slider", 'shape', 0, 10);
	        },
	        setupDOM: function setupDOM() {
	            this.updateCurrentQuestionText();

	            var boxPlot = this.get('boxPlot');

	            // Need to initialze exCanvas, c.f. "IE Sux"
	            if (G_vmlCanvasManager != undefined) {
	                var canvasElement = this.$().find("canvas")[0];
	                canvasElement = ElicitationUtils.recreateCanvasElement(canvasElement);
	                G_vmlCanvasManager.initElement(canvasElement);
	            }

	            this.set('haveSetupDOM', true);

	            this.setupDebugSliders();

	            var boxAndWhiskers = this;
	            function b(f) {
	                return function () {
	                    f.apply(boxAndWhiskers, arguments);
	                };
	            }

	            var box = boxPlot.find("#box");

	            var whiskers = boxPlot.find("#whiskers").resizable({ handles: "w,e", containment: "parent", resize: b(this.onWhiskersResize), stop: b(this.updateModelValuesFromPixelPositions) });
	            boxPlot.find("#median").draggable({ axis: "x", containment: box, stop: b(this.updateModelValuesFromPixelPositions) });

	            var self = this;
	            var mouseCursor = this.$().find("#mouse-cursor");
	            boxPlot.mouseenter(function (evt) {
	                mouseCursor.show();
	            }).mousemove(function (evt) {
	                if (!self.get('doneClicking')) {
	                    var pixelX = evt.pageX - boxPlot.offset().left;
	                    var modelX = boxAndWhiskers.get("pixelToModelCoords")(pixelX);

	                    mouseCursor.css('left', pixelX);
	                    self.setCurrentQuestionToMouseX(evt);
	                    self.redraw();
	                }
	            }).mouseleave(function (evt) {
	                mouseCursor.hide();
	            });

	            box.resizable({
	                handles: "w,e",
	                resize: b(this.onBoxResize),
	                stop: b(this.updateModelValuesFromPixelPositions)
	            });

	            var boxDragStartMedianLeft;
	            box.draggable({
	                axis: "x",
	                containment: whiskers,
	                start: b(function (evt, ui) {
	                    boxDragStartMedianLeft = this.get('median').position().left;
	                }),
	                drag: b(function (evt, ui) {
	                    this.get('median').css("left", boxDragStartMedianLeft - (ui.originalPosition.left - ui.position.left));
	                }),
	                stop: b(this.updateModelValuesFromPixelPositions)
	            });

	            if (DEBUG_BOX_AND_WHISKERS) {
	                this.$().find(".DEBUG").show();
	                this.$().find("#mouse-cursor").remove();
	                this.$().find("#axis-label").hide();
	                this.$().find("#instructions").hide();
	            }

	            this.redraw();
	        }
	    });

	    function drawArrowhead(ctx) {
	        ctx.beginPath();
	        ctx.moveTo(0, 0);
	        ctx.lineTo(-12, -6);
	        ctx.lineTo(-12, 6);
	        ctx.closePath();
	        ctx.fill();
	    }

	    function log10(val) {
	        return Math.log(val) / Math.log(10);
	    }

	    function drawDiscretizedPDF(canvas, rawPercentiles, modelToPixelCoords, pixelToModelCoords) {
	        var PDF_COLOR = "rgb(150,150,255)";
	        var PDF_LINE_WIDTH = 2;
	        var HORIZONTAL_OFFSET = 2; // FIXME: should this be here?
	        var VERTICAL_OFFSET = 60;
	        var PIXEL_STEP_X = 1;

	        var height = canvas.height;
	        var width = canvas.width;

	        var pdfHeight = height - VERTICAL_OFFSET - 50;

	        var ctx = canvas.getContext("2d");

	        ctx.save();{
	            ctx.translate(HORIZONTAL_OFFSET, VERTICAL_OFFSET);
	            ctx.strokeStyle = PDF_COLOR;
	            ctx.lineCap = 'round';

	            var percentiles = [{ percentile: 0, x: modelToPixelCoords(rawPercentiles._0th) }, { percentile: 25, x: modelToPixelCoords(rawPercentiles._25th) }, { percentile: 50, x: modelToPixelCoords(rawPercentiles._50th) }, { percentile: 75, x: modelToPixelCoords(rawPercentiles._75th) }, { percentile: 100, x: modelToPixelCoords(rawPercentiles._100th) }];

	            var bars = [];

	            var numPercentiles = 5; // We were using precentiles.length, but for some weird reason, this was evaluating to 6 on IE8, oops

	            for (var i = 1; i < numPercentiles; i++) {
	                var percentile = percentiles[i];
	                var lastPercentile = percentiles[i - 1];

	                var width = percentile.x - lastPercentile.x;
	                var area = percentile.percentile - lastPercentile.percentile;

	                bars.push({
	                    x1: lastPercentile.x,
	                    x2: percentile.x,
	                    y: area / width
	                });
	            }

	            var yFactor = 100;

	            // Draw the PDF
	            ctx.lineWidth = PDF_LINE_WIDTH;
	            ctx.fillStyle = "rgba(0,0,255,0.1)";

	            for (var i = 0; i < bars.length; i++) {
	                var bar = bars[i];

	                bar.y *= yFactor;

	                ctx.beginPath();
	                ctx.moveTo(bar.x1, 0);
	                ctx.lineTo(bar.x1, bar.y);
	                ctx.lineTo(bar.x2, bar.y);
	                ctx.lineTo(bar.x2, 0);
	                ctx.stroke();
	                ctx.closePath();
	                ctx.fill();
	            }
	        }ctx.restore();
	    }

	    function drawPDF(canvas, percentiles, modelToPixelCoords, pixelToModelCoords, shape, scale, location) {
	        var skew = shape;
	        var PDF_COLOR = "rgb(200,200,255)";
	        var PDF_LINE_WIDTH = 2;
	        var HORIZONTAL_OFFSET = 2; // FIXME: should this be here?
	        var VERTICAL_OFFSET = 60;
	        var PIXEL_STEP_X = 1;

	        var height = canvas.height;
	        var width = canvas.width;

	        var pdfHeight = height - VERTICAL_OFFSET - 50;

	        var ctx = canvas.getContext("2d");

	        var modelMin = percentiles._0th;
	        var modelMax = percentiles._100th;
	        var modelTweak = (modelMax - modelMin) * 0.05;
	        modelMin -= modelTweak;
	        modelMax += modelTweak;

	        // http://www.sciencedirect.com/science/article/pii/S209012321000069X
	        //var skew = 0.8;
	        var skew_2 = Math.pow(skew, 2.0);
	        var skew_3 = Math.pow(skew, 3.0);
	        var sqrtOf2PI = Math.sqrt(2 * Math.PI);
	        var approximateSkewNormalPDF = function approximateSkewNormalPDF(sigma) {
	            var x = sigma;
	            var x_2 = Math.pow(x, 2.0);
	            var x_3 = Math.pow(x, 3.0);
	            var ePart = Math.pow(Math.E, -x_2 / 2);

	            if (x < -3 / skew) {
	                return 0;
	            } else if (x < -1 / skew) {
	                var a = 9 * skew * x + 3 * skew_2 * x_2 + 1 / 3 * skew_3 * x_3 + 9;
	                return 1 / (8 * sqrtOf2PI) * ePart * a;
	            } else if (x < 1 / skew) {
	                var a = 3 * skew * x - 1 / 3 * skew_3 * x_3 + 4;
	                return 1 / (4 * sqrtOf2PI) * ePart * a;
	            } else if (x < 3 / skew) {
	                var a = 9 * skew * x - 3 * skew_2 * x_2 + 1 / 3 * skew_3 * x_3 + 7;
	                return 1 / (8 * sqrtOf2PI) * ePart * a;
	            } else {
	                return Math.sqrt(2 / Math.PI) * ePart;
	            }
	        };

	        var sigmaBound = 2.698;
	        var getPixelYForPixelX = function getPixelYForPixelX(pixelX) {
	            var modelX = pixelToModelCoords(pixelX);
	            var modelPercent = (modelX - modelMin) / (modelMax - modelMin);
	            var sigma = (modelPercent - 0.5) * (sigmaBound * 2);
	            sigma = (sigma - location) / scale;
	            return approximateSkewNormalPDF(sigma);

	            // if (modelPercent > 1.0 || modelPercent < 0.0) return 0.0;
	            //return Math.sin(modelPercent * Math.PI);
	        };

	        var fillQuantile = function fillQuantile(fromModelX, toModelX, segments, fillColor) {
	            var fromPixelX = modelToPixelCoords(fromModelX);
	            var toPixelX = modelToPixelCoords(toModelX);

	            ctx.save();{
	                ctx.fillStyle = fillColor;
	                ctx.strokeStyle = fillColor;
	                ctx.beginPath();

	                for (var i = 0; i < segments.length; i++) {
	                    var segment = segments[i];
	                    if (segment.x >= fromPixelX) {
	                        // Start our path
	                        ctx.moveTo(segment.x, 0);
	                    }

	                    if (segment.x >= fromPixelX && segment.x < toPixelX) {
	                        ctx.lineTo(segment.x, segment.y);
	                    }

	                    if (segment.x >= toPixelX) {
	                        // End our path
	                        ctx.moveTo(segment.x, 0);
	                    }
	                }

	                ctx.stroke();
	            }ctx.restore();
	        };

	        var fillSegmentQuantile = function fillSegmentQuantile(areaRatio, segments, fillColor) {
	            if (areaRatio >= 1.0 || areaRatio <= 0.0) throw "Bad areaRatio";

	            var totalArea = 0;
	            for (var i = 0; i < segments.length; i++) {
	                totalArea += segments[i].y;
	            }

	            var targetArea = areaRatio * totalArea;
	            var area = 0;
	            var segment = undefined;
	            for (var i = 0; i < segments.length && area < targetArea; i++) {
	                var segment = segments[i];
	                area += segment.y;
	            }

	            ctx.save();{
	                ctx.strokeStyle = fillColor;
	                ctx.lineWidth = 1;
	                ctx.beginPath();
	                ctx.moveTo(segment.x, 0);
	                ctx.lineTo(segment.x, segment.y);
	                ctx.stroke();

	                ctx.stroke();
	            }ctx.restore();

	            return segment.x;
	        };

	        ctx.save();{
	            ctx.translate(HORIZONTAL_OFFSET, VERTICAL_OFFSET);
	            ctx.strokeStyle = PDF_COLOR;
	            ctx.lineCap = 'round';

	            var segments = [];
	            var maxY = 0;
	            for (var pixelX = 0; pixelX < width; pixelX++) {
	                var pixelY = getPixelYForPixelX(pixelX);
	                segments.push({
	                    x: pixelX,
	                    y: pixelY
	                });
	                if (pixelY > maxY) maxY = pixelY;
	            }

	            /*
	            var lastY = 0;
	            var currentArea = 0.0;
	            var totalArea = 1;
	            for (var i=0; i < percentiles.length; i++) {
	                var percentile = percentiles[i];
	                var AreaOfSection = percentile - currentArea;
	                currentArea = percentile;
	                var width = percentile - 
	                var y = (2 * AreaOfSection / // y = (2A_of_Section / width) - prevY
	            }*/

	            var yFactor = pdfHeight / maxY;

	            yFactor = 300;

	            // Draw the Axis
	            ctx.lineWidth = PDF_LINE_WIDTH;
	            ctx.beginPath();
	            ctx.moveTo(0, 0);
	            for (var i = 0; i < segments.length; i++) {
	                var y = segments[i].y *= yFactor;
	                if (y <= 0) {
	                    ctx.moveTo(Math.round(segments[i].x), Math.round(y));
	                } else {
	                    ctx.lineTo(Math.round(segments[i].x), Math.round(y));
	                }
	            }
	            ctx.stroke();
	            ctx.closePath();

	            if (!DEBUG_BOX_AND_WHISKERS) {
	                // Fill the quantiles
	                fillQuantile(percentiles._0th, percentiles._25th, segments, "rgba(0,0,255,0.1)");
	                fillQuantile(percentiles._75th, percentiles._100th, segments, "rgba(0,0,255,0.1)");

	                fillQuantile(percentiles._25th, percentiles._50th, segments, "rgba(0,0,255,0.2)");
	                fillQuantile(percentiles._50th, percentiles._75th, segments, "rgba(0,0,255,0.2)");
	            } else {
	                var median = fillSegmentQuantile(0.5, segments, "rgba(255,0,0,1.0)");
	                var first = fillSegmentQuantile(0.25, segments, "rgba(0,255,0,1.0)");
	                var third = fillSegmentQuantile(0.75, segments, "rgba(0,255,0,1.0)");
	                var zeroth = fillSegmentQuantile(0.007, segments, "rgba(255,0,0,1.0)");
	                var fourth = fillSegmentQuantile(.993, segments, "rgba(255,0,0,1.0)");
	                if (DEBUG_BOX_AND_WHISKERS) console.log("LHS:", (first - zeroth) / (median - first));
	                if (DEBUG_BOX_AND_WHISKERS) console.log("RHS:", (fourth - third) / (third - median));
	            }
	        }ctx.restore();
	    }

	    function drawAxis(canvas, min, max, modelToPixelCoords) {
	        var AXIS_COLOR = "rgb(60,60,60)";
	        var TICK_LENGTH = 15;
	        var HORIZONTAL_OFFSET = 2; // FIXME: should this be here?
	        var VERTICAL_OFFSET = 60;

	        var height = canvas.height;
	        var width = canvas.width;

	        var ctx = canvas.getContext("2d");

	        ctx.save();{

	            // Position the Axis

	            ctx.translate(HORIZONTAL_OFFSET, VERTICAL_OFFSET);
	            ctx.strokeStyle = AXIS_COLOR;
	            ctx.lineCap = 'round';

	            // Draw the Axis
	            ctx.lineWidth = 1;
	            ctx.beginPath();
	            ctx.moveTo(0, 0);
	            ctx.lineTo(width, 0);
	            ctx.stroke();

	            // Draw the Arrows At the End of the Axis
	            ctx.fillStyle = AXIS_COLOR;
	            ctx.save();{
	                ctx.rotate(Math.PI);
	                drawArrowhead(ctx);
	            }ctx.restore();
	            ctx.save();{
	                ctx.translate(width, 0);
	                drawArrowhead(ctx);
	            }ctx.restore();

	            // Draw the tick marks
	            ctx.lineWidth = 2;
	            ctx.save();{
	                ctx.translate(0, -TICK_LENGTH / 2);
	                ctx.textAlign = "center";
	                ctx.textBaseline = "top";
	                ctx.font = "12pt Helvetica";

	                var range = max - min;
	                var scale = Math.round(log10(range));
	                var tickSize = Math.pow(10, scale);

	                var majorTickEvery = 1;

	                var minNumTicks = 9;
	                var maxNumMajorTicks = 15;

	                if (range / tickSize < minNumTicks) {
	                    tickSize /= 10;
	                    scale--;
	                }
	                if (range / tickSize < minNumTicks) {
	                    tickSize /= 2;
	                    scale--;
	                }

	                if (range / tickSize > maxNumMajorTicks) {
	                    majorTickEvery *= 2;
	                }

	                var majorTickSize = tickSize * majorTickEvery;
	                var start = Math.round(min / majorTickSize) * majorTickSize;

	                if (DEBUG_BOX_AND_WHISKERS) console.log("Drawing axis: range is", range, "scale is", scale, "tickSize is", tickSize, "majorTickEvery is", majorTickEvery, "start is", start);

	                var numTicksSinceMajor = 0;
	                for (var modelX = start; modelX < max; modelX += tickSize) {
	                    var pixelX = modelToPixelCoords(modelX);

	                    var majorTick = numTicksSinceMajor >= majorTickEvery;
	                    if (majorTick) numTicksSinceMajor = 0;
	                    numTicksSinceMajor++;

	                    // Don't draw ticks too close to the arrowheads
	                    if (pixelX < 15 || pixelX > width - 15) continue;

	                    ctx.save();{
	                        var lengthOffset = 0;
	                        if (majorTick) {
	                            ctx.lineWidth = 2;
	                        } else {
	                            lengthOffset = 1;
	                            ctx.lineWidth = 1;
	                        }

	                        ctx.translate(Math.round(pixelX), Math.round(lengthOffset));

	                        ctx.beginPath();
	                        ctx.moveTo(0, 0);
	                        ctx.lineTo(0, Math.round(TICK_LENGTH - 2 * lengthOffset));
	                        ctx.stroke();

	                        if (majorTick) {
	                            var tickLabel;
	                            if (scale < 1) {
	                                tickLabel = modelX.toFixed(Math.abs(scale));
	                            } else {
	                                tickLabel = modelX.toFixed();
	                            }
	                            ctx.fillText(tickLabel, 0, TICK_LENGTH + 5);
	                        }
	                    }ctx.restore();
	                }
	            }ctx.restore();
	        }ctx.restore();
	    }
	})(EAT, Ember, window.G_vmlCanvasManager);

/***/ },
/* 50 */
/***/ function(module, exports) {

	(function (EAT, Ember) {
	    "use strict";

	    EAT.WidgetResultsViews.CardRank = EAT.WidgetResultsView.extend({
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
	        didInsertElement: function didInsertElement() {
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
	        didInsertElement: function didInsertElement() {
	            this._super();
	            var container = this;
	            this.$().droppable({
	                hoverClass: 'drophover',
	                accept: function accept(event, ui) {
	                    return container.get('content.empty') || !container.get('content.allowOnlyOneCard');
	                },
	                drop: function drop(event, ui) {
	                    var cardDOM = ui.draggable;
	                    var card = Ember.View.views[cardDOM.closest(".ember-view").attr('id')].get('content');
	                    var from = Ember.View.views[cardDOM.closest(".container.ember-view").attr('id')].get('content.cards');
	                    var to = container.get('content.cards');
	                    from.removeObject(card);
	                    to.pushObject(card);
	                }
	            });
	        }
	    });

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
	        _stateSkipKeys: ['cards']
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
	            addAWriteInCard: function addAWriteInCard() {
	                this.appendWriteInCard();
	            }
	        },
	        appendWriteInCard: function appendWriteInCard(label) {
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
	        serializeData: function serializeData(data, errors) {
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
	        resumeFromSerializedData: function resumeFromSerializedData(serializedData) {
	            // TODO: CAVEAT!!!!
	            // this assumes starting from a BLANK card rank. It cannot work on a pre-used
	            // card rank, because it assumes all cards start in the initialContainer.
	            // to fix this, we'd need to look for cards rather than just removeObject()
	            // them from the intiialCardsContainer


	            var storeRadioButtons = this.get('definition.enableRadioButtonsOnDropTargets');

	            function isRadioButtonKey(k) {
	                return k.slice(-6) == "_radio";
	            }

	            var keys = Ember.keys(serializedData).filter(function (key) {
	                return key != "metadata";
	            });

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
	                keys.filter(isRadioButtonKey).forEach(function (radioButtonName) {
	                    var cardName = radioButtonName.slice(0, -6);
	                    var card = cardNameToCard[cardName];

	                    var radioButtonVal = Ember.get(serializedData, radioButtonName);

	                    var cardDataKey = card.get('dataKey');
	                    function setRadioButtonState() {
	                        var cardDOM = $(".card").toArray().find(function (cardDOM) {
	                            return $(cardDOM).attr("dataKey") === cardDataKey;
	                        });

	                        var radioButton = $(cardDOM).closest("tr").find("input[type='radio']").filter("[value='" + radioButtonVal + "']");
	                        radioButton.prop('checked', radioButtonVal);
	                    }

	                    // Ugh, this is messy... we have to wait for the DOM changes we made above
	                    // to propogate and re-render before we can look through the DOM and set the radio keys
	                    window.setTimeout(setRadioButtonState, 250);
	                });
	            }
	        }
	    });
	})(EAT, Ember);

/***/ },
/* 51 */
/***/ function(module, exports) {

	(function (EAT, Ember) {
	    "use strict";

	    EAT.Widget.register('dropdown', {
	        prettyName: "Dropdown",
	        value: null,
	        templateName: 'dropdown',
	        dataModel: EAT.WidgetData.extend({
	            selection: null
	        }),
	        definitionSchema: {
	            model: EAT.WidgetDefinition.extend({
	                writein: true,
	                placeholder: "Select one...",
	                populateWithDiscussionMembers: true
	            }),
	            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
	            populateWithDiscussionMembers: { accessor: EAT.WidgetDefinition.Attr("populate-with-discussion-members"), type: "Boolean", prettyName: "Populate dropdown with participant names" },
	            writein: { accessor: EAT.WidgetDefinition.Attr("writein"), type: "Boolean", prettyName: "Allow write-in answers" },
	            selections: {
	                type: "HasMany",
	                prettyName: 'Selection',
	                accessor: EAT.WidgetDefinition.HasMany('selection', {
	                    model: EAT.WidgetDefinition.extend({
	                        label: "an item in the list"
	                    }),
	                    label: { accessor: EAT.WidgetDefinition.Contents() }
	                })
	            },
	            placeholder: { accessor: EAT.WidgetDefinition.Attr("placeholder") }
	        },
	        setupDOM: function setupDOM() {
	            if (this.get('definition.writein')) {
	                var combobox = this.$().find("select").combobox({
	                    // properties could be set here, if you want
	                });
	                this.set('combobox', combobox);
	            }
	        },
	        selections: function () {
	            var selections = this.get('definition.selections').map(function (selection) {
	                return selection.get('label');
	            });

	            if (this.get('definition.populateWithDiscussionMembers')) {
	                EAT.get('experts').forEach(function (expert) {
	                    selections.push(expert);
	                });
	            }
	            return selections;
	        }.property('elicitation.experts.@each', 'definition.selections.@each.label', 'definition.populateWithDiscussionMembers'),
	        rerenderOnChange: function () {
	            this.rerender();
	        }.observes('definition.writein', 'definition.placeholder'),
	        serializeData: function serializeData(data, errors) {
	            var selection;
	            if (this.get('definition.writein')) {
	                selection = this.$().find("input.ui-autocomplete-input").val();
	            } else {
	                selection = this.get('data.selection');
	            }

	            if (!selection) {
	                errors.pushObject("You need to select an item from the dropdown.");
	            }

	            data.set('selection', selection);
	        },
	        resumeFromSerializedData: function resumeFromSerializedData(serializedData) {
	            if (serializedData) {
	                var selection = serializedData['selection'];
	                if (this.get('definition.writein')) {
	                    this.$().find("input.ui-autocomplete-input").val(selection);
	                } else {
	                    this.set('data.selection', selection);
	                }
	            }
	        }
	    });

	    /*
	    
	    function storeDataForMultipleChoiceWidget(widget, data) {
	        var key_prefix = widget.attr("name");
	    
	        var previousChoices = [];
	    
	        widget.find("select").each(function (i, e) {
	            var select = $(this);
	            var key = key_prefix + "_" + (i + 1);
	    
	            var selectedOption = select.find("option:selected");
	            if (selectedOption.length > 0) {
	                var choice = null;
	                if (selectedOption.attr("writein")) {
	                    var writein = select.nextAll("input.writein").first();
	                    choice = writein.val();
	                } else {
	                    choice = selectedOption.text();
	                }
	    
	                if ($.inArray(choice, previousChoices) != -1) {
	                    console.log(choice, previousChoices);
	                    return ["Please select option \"" + choice + "\" only once."];
	                }
	    
	                data[key] = choice;
	                previousChoices.push(choice);
	                console.log("Set " + key + " to " + choice);
	            } else {
	                return ["One or more drop-downs haven't been filled in"];
	            }
	        });
	    
	        return [];
	    }
	    
	    */
	})(EAT, Ember);

	// THIS WAS RETRIEVED FROM JQUERY-UI.COM AND CUSTOMIZED, LOOK FOR NZ_CUSTOM BELOW

	(function ($) {
	    $.widget("ui.combobox", {
	        _create: function _create() {
	            var input,
	                that = this,
	                wasOpen = false,
	                select = this.element.hide(),
	                selected = select.children(":selected"),
	                value = selected.val() ? selected.text() : "",
	                wrapper = this.wrapper = $("<span>").addClass("ui-combobox").insertAfter(select);

	            function removeIfInvalid(element) {
	                var value = $(element).val(),
	                    matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(value) + "$", "i"),
	                    valid = false;
	                select.children("option").each(function () {
	                    if ($(this).text().match(matcher)) {
	                        this.selected = valid = true;
	                        return false;
	                    }
	                });

	                if (!valid) {
	                    // remove invalid value, as it didn't match anything
	                    $(element).val("").attr("title", value + " didn't match any item").tooltip("open");
	                    select.val("");
	                    setTimeout(function () {
	                        input.tooltip("close").attr("title", "");
	                    }, 2500);
	                    input.data("ui-autocomplete").term = "";
	                }
	            }

	            input = $("<input>").appendTo(wrapper).val(value).attr("title", "").addClass("ui-state-default ui-combobox-input").autocomplete({
	                delay: 0,
	                minLength: 0,
	                source: function source(request, response) {
	                    var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
	                    response(select.children("option").map(function () {
	                        var text = $(this).text();
	                        if (this.value && (!request.term || matcher.test(text))) return {
	                            label: text.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(request.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>"),
	                            value: text,
	                            option: this
	                        };
	                    }));
	                },
	                select: function select(event, ui) {
	                    ui.item.option.selected = true;
	                    that._trigger("selected", event, {
	                        item: ui.item.option
	                    });
	                },
	                change: function change(event, ui) {
	                    if (!ui.item) {
	                        // NZ_CUSTOM: we allow new items in the combox, that's the point!!!
	                        // in return, we have to read the selection directly from the input
	                        // and not from the select element
	                        //removeIfInvalid(this);
	                    }
	                }
	            }).addClass("ui-widget ui-widget-content ui-corner-left");

	            input.data("ui-autocomplete")._renderItem = function (ul, item) {
	                return $("<li>").append("<a>" + item.label + "</a>").appendTo(ul);
	            };

	            $("<a>").attr("tabIndex", -1).attr("title", "Show All Items").tooltip().appendTo(wrapper).button({
	                icons: {
	                    primary: "ui-icon-triangle-1-s"
	                },
	                text: false
	            }).removeClass("ui-corner-all").addClass("ui-corner-right ui-combobox-toggle").mousedown(function () {
	                wasOpen = input.autocomplete("widget").is(":visible");
	            }).click(function () {
	                input.focus();

	                // close if already visible
	                if (wasOpen) {
	                    return;
	                }

	                // pass empty string as value to search for, displaying all results
	                input.autocomplete("search", "");
	            });

	            input.tooltip({
	                tooltipClass: "ui-state-highlight"
	            });
	        },

	        _destroy: function _destroy() {
	            this.wrapper.remove();
	            this.element.show();
	        }
	    });
	})(jQuery);

/***/ },
/* 52 */
/***/ function(module, exports) {

	(function (EAT, Ember) {
	    "use strict;";

	    EAT.Widget.register('image-in-elicitation', {
	        prettyName: "Image",
	        templateName: 'image',
	        definitionSchema: {
	            model: EAT.WidgetDefinition.extend({
	                label: ""
	            }),
	            image: {
	                accessor: EAT.WidgetDefinition.Attr('image-in-elicitation-id'),
	                prettyName: "Upload an Image",
	                type: "Image"
	            },
	            label: {
	                accessor: EAT.WidgetDefinition.ChildNode('label'),
	                prettyName: "Caption",
	                type: "Text"
	            },
	            alignCenter: {
	                accessor: EAT.WidgetDefinition.Attr('align-center'),
	                prettyName: "Align Center",
	                type: "Boolean"
	            },
	            linkToURL: {
	                accessor: EAT.WidgetDefinition.Attr('href'),
	                prettyName: "Link to URL"
	            },
	            thumbnail: {
	                accessor: EAT.WidgetDefinition.Attr('is-thumbnail'),
	                prettyName: "Thumbnail",
	                type: "Boolean"
	            },
	            imageURL: {
	                accessor: EAT.WidgetDefinition.Attr('src'),
	                prettyName: "Manual Image URL (instead of upload)"
	            }
	        },
	        linkToURL: function () {
	            var linkToURL = this.get('definition.linkToURL');
	            if (!Ember.isNone(linkToURL) && linkToURL.length > 1) {
	                return linkToURL;
	            } else {
	                return this.get('imageURLFullSize');
	            }
	        }.property('definition.linkToURL', 'imageURLFullSize'),
	        imageURLFullSize: function () {
	            var url = this.get('baseImageURL');
	            if (Ember.isNone(url)) return undefined;

	            return url + "&size=original";
	        }.property('baseImageURL'),
	        imageURL: function () {
	            var url = this.get('baseImageURL');
	            if (this.get('definition.thumbnail')) {
	                return url + "&size=thumbnail";
	            } else {
	                return url;
	            }
	        }.property('baseImageURL', 'definition.thumbnail'),
	        baseImageURL: function () {
	            var imageURL = this.get('definition.imageURL');

	            if (!Ember.isNone(imageURL) && imageURL.length > 0) {
	                return imageURL.replace('[[PERSON_ID]]', encodeURIComponent(this.get('elicitation.personID')));
	            } else {
	                var imageID = this.get('definition.image');
	                if (Ember.isNone(imageID)) return undefined;

	                return this.get('elicitation.imageURL') + "&id=" + imageID;
	            }
	        }.property('definition.image', 'definition.imageURL'),
	        imageMissingMessage: function () {
	            var messageNum = Math.floor(Math.random() * 4);
	            if (messageNum == 0) {
	                return "You step in the stream,\nbut the water has moved on.\nNo image remains.";
	            } else if (messageNum == 1) {
	                return "Is what you seek reality? Or only its image?";
	            } else if (messageNum == 2) {
	                return "The image you seek\ncannot be located but\nendless others exist";
	            } else if (messageNum >= 3) {
	                return "Only an empty glass need be filled.";
	            }
	        }.property(),
	        // Disable qualifications on this widget
	        qualifications: []
	    });
	})(EAT, Ember);

/***/ },
/* 53 */
/***/ function(module, exports) {

	(function (EAT, Ember) {
	    "use strict";

	    // FIXME: We use this global to create radio "groups"...
	    // is there a better way?

	    var globalLikertNum = 0;

	    EAT.Widget.register('likert', {
	        likertNum: null,
	        prettyName: "Likert Scale",
	        initWidget: function initWidget() {
	            this._super();
	            this.set('likertNum', globalLikertNum++);
	        },
	        templateName: 'likert',
	        definitionSchema: {
	            model: EAT.WidgetDefinition.extend({
	                label: "Authoring elicitations makes me feel mushy inside.",
	                stronglyNegativeLabel: "Strongly Disagree",
	                negativeLabel: "Disagree",
	                neutralLabel: "Not Sure",
	                positiveLabel: "Agree",
	                stronglyPositiveLabel: "Strongly Agree"
	            }),
	            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
	            stronglyNegativeLabel: {
	                accessor: EAT.WidgetDefinition.Attr("strongly-negative-label"),
	                prettyName: "Strongly Negative Label"
	            },
	            negativeLabel: {
	                accessor: EAT.WidgetDefinition.Attr("negative-label"),
	                prettyName: "Negative Label"
	            },
	            neutralLabel: {
	                accessor: EAT.WidgetDefinition.Attr("neutral-label"),
	                prettyName: "Neutral Label"
	            },
	            positiveLabel: {
	                accessor: EAT.WidgetDefinition.Attr("positive-label"),
	                prettyName: "Positive Label"
	            },
	            stronglyPositiveLabel: {
	                accessor: EAT.WidgetDefinition.Attr("strongly-positive-label"),
	                prettyName: "Strongly Positive Label"
	            }
	        },
	        serializeData: function serializeData(data, errors) {
	            var agreement = this.$().find("input[type='radio']:checked").val();

	            data.set('agreement', agreement);
	            if (!agreement) {
	                errors.pushObject("You didn't say how you felt about one of the statements");
	            }
	        },
	        resumeFromSerializedData: function resumeFromSerializedData(serializedData) {
	            if (serializedData && serializedData.agreement) {
	                var radioButton = this.$().find("input[type='radio']").toArray().find(function (x) {
	                    return $(x).val() === serializedData['agreement'];
	                });
	                $(radioButton).prop('checked', true);
	            }
	        }
	    });
	})(EAT, Ember);

/***/ },
/* 54 */
/***/ function(module, exports) {

	(function (EAT, Ember) {
	    "use strict";

	    var globalMultipleChoiceNum = 0;

	    EAT.Widget.register('multiple-choice', {
	        prettyName: "Multiple Choice",
	        value: null, // FIXME: remove this?
	        templateName: 'multiple-choice',
	        dataModel: EAT.WidgetData.extend({
	            writein: ""
	        }),
	        definitionSchema: {
	            model: EAT.WidgetDefinition.extend({
	                writein: false
	            }),
	            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
	            writein: { accessor: EAT.WidgetDefinition.Attr("writein"), type: "Boolean", prettyName: "Append a write-in choice" },
	            choices: {
	                type: "HasMany",
	                prettyName: 'Choice',
	                emphasizeWhenEmpty: true,
	                accessor: EAT.WidgetDefinition.HasMany('choice', {
	                    model: EAT.WidgetDefinition.extend({
	                        label: "One choice amongst many",
	                        htmlID: function () {
	                            return this.get('dataKey');
	                        }.property('dataKey')
	                    }),
	                    label: { accessor: EAT.WidgetDefinition.Contents() }
	                })
	            }
	        },
	        initWidget: function initWidget() {
	            this._super();
	            this.set('multipleChoiceNum', globalMultipleChoiceNum++);
	        },
	        setupDOM: function setupDOM() {},
	        serializeData: function serializeData(data, errors) {
	            var choice = this.$().find("input[type='radio']:checked").val();

	            data.set('choice', choice);
	            if (!choice) {
	                errors.pushObject("You didn't select one of the multiple choices");
	            }
	        },
	        resumeFromSerializedData: function resumeFromSerializedData(serializedData) {
	            if (serializedData && serializedData.choice) {
	                var choice = serializedData['choice'];

	                var radioButton = this.$().find("input[type='radio']").toArray().find(function (x) {
	                    return $(x).val() === choice;
	                });

	                if (Ember.isNone(radioButton) && this.get('definition.writein')) {
	                    radioButton = $(".writein input[type='radio']");
	                    this.set('data.writein', choice);
	                }

	                $(radioButton).prop('checked', true);
	            }
	        }
	    });
	})(EAT, Ember);

/***/ },
/* 55 */
/***/ function(module, exports) {

	(function (EAT, Ember) {
	    // We should remove this cruft code from:
	    // https://github.com/emberjs/ember.js/pull/1235
	    // Once its merged into ember master
	    Ember.assert("Ember.RadioButton is not natively defined", Ember.isNone(Ember.RadioButton) && Ember.isNone(Ember.RadioButtonGroup));

	    var get = Ember.get,
	        getPath = Ember.getPath,
	        set = Ember.set,
	        fmt = Ember.String.fmt;

	    Ember.Control = Ember.View.extend({

	        init: function init() {
	            this._super();

	            // SETH: disabled because it didn't work anyway
	            // set(this, '_context', this);
	        }

	    });

	    /**
	      @class
	    
	      The `Ember.RadioButton` view class renders an html radio input, allowing the
	      user to select a single value from a list of values.
	    
	      Dealing with multiple radio buttons can be simplified by using an
	      `Ember.RadioButtonGroup`. See the {@link Ember.RadioButtonGroup} documentation
	      for more information.
	    
	      @extends Ember.View
	    */
	    Ember.RadioButton = Ember.Control.extend(
	    /** @scope Ember.RadioButton.prototype */{

	        attributeBindings: ["disabled", "type", "name", "value", "checked"],
	        classNames: ["ember-radio-button"],

	        /**
	          The value of this radio button.
	                 @type Object
	        */
	        value: null,

	        /**
	          The selected value in this group of radio buttons.
	                 @type Object
	        */
	        selectedValue: null,

	        /**
	          Sets the disabled property on the element.
	                 @default false
	          @type Boolean
	        */
	        isDisabled: false,

	        /**
	          Sets the checked property on the element.
	                 @default false
	          @type Boolean
	        */
	        checked: false,

	        tagName: "input",
	        type: "radio",

	        selectedValueChanged: Ember.observer(function () {
	            var selectedValue = get(this, "selectedValue");
	            if (!Ember.isEmpty(selectedValue) && get(this, "value") === selectedValue) {
	                set(this, "checked", true);
	            } else {
	                set(this, "checked", false);
	            }
	        }, 'selectedValue'),

	        checkedChanged: Ember.observer(function () {
	            this._updateElementValue();
	        }, 'checked'),

	        init: function init() {
	            this._super();
	            this.selectedValueChanged();
	        },

	        change: function change() {
	            set(this, 'checked', this.$().prop('checked'));
	            Ember.run.once(this, this._updateElementValue);
	        },

	        _updateElementValue: function _updateElementValue() {
	            if (!get(this, 'checked')) return;
	            set(this, 'selectedValue', get(this, 'value'));
	        }

	    });

	    /**
	      @class
	    
	      The `Ember.RadioButtonGroup` view class provides a simplfied method for dealing
	      with multiple `Ember.RadioButton` instances.
	    
	      ## Simple Example
	    
	      ```handlebars
	      {{#view Ember.RadioButtonGroup name="role" valueBinding="content.role"}}
	        {{view RadioButton value="admin"}}
	        {{view RadioButton value="owner"}}
	        {{view RadioButton value="user"}}
	      {{/view}}
	      ```
	    
	      Note that the radio buttons are declared as `{{view RadioButton ...}}` as opposed
	      to `{{view Ember.RadioButton ...}}`. When inside the body of a RadioButtonGroup,
	      a `RadioButton` view is provided which automatically picks up the same name and value
	      binding as the containing group.
	    
	      ## More Complex Example
	    
	      ```javascript
	      App.person = Ember.Object.create({name: 'Gordon', role: 'admin'})
	      App.PersonController = Ember.Controller.extend({
	        contentBinding: 'App.person',
	        roleOptions: ['admin', 'owner', 'user', 'banned']
	      });
	      ```
	    
	      ```handlebars
	      {{#view Ember.RadioButtonGroup name="role" valueBinding="content.role"}}
	        {{#each role in controller.roleOptions}}
	          <label>
	            {{view RadioButton valueBinding="role"}}
	            {{role}}
	          </label>
	        {{/each}}
	      {{/view}}
	      ```
	    
	      The above controller/template combination will render html containing a
	      radio input for each item in the `roleOptions` property of the controller.
	      Initially, the `admin` option will be checked. If the user selects a different
	      radio, the `role` property of the controller's `content` will be updated
	      accordingly.
	    
	      @extends Ember.View
	    */
	    Ember.RadioButtonGroup = Ember.Control.extend(
	    /** @scope Ember.RadioButtonGroup.prototype */{

	        classNames: ['ember-radio-button-group'],
	        attributeBindings: ['name:data-name'],

	        name: Ember.required(),

	        /**
	          The value of the selected radio button in this group
	                 @type Object
	        */
	        value: null,
	        init: function init() {
	            this._super();
	        },
	        RadioButton: Ember.computed(function () {
	            return Ember.RadioButton.extend({
	                group: this,
	                selectedValueBinding: 'group.value',
	                nameBinding: 'group.name'
	            });
	        })

	    });
	})(EAT, Ember);

	(function (EAT, Ember) {
	    "use strict";

	    var globalMultipleChoiceTableNum = 0;

	    var RowModel = Ember.Object.extend({
	        cells: null,
	        labelBinding: 'definition.label',
	        multipleChoiceNum: undefined,
	        multipleChoiceName: function () {
	            return "multiple-choice-table-" + this.get('multipleChoiceNum');
	        }.property('multipleChoiceNum'),
	        init: function init() {
	            this.set('multipleChoiceNum', globalMultipleChoiceTableNum++);
	        },
	        radioChoice: undefined
	    });

	    var CellModel = Ember.Object.extend({
	        checkBoxBinding: "col.definition.checkBox",
	        textEntryBinding: "col.definition.textEntry",
	        radioButtonBinding: "col.definition.radioButton",
	        choiceBinding: "col.definition.label",
	        dropDownBinding: "col.definition.dropDown",
	        col: null,
	        row: null,
	        value: false
	    });

	    var TableModel = Ember.Object.extend({
	        reorderedRows: function () {
	            var rows = this.get('rows');
	            if (this.get('dataModel.definition.randomizeRowOrder')) {
	                return ElicitationUtils.shuffleArray(Ember.A(rows.slice()));
	            } else {
	                return rows;
	            }
	        }.property('rows.@each', 'dataModel.definition.randomizeRowOrder')
	    });

	    var DataModel = EAT.WidgetData.extend({
	        init: function init() {
	            this._super();
	            this.set('table', EAT.WidgetData.CreateTable({
	                dataModel: this,
	                rowDefinitionsBinding: 'dataModel.definition.rows',
	                colDefinitionsBinding: 'dataModel.definition.choices',
	                rowModel: RowModel,
	                cellModel: CellModel,
	                tableModel: TableModel
	            }));
	        }
	    });

	    var RowView = Ember.RadioButtonGroup.extend( /*EAT.RateLimitedViewMixin, */{
	        templateName: 'multiple-choice-table-row',
	        tagName: 'tr',
	        row: undefined,
	        attributeBindings: ['valign'],
	        valign: "top",

	        // These are for RadioButtonGroup, which we inherit from instead of embedding
	        // because you can't have an extra "div" element between tbody, tr, and td
	        nameBinding: "row.multipleChoiceName",
	        valueBinding: "row.radioChoice"
	    });

	    function makeCustomDropdownChoicesSchema(choiceNum) {
	        return {
	            type: "HasMany",
	            prettyName: 'Custom Dropdown #' + choiceNum + ' Choice',
	            accessor: EAT.WidgetDefinition.HasMany('custom-dropdown-choice-' + choiceNum, {
	                model: EAT.WidgetDefinition.extend({
	                    label: 'dropdown choice'
	                }),
	                label: { accessor: EAT.WidgetDefinition.Attr("label"), type: "String" }
	            }),
	            category: "Custom Dropdowns"
	        };
	    }

	    EAT.Widget.register('multiple-choice-table', {
	        RowView: RowView,
	        prettyName: "Multiple Choice Table",
	        value: null,
	        templateName: 'multiple-choice-table',
	        dataModel: DataModel,
	        RadioButton: Ember.Checkbox.extend({
	            type: 'radio'
	        }),
	        definitionSchema: {
	            model: EAT.WidgetDefinition.extend({
	                label: "Select your choices for these questions"
	            }),
	            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
	            choices: {
	                type: "HasMany",
	                prettyName: 'Choice',
	                emphasizeWhenEmpty: true,
	                accessor: EAT.WidgetDefinition.HasMany('choice', {
	                    model: EAT.WidgetDefinition.extend({
	                        label: "One Choice",
	                        htmlID: function () {
	                            return this.get('dataKey');
	                        }.property('dataKey'),
	                        checkBox: function (key, val) {
	                            if (arguments.length > 1 && val == true) {
	                                // Load the deprecated checkBox property for compat
	                                this.set('choiceType', 'checkbox');
	                            }
	                            return this.get('choiceType') === "checkbox";
	                        }.property('choiceType'),
	                        radioButton: function (key, val) {
	                            return this.get('choiceType') === "radio";
	                        }.property('choiceType'),
	                        textEntry: function (key, val) {
	                            return this.get('choiceType') === "text";
	                        }.property('choiceType'),
	                        dropDown: function (key, val) {
	                            return this.get('choiceType').slice(0, -1) == 'custom-dropdown-';
	                        }.property('choiceType'),
	                        hihi: function () {
	                            console.log("hihi!", this.get('choiceType'));
	                        }.property().volatile(),
	                        dropDownChoices: function (key, val) {
	                            var choiceNum = this.get('choiceType').slice(-1);
	                            return this.get('parent').get('customDropDownChoices' + choiceNum).mapProperty('label').insertAt(0, '');
	                        }.property('choiceType', 'parent.customDropDownChoices1.@each.label', 'parent.customDropDownChoices2.@each.label', 'parent.customDropDownChoices3.@each.label', 'parent.customDropDownChoices4.@each.label'
	                        /* if adding more customDropDownChoices than 4, add it here */
	                        ),
	                        choiceType: "radio"
	                    }),
	                    label: { accessor: EAT.WidgetDefinition.ChildNode('label') },
	                    checkBox: {
	                        prettyName: 'Check Box',
	                        type: "Boolean",
	                        accessor: EAT.WidgetDefinition.Attr('check-box'),
	                        visible: false,
	                        dontSerialize: true
	                    },
	                    choiceType: {
	                        prettyName: "Type of choice",
	                        type: "Enum",
	                        values: [{ value: "radio", label: "Radio" }, { value: "checkbox", label: "Check Box" }, { value: "text", label: "Text Entry" }, { value: "custom-dropdown-1", label: "Custom Dropdown #1" }, { value: "custom-dropdown-2", label: "Custom Dropdown #2" }, { value: "custom-dropdown-3", label: "Custom Dropdown #4" }, { value: "custom-dropdown-4", label: "Custom Dropdown #4" }],
	                        accessor: EAT.WidgetDefinition.Attr('choice-type')
	                    }
	                })
	            },
	            rows: {
	                type: "HasMany",
	                prettyName: 'Row',
	                emphasizeWhenEmpty: true,
	                accessor: EAT.WidgetDefinition.HasMany('row', {
	                    model: EAT.WidgetDefinition.extend({
	                        label: 'untitled row'
	                    }),
	                    label: { accessor: EAT.WidgetDefinition.ChildNode('label') }
	                })
	            },
	            randomizeRowOrder: {
	                type: "Boolean",
	                prettyName: 'Randomize Row Order',
	                accessor: EAT.WidgetDefinition.Attr('randomize-row-order'),
	                helpText: 'Randomize the order of rows for each person viewing the elicitation'
	            },
	            customDropDownChoices1: makeCustomDropdownChoicesSchema('1'),
	            customDropDownChoices2: makeCustomDropdownChoicesSchema('2'),
	            customDropDownChoices3: makeCustomDropdownChoicesSchema('3'),
	            customDropDownChoices4: makeCustomDropdownChoicesSchema('4')
	        },
	        showTableFooter: function () {
	            return this.get('definition.rows.length') >= 8;
	        }.property('definition.rows.length'),
	        serializeData: function serializeData(data, errors) {
	            data.set('rows', this.get('data.table.rows').map(function (row) {
	                var radioChoice = row.get('radioChoice');
	                var rowData = EAT.WidgetData.create({
	                    choice: radioChoice,
	                    dataKeyText: row.get('label')
	                });

	                var cells = row.get('cells');

	                var serializeCellByChoiceAndValue = function serializeCellByChoiceAndValue(cell) {
	                    var cellName = ElicitationUtils.escapeForEmberProperty(cell.get('choice'));
	                    var cellValue = cell.get('value');
	                    rowData.set(cellName, cellValue);
	                };

	                cells.filterBy('checkBox').forEach(serializeCellByChoiceAndValue);
	                cells.filterBy('dropDown').forEach(serializeCellByChoiceAndValue);

	                cells.filterProperty('textEntry').forEach(function (textEntry) {
	                    var textEntryName = ElicitationUtils.escapeForEmberProperty(textEntry.get('choice'));
	                    var textEntryValue = textEntry.get('value');
	                    if (textEntryValue == false) {
	                        textEntryValue = "";
	                    }
	                    rowData.set(textEntryName, textEntryValue);
	                });

	                if (Ember.isNone(radioChoice) && cells.filterProperty('radioButton').length > 0) {
	                    errors.pushObject("You didn't select a choice for row '" + row.get('definition.label') + "'");
	                }

	                return rowData;
	            }));
	        }
	    });
	})(EAT, Ember);

/***/ },
/* 56 */
/***/ function(module, exports) {

	(function (EAT, Ember) {
	    "use strict";

	    EAT.Widget.register('paragraph', {
	        prettyName: "Paragraph",
	        templateName: 'paragraph',
	        definitionSchema: {
	            model: EAT.WidgetDefinition.extend({
	                label: "##This is a Header##\nWith a block of text under it demonstrating a few features of Markdown formatting, including:\n\n- A link to [another website](http://www.google.com)\n- *Italicized text*\n- **Bold text**\n- Support for<sup>superscript</sup>\n\nAnd another paragraph, with a [[term definition]]."
	            }),
	            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" }
	        },
	        // Disable qualifications on this widget
	        qualifications: []
	    });
	})(EAT, Ember);

/***/ },
/* 57 */
/***/ function(module, exports) {

	
	(function (EAT, Ember) {
	    "use strict";

	    function bindRunEventHandler(eventName) {
	        return function (page) {
	            this.runEventHandler(eventName, page);
	        };
	    }

	    function bindCustomScriptingAPI(elicitation) {
	        function notYetImplemented() {
	            throw "Not yet implemented! Yell at Seth if you need this now.";
	        }
	        function getWidget(widgetID) {
	            return elicitation.get('widgets').findBy('dataKey', widgetID);
	        }
	        function getPage(pageNum) {
	            return elicitation.get('pagesController.content')[pageNum];
	        }

	        var api = {
	            getValueOfVariable: function getValueOfVariable(variableName) {
	                return elicitation.get('variableScope')[variableName];
	            },
	            setCustomVariable: function setCustomVariable(variableName, value) {
	                var existingVariable = elicitation.get("variables").findBy("name", variableName);
	                if (existingVariable && existingVariable.get("widget")) {
	                    throw "Sorry, cannot override a variable defined by a widget, setCustomVariable() can only be used with new variable names";
	                }

	                elicitation.get('customScriptingVariables').pushObject(Ember.Object.create({
	                    name: variableName,
	                    value: value
	                }));
	            },
	            setWidgetLabel: function setWidgetLabel(widgetID, label) {
	                this.setWidgetProperty(widgetID, 'definition.label', label);
	            },
	            getWidgetLabel: function getWidgetLabel(widgetID) {
	                return this.getWidgetProperty(widgetID, 'definition.label');
	            },
	            gotoPage: function gotoPage(pageNumStartingAtPageOne) {
	                if (pageNumStartingAtPageOne < 1) {
	                    console.warn("Pages start at page 1, not page 0");
	                } else {
	                    var page = getPage(pageNumStartingAtPageOne - 1);

	                    if (!Ember.isNone(page)) {
	                        elicitation.get('pagesController').gotoPage(page);
	                    } else {
	                        console.warn("Page number " + pageNumStartingAtPageOne + " doesn't seem to exist, note that the first page is pageNum=1");
	                    }
	                }
	            },
	            getElicitedData: function getElicitedData() {
	                return elicitation.getSerializedData();
	            },
	            getElicitatedDataFor: function getElicitatedDataFor(widgetID) {
	                return elicitation.getSerializedDataFor(widgetID);
	            },
	            /* Supported, but not the property names... */
	            setWidgetProperty: function setWidgetProperty(widgetID, propertyName, value, redrawAfterSetting) {
	                if (redrawAfterSetting === undefined) redrawAfterSetting = true;

	                var widget = getWidget(widgetID);
	                widget.set(propertyName, value);
	                if (redrawAfterSetting) {
	                    try {
	                        widget.redraw();
	                    } catch (e) {
	                        console.warn("Exception trying to redraw widget after customScripting.api.setWidgetProperty(): ", e);
	                        console.warn("Trying to call widget.redraw() again in 100ms");
	                        Ember.run.next(function () {
	                            widget.redraw();
	                        });
	                    }
	                }
	            },
	            getWidgetProperty: function getWidgetProperty(widgetID, propertyName) {
	                return getWidget(widgetID).get(propertyName);
	            },

	            /* Helpful for learning to develop */
	            findWidgetID: function findWidgetID(pageNum, widgetNum) {
	                return getPage(pageNum).get('widgets').get(widgetNum).get('dataKey');
	            },
	            printWidgetProperties: function printWidgetProperties(widgetID, maxPropertyDepthToPrint) {
	                var widget = getWidget(widgetID);
	                var props = widget.stateGetPropertyNames(maxPropertyDepthToPrint, true);

	                var header = "Some properties for widget with label " + widget.get('definition.label') + ":\n";
	                var msg = "\n\nYou can use these properties with api.setWidgetProperty('" + widgetID + "', 'some.property.here', 'new value') as well as api.getWidgetProperty('" + widgetID + "', 'some.property.here'), but please note that widget properties may change over time, might disappear, and are NOT OFFICIALLY SUPPORTED.";
	                console.log(header + props.join("\n") + msg);

	                return props;
	            },
	            printAllWidgetIDs: function printAllWidgetIDs() {
	                var i = 0;
	                var result = '';
	                var widgetIDs = [];

	                elicitation.get('pagesController.content').forEach(function (page) {
	                    i++;
	                    result += "Page " + i + ", '" + page.get('title') + "':\n";
	                    page.get('widgets').forEach(function (widget) {
	                        var widgetID = widget.get('dataKey');
	                        result += "\t" + widgetID + "   '" + widget.get('templateName') + ": " + widget.get('definition.label') + "'\n";
	                        widgetIDs.push(widgetID);
	                    });
	                    result += "\n";
	                });
	                console.log(result + "\n\n(PS: WidgetIDs are the long numbers)");
	                return widgetIDs;
	            }
	        };

	        /*
	        Supported APIs:
	        - getValueOfVariable(variableName)
	        - setLabelOfWidget(widgetID, label)
	        - gotoPage(pageNum)
	             Supported API, but widget propertyNames may change so use at own risk:
	        - setPropertyOfWidget(widgetID, propertyName, value)
	        - getPropertyOfWidget(widgetID, propertyName)
	             */
	        return api;
	    }

	    EAT.Widget.register('custom-scripting', {
	        prettyName: "Custom Scripting",
	        templateName: 'custom-scripting',
	        definitionSchema: {
	            model: EAT.WidgetDefinition.extend({
	                label: "explain what the script does here",
	                beforeEnteringPage: "// see http://wiki.nearzero.org/elicitation-authoring/for-developers\n// for examples and (some) documentation\n\nalert('hello world!');\n",
	                beforeExitingPage: "",
	                activeEventHandlers: function () {
	                    return ['beforeEnteringPage', 'beforeExitingPage'].map(function (eventName) {
	                        return {
	                            name: eventName,
	                            handler: this.get(eventName)
	                        };
	                    }.bind(this)).filter(function (event) {
	                        return event.handler.trim() != '';
	                    });
	                }.property('beforeEnteringPage', 'beforeExitingPage')
	            }),
	            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text", prettyName: "Description of code" },
	            beforeEnteringPage: { accessor: EAT.WidgetDefinition.ChildNode("beforeEnteringPage"), type: "Text", prettyName: "BeforeEnteringPage(api, unsupported) {", helpText: "The JavaScript in BeforeEnteringPage is executed before the page in which this widget resides is switched to. You can use the 'Preview' button to test your custom script in actual usage, or just click the test button to manually execute your script.\n\nYour code has access to an 'api' variable, which is an object with functions you can use for scripting the elicitation. You can explore this API by opening your javascript console and exploring customScripting.api . You can also directly access the raw elicitation to do anything you want by using unsupported.elicitation in your script, but in general this is not recommended." },
	            beforeExitingPage: { accessor: EAT.WidgetDefinition.ChildNode("beforeExitingPage"), type: "Text", prettyName: "BeforeExitingPage(api, unsupported) {", helpText: "See help for BeforeEnteringPage for details on using the custom scripting feature" }
	        },
	        beforeEnteringPage: bindRunEventHandler("beforeEnteringPage"),
	        beforeExitingPage: bindRunEventHandler("beforeExitingPage"),
	        conditionallyHidden: function () {
	            return true; // custom scripting stuff should never be visible to end-users...
	        }.property(),
	        serializeData: function serializeData(data, errors) {},
	        init: function init() {
	            this._super();
	            debug.customScriptingWidget = this;
	            window.customScripting = {
	                api: bindCustomScriptingAPI(this.get('elicitation'))
	            };
	        },
	        editors: {
	            beforeEnteringPage: null,
	            beforeExtingPage: null
	        },
	        beforeEnteringPageChanged: function () {
	            if (this.editors.beforeEnteringPage) {
	                var value = this.get("definition.beforeEnteringPage");
	                if (value != this.editors.beforeEnteringPage.getValue()) {
	                    console.log("Updating editor from property");
	                    this.editors.beforeEnteringPage.setValue(value);
	                }
	            }
	        }.observes("definition.beforeEnteringPage"),
	        beforeExitingPageChanged: function () {
	            if (this.editors.beforeExitingPage) {
	                var value = this.get("definition.beforeExitingPage");
	                if (value != this.editors.beforeExitingPage.getValue()) {
	                    this.editors.beforeExitingPage.setValue(value);
	                }
	            }
	        }.observes("definition.beforeExitingPage"),
	        setupDOM: function setupDOM() {
	            var _this = this;

	            if (this.get('elicitation.allowEditing')) {
	                var widget;

	                (function () {
	                    var createEditor = function createEditor(eventName) {
	                        var div = widget.$().find(".script-editor#" + eventName)[0];
	                        var editor = CodeMirror(div, {
	                            lineNumbers: true,
	                            viewportMargin: Infinity,
	                            value: widget.get("definition").get(eventName)
	                        });
	                        editor.on("change", function () {
	                            widget.get("definition").set(eventName, editor.getValue());
	                        });
	                        return editor;
	                    };

	                    widget = _this;


	                    debug.widgie = _this;

	                    Ember.run.later(_this, function () {
	                        this.editors.beforeEnteringPage = createEditor("beforeEnteringPage");
	                        this.editors.beforeExitingPage = createEditor("beforeExitingPage");
	                    }, 750);
	                })();
	            }
	        },
	        runEventHandler: function runEventHandler(eventName, page) {
	            var handlerBody = this.get('definition').get(eventName);

	            if (handlerBody.trim() == '') return;

	            var elicitation = this.get('elicitation');

	            var unsupported = {
	                page: page,
	                elicitation: elicitation
	            };
	            var api = bindCustomScriptingAPI(elicitation);
	            window.customScripting.lastScriptRun = {
	                name: eventName,
	                runItAgain: function runItAgain() {
	                    this.runEventHandler(eventName, page);
	                },
	                sourceCode: handlerBody,
	                api: api,
	                unsupported: unsupported,
	                exception: null
	            };

	            try {
	                var handler = new Function("api", "unsupported", handlerBody);
	                handler(api, unsupported);
	            } catch (e) {
	                console.error("Exception in custom script for " + eventName + ":\n", e);
	                console.warn("In custom script:\n", handlerBody);
	                window.customScripting.lastScriptRun.exception = e;
	                console.warn("See window.customScripting.lastScriptRun.exception for details");
	            }
	        },

	        actions: {
	            testEventHandler: function testEventHandler(eventName) {
	                this.runEventHandler(eventName, "noPageDefinedOops");
	            }
	        }
	    });
	})(EAT, Ember);

/***/ },
/* 58 */
/***/ function(module, exports) {

	(function (EAT, Ember) {
	    "use strict";

	    EAT.Widget.register('slider-allocation', {
	        prettyName: "Slider Allocation",
	        value: null, // FIXME: remove this? unused?
	        templateName: 'slider-allocation',
	        definitionSchema: {
	            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
	            totalAllocation: { accessor: EAT.WidgetDefinition.Attr("total-allocation"), prettyName: "Allocation", type: "String" },
	            leftLabel: { accessor: EAT.WidgetDefinition.ChildNode("left-label"), prettyName: "Left Item" },
	            rightLabel: { accessor: EAT.WidgetDefinition.ChildNode("right-label"), prettyName: "Right Item" },
	            unitSuffix: { accessor: EAT.WidgetDefinition.Attr("unit-suffix"), prettyName: "Units", helpText: "Units for the value being allocated, e.g. the 'kg' in 50kg" },
	            unitPrefix: { accessor: EAT.WidgetDefinition.Attr("unit-prefix"), prettyName: "Prefix for Units", helpText: "Prefix to the value being allocated, e.g. the '$' in $50m" },
	            model: EAT.WidgetDefinition.extend({
	                label: "How would you spend a special allocation of $100m?",
	                totalAllocation: 100,
	                unitPrefix: "$",
	                unitSuffix: "m",
	                leftLabel: "Candy",
	                rightLabel: "Toothpaste"
	            })
	        },
	        setupDOM: function setupDOM() {
	            var slider = this.$().find("#jquery-slider");

	            var elicitationWidget = this;
	            var valChanged = function valChanged() {
	                elicitationWidget.redraw();
	            };

	            slider.slider({
	                change: valChanged,
	                slide: valChanged,
	                min: 0.0,
	                max: 1.0,
	                step: 0.01,
	                value: 0.5
	            });

	            this.set('slider', slider);
	        },
	        redraw: function () {
	            var slider = this.get('slider');
	            if (Ember.isNone(slider)) return;

	            var totalAllocation = this.get('definition.totalAllocation');
	            var val = parseFloat(slider.slider("value"));
	            var leftBudget = ((1.0 - val) * totalAllocation).toFixed(1);
	            this.set('data.leftValue', leftBudget);

	            var rightBudget = (val * totalAllocation).toFixed(1);
	            this.set('data.rightValue', rightBudget);
	        }.observes('definition.totalAllocation', 'slider'),
	        serializeData: function serializeData(data, errors) {
	            var leftLabel = ElicitationUtils.escapeForEmberProperty(this.get('definition.leftLabel'));
	            var rightLabel = ElicitationUtils.escapeForEmberProperty(this.get('definition.rightLabel'));
	            data.set(leftLabel, parseFloat(this.get('data.leftValue')));
	            data.set(rightLabel, parseFloat(this.get('data.rightValue')));
	        },
	        afterStateResume: function afterStateResume() {
	            // update slider position from leftValue and rightValue
	            var slider = this.get('slider');
	            if (Ember.isNone(slider)) return;

	            var leftValue = parseFloat(this.get('data.leftValue'));
	            var rightValue = parseFloat(this.get('data.rightValue'));

	            var value = leftValue / (leftValue + rightValue);

	            slider.slider("value", value);
	        }
	    });
	})(EAT, Ember);

/***/ },
/* 59 */
/***/ function(module, exports) {

	(function (EAT, Ember) {
	    "use strict";

	    EAT.TabularInputTextField = Ember.TextField.extend({
	        widget: undefined,
	        row: undefined,
	        focusIn: function focusIn(evt) {
	            var widget = this.get('widget');
	            var rows = widget.get('data.rows');
	            var row = this.get('row');
	            if (rows.indexOf(row) >= rows.get('length') - 1) {
	                widget.addNewRow();
	            }
	        }
	    });

	    EAT.Widget.register('tabular-input', {
	        prettyName: "Tabular Input",
	        templateName: 'tabular-input',
	        dataModel: EAT.WidgetData.extend({
	            rows: undefined,
	            init: function init() {
	                this._super();
	                this.set('rows', Ember.ArrayController.create({ content: [] }));
	            },
	            appendRow: function appendRow(columnDefinitions) {
	                var rows = this.get('rows');
	                var columns = columnDefinitions.map(function (col) {
	                    return Ember.Object.create({ text: '' });
	                });

	                var newRow = Ember.ArrayController.create({
	                    content: columns,
	                    columnsBinding: 'content'
	                });
	                rows.pushObject(newRow);
	            }
	        }),
	        definitionSchema: {
	            model: EAT.WidgetDefinition.extend({
	                label: "Who else should complete this elicitation?"
	            }),
	            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
	            columns: {
	                type: "HasMany",
	                emphasizeWhenEmpty: true,
	                prettyName: 'Column',
	                accessor: EAT.WidgetDefinition.HasMany('column', {
	                    model: EAT.WidgetDefinition.extend({
	                        label: "untitled column"
	                    }),
	                    label: { accessor: EAT.WidgetDefinition.Contents() }
	                })
	            }
	        },
	        addNewRow: function addNewRow() {
	            var data = this.get('data');
	            data.appendRow(this.get('definition.columns'));
	            window.debugWidget = this;
	        },
	        emptyContentWhenColumnsChange: function () {
	            this.get('data.rows').clear();
	            this.addNewRow();
	        }.observes('definition.columns.length'),
	        serializeData: function serializeData(data, errors) {
	            var columnNames = this.get('definition.columns').map(function (column) {
	                return EAT.makeDataKeyFromText(column.get('label'));
	            });

	            this.get('data.rows').forEach(function (row, rowNum) {
	                row.get('columns').forEach(function (column, colNum) {
	                    var value = column.get('text');
	                    var colName = columnNames[colNum];
	                    var keyName = ElicitationUtils.escapeForEmberProperty(colName + "_" + rowNum.toString());
	                    data.set(keyName, value);
	                });
	            });
	        }
	    });
	})(EAT, Ember);

/***/ },
/* 60 */
/***/ function(module, exports) {

	(function (EAT, Ember) {
	    "use strict";

	    EAT.Widget.register('text-area', {
	        prettyName: "Text Area",
	        templateName: 'text-area',
	        definitionSchema: {
	            model: EAT.WidgetDefinition.extend({
	                numRows: 4,
	                optional: true
	            }),
	            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
	            numRows: { accessor: EAT.WidgetDefinition.Attr("num-rows"), type: "String", prettyName: "# of Lines of Text" },
	            placeholder: { accessor: EAT.WidgetDefinition.Attr("placeholder"), type: "String", prettyName: "Placeholder Text" },
	            optional: { accessor: EAT.WidgetDefinition.Attr("optional"), type: "Boolean", prettyName: "Response is optional" }
	        },
	        serializeData: function serializeData(data, errors) {
	            var response = this.get('data.text');

	            if (!response && !this.get('definition.optional')) {
	                errors.pushObject("A text area is still blank");
	            }

	            data.set('text', response);
	        }
	    });
	})(EAT, Ember);

/***/ },
/* 61 */
/***/ function(module, exports) {

	(function (EAT, Ember, ElicitationUtils) {
	    "use strict";

	    EAT.Widget.register('text-box', {
	        prettyName: "Number Box",
	        templateName: 'text-box',
	        definitionSchema: {
	            model: EAT.WidgetDefinition.extend({
	                askForUncertaintyRange: true,
	                label: "How many jellybeans are in the jar?",
	                uncertaintyRangeLabel: "Indicate an uncertainty range for your estimate:",
	                uncertaintyRangeWidth: 1.0
	            }),
	            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
	            askForUncertaintyRange: { accessor: EAT.WidgetDefinition.Attr("ask-for-uncertainty-range"), type: "Boolean", prettyName: "Ask for an uncertainty range" },
	            uncertaintyRangeWidth: {
	                accessor: EAT.WidgetDefinition.Attr("uncertainty-range-width"),
	                prettyName: "Width of Uncertainty Range",
	                helpText: "The uncertainty range width determines the upper and lower bounds of the uncertainty range slider. Say the user enters 5 and you have set the uncertainty range width to 2: then the lower bound of the slider will be 5-2=3, and the upper bound will be 5+2=7."
	            },
	            uncertaintyRangeLabel: {
	                accessor: EAT.WidgetDefinition.ChildNode("uncertainty-range-label"),
	                prettyName: "Label for Uncertainty Range",
	                type: "Text",
	                visibility: "askForUncertaintyRange"
	            },
	            min: {
	                accessor: EAT.WidgetDefinition.Attr("min"),
	                prettyName: "Min Value Allowed",
	                helpText: "Smallest value allowed. If blank, no min."
	            },
	            max: {
	                accessor: EAT.WidgetDefinition.Attr("max"),
	                prettyName: "Max Value Allowed",
	                helpText: "Largest value allowed. If blank, no max."
	            },
	            unitSuffix: { accessor: EAT.WidgetDefinition.Attr("unit-suffix"), prettyName: "Units", helpText: "Units for the number, e.g. the 'kg' in 50kg" },
	            unitPrefix: { accessor: EAT.WidgetDefinition.Attr("unit-prefix"), prettyName: "Prefix for Units", helpText: "Prefix to the number, e.g. the '$' in $50m" },
	            validation: { accessor: EAT.WidgetDefinition.Attr("validation"), category: "Validation" },
	            validationMessage: { accessor: EAT.WidgetDefinition.Attr("validationMessage"), prettyName: "Validation Message", category: "Validation" }
	        },
	        setupDOM: function setupDOM() {
	            if (this.get('definition.askForUncertaintyRange')) {
	                var slider = this.$().find("#jquery-slider");

	                var data = this.get('data');
	                var valChanged = function valChanged() {
	                    var value = data.get('text-value');

	                    var lower = slider.slider('values', 0);
	                    if (lower > value) {
	                        lower = value;
	                        slider.slider('values', 0, lower);
	                    }
	                    data.set('uncertaintyRangeLower', lower);

	                    var upper = slider.slider('values', 1);
	                    if (upper < value) {
	                        upper = value;
	                        slider.slider('values', 1, upper);
	                    }
	                    data.set('uncertaintyRangeUpper', upper);
	                };

	                slider.slider({
	                    change: valChanged,
	                    slide: valChanged,
	                    min: 0.0,
	                    max: 1.0,
	                    range: true,
	                    step: 0.01,
	                    values: [0.25, 0.75]
	                });
	                this.set('slider', slider);
	            }
	        },
	        reactToTextChanging: function () {
	            var text = this.get('data.text');
	            var slider = this.get('slider');

	            var value = parseFloat(text);
	            if (isNaN(value) || value === Infinity) return;

	            var definedMin = parseFloat(this.get('definition.min'));
	            var definedMax = parseFloat(this.get('definition.max'));

	            if (!(Ember.isNone(text) || Ember.isNone(slider) || isNaN(value))) {
	                this.$().find(".uncertainty-range").addClass('ready');

	                this.set('data.text-value', value);

	                var offset = parseFloat(this.get('definition.uncertaintyRangeWidth') || 1.0);
	                var min = value - offset;
	                var max = value + offset;

	                // Clamp to our definition's min and max
	                if (!isNaN(definedMin)) min = Math.max(definedMin, min);
	                if (!isNaN(definedMax)) max = Math.min(definedMax, max);

	                this.set('uncertaintyRangeMin', min);
	                this.set('uncertaintyRangeMax', max);

	                slider.slider('option', 'min', min);
	                slider.slider('option', 'max', max);

	                slider.slider('values', 0, value - offset / 2);
	                slider.slider('values', 1, value + offset / 2);
	            }
	        }.observes('data.text', 'definition.uncertaintyRangeWidth'),
	        rerenderIfAskForUncertaintyRangeChanges: function () {
	            this.rerender();
	        }.observes('definition.askForUncertaintyRange'),
	        validate: function validate(text) {
	            var validation = this.get('definition.validation');
	            if (validation) {
	                if (!ElicitationUtils.evalInScope(validation, { answer: text })) {
	                    return "Answer must be a" + this.get('definition.validationMessage');
	                }
	            }
	            return;
	        },
	        serializeData: function serializeData(data, errors) {
	            var response = this.get('data.text');

	            if (!response) {
	                errors.pushObject("A text box is still blank");
	            } else {
	                var validationError = this.validate(response);
	                if (validationError) {
	                    errors.pushObject(validationError);
	                }
	            }

	            data.set('value', response);
	            if (this.get('definition.askForUncertaintyRange')) {
	                data.set('uncertaintyRangeLower', this.get('data.uncertaintyRangeLower'));
	                data.set('uncertaintyRangeUpper', this.get('data.uncertaintyRangeUpper'));
	            }
	        }
	    });
	})(EAT, Ember, ElicitationUtils);

/***/ },
/* 62 */
/***/ function(module, exports) {

	(function (EAT, Ember, G_vmlCanvasManager) {
	    "use strict";

	    var DEBUG_TIME_TREND = false;
	    var TIME_TREND_UNDEFINED_POINT_OFFSET = -15;

	    /*
	    
	    perExpertData[].expertID
	    perExpertData[].data.Expected[]
	    perExpertData[].data.Min[]
	    perExpertData[].data.Max[]
	    
	    perExpertData[].data.Expected[].x
	    perExpertData[].data.Expected[].y
	    
	    */

	    EAT.WidgetResultsViews.TimeTrend = EAT.WidgetResultsView.extend({
	        templateName: "time-trend-results",
	        classNames: ["widget-results", "time-trend"],
	        content: undefined, // An EAT.WidgetResultsData
	        googleAvailable: false,
	        dataTableAndFriends: function () {
	            var dataTable = new google.visualization.DataTable();
	            dataTable.addColumn({ type: 'number', label: 'Year', pattern: "####" });

	            var columnsToFormat = new Ember.Set();

	            /* SETUP THE ROWS */
	            var xValueToRowNum = {};

	            var allXValues = this.get('allX').toArray().sort();
	            dataTable.addRows(allXValues.get('length'));

	            allXValues.forEach(function (x, i) {
	                dataTable.setCell(i, 0, x /*new Date('1/1/' + x.toString())*/, null);
	                xValueToRowNum[x] = i;
	            });

	            var colNumsToFormat = [];

	            var seriesNameToColumnNums = {};
	            var expertIDToColumnNums = {};
	            var columnNumToExpertID = {};
	            var seriesNames = new Ember.Set();
	            var expertIDs = new Ember.Set();

	            /* SETUP THE COLUMNS */
	            this.get('perExpertData').forEach(function (perExpertData) {
	                var expertID = perExpertData.expertID;
	                var data = perExpertData.data;

	                for (var seriesName in data) {
	                    if (seriesName != 'metadata' && data.hasOwnProperty(seriesName)) {
	                        // First we add a column for this expert<->seriesName pair
	                        var minOrMaxSeries = false; // FIXME: to implement
	                        var role = minOrMaxSeries ? 'interval' : 'data'; // If its a min/max series, it should be an interval role

	                        var colNum = dataTable.addColumn({
	                            type: 'number',
	                            label: seriesName /*+ " - Expert " + expertID*/
	                            , role: role,
	                            pattern: '@@##'
	                        });
	                        colNumsToFormat.push(colNum);

	                        // Add it to the seriesNameToColumnNums tracker...
	                        if (Ember.isNone(seriesNameToColumnNums[seriesName])) {
	                            seriesNameToColumnNums[seriesName] = [];
	                        }
	                        seriesNameToColumnNums[seriesName].push(colNum);
	                        seriesNames.add(seriesName);

	                        // Add it to the expertIDToColumnNums tracker...
	                        if (Ember.isNone(expertIDToColumnNums[expertID])) {
	                            expertIDToColumnNums[expertID] = [];
	                        }
	                        expertIDToColumnNums[expertID].push(colNum);
	                        expertIDs.add(expertID);

	                        columnNumToExpertID[colNum] = expertID;

	                        // Now we set the data for the column...
	                        var seriesPoints = data[seriesName];
	                        seriesPoints.forEach(function (seriesPoint) {
	                            var rowNum = xValueToRowNum[seriesPoint.x];
	                            if (!Ember.isNone(rowNum)) {
	                                dataTable.setCell(rowNum, colNum, seriesPoint.y, null);
	                            }
	                        });
	                    }
	                }
	            });

	            // Reformat numbers in the tooltip, we do this down here because it gets
	            // messed up if we add data later...
	            var formatter = new google.visualization.NumberFormat({
	                pattern: '##.##'
	            });
	            colNumsToFormat.forEach(function (colNum) {
	                formatter.format(dataTable, colNum);
	            });

	            return {
	                dataTable: dataTable,
	                seriesNameToColumnNums: seriesNameToColumnNums,
	                expertIDToColumnNums: expertIDToColumnNums,
	                columnNumToExpertID: columnNumToExpertID,
	                seriesNames: seriesNames,
	                expertIDs: expertIDs
	            };
	        }.property('allX', 'perExpertData'),
	        didInsertElement: function didInsertElement() {
	            this._super();

	            var chartDiv = this.$("div.google-chart-holder");
	            var self = this;

	            google.load("visualization", "1", {
	                packages: ["corechart"],
	                callback: function callback() {

	                    var chart = new google.visualization.LineChart(chartDiv.get(0));

	                    var options = {
	                        pointSize: 5,
	                        focusTarget: 'datum',
	                        backgroundColor: '#707580',
	                        titlePosition: 'none',
	                        vAxis: {
	                            viewWindowMode: 'pretty',
	                            textStyle: { color: 'white' },
	                            gridlines: { color: '#888' },
	                            baselineColor: '#707580'
	                        },
	                        tooltip: { trigger: 'selection' },
	                        hAxis: {
	                            format: '####',
	                            viewWindowMode: 'pretty',
	                            textStyle: { color: 'white' },
	                            gridlines: { color: '#888' },
	                            baselineColor: '#707580'
	                        },
	                        theme: 'maximized'
	                    };

	                    var dataTableAndFriends = self.get('dataTableAndFriends');

	                    // Now assign each series to a color...
	                    var seriesColors = ['#19b5eb', 'rgb(217,76,116)', 'rgb(123,105,209)', 'rgb(235,136,35)', 'rgb(76,166,73)', 'rgb(64,133,198)', 'rgb(228,81,39)', 'rgb(90,86,196)', 'rgb(168,206,56)', 'rgb(255,205,5)', 'rgb(16,147,128)', 'rgb(154,61,168)'];
	                    var seriesOptions = {};
	                    dataTableAndFriends.seriesNames.forEach(function (seriesName) {
	                        var seriesColor = seriesColors.shift(); // snag a color for this series...

	                        var firstInSeries = true;

	                        // Assign it to all relevant columns
	                        dataTableAndFriends.seriesNameToColumnNums[seriesName].forEach(function (dataTableColumnNum) {
	                            var seriesNum = dataTableColumnNum - 1; // The first column is a label...
	                            var seriesOption = { color: seriesColor, visibleInLegend: false };
	                            if (firstInSeries) {
	                                seriesOption['visibleInLegend'] = true;
	                                firstInSeries = false;
	                            }
	                            seriesOptions[seriesNum] = seriesOption;
	                        });
	                    });

	                    options['series'] = seriesOptions;

	                    chart.draw(dataTableAndFriends.dataTable, options);
	                    debug.googleChart = chart;
	                    debug.googleChartDataTable = dataTableAndFriends.dataTable;
	                    self.set('googleAvailable', true);

	                    // When we hover over a point, select ALL that expert's points!
	                    google.visualization.events.addListener(chart, 'onmouseover', function (hoverOver) {
	                        if (hoverOver.column != null) {
	                            var columnNum = hoverOver.column;
	                            var expertID = dataTableAndFriends.columnNumToExpertID[columnNum];

	                            var expertColumns = dataTableAndFriends.expertIDToColumnNums[expertID];
	                            var selection = expertColumns.map(function (columnNum) {
	                                return { column: columnNum };
	                            });
	                            chart.setSelection(selection);
	                        }
	                    });
	                }
	            });
	        },
	        expertIDs: function () {
	            var perExpertData = this.get('content.perExpertData');
	            return perExpertData.mapProperty('expertID').map(function (e) {
	                return e.toString();
	            });
	        }.property('content.perExpertData'),
	        data: function () {
	            var perExpertData = this.get('content.perExpertData');

	            debug.perExpertData = perExpertData;

	            return perExpertData.mapProperty('data');
	        }.property('content.perExpertData'),
	        seriesNames: function () {
	            var data = this.get('data');
	            var seriesNames = Ember.Set.create();
	            data.forEach(function (expertData) {
	                for (var key in expertData) {
	                    if (expertData.hasOwnProperty(key)) {
	                        seriesNames.add(key);
	                    }
	                }
	            });
	            seriesNames.remove('metadata');
	            return seriesNames.toArray();
	        }.property('data'),
	        series: function () {
	            var data = this.get('data');
	            var seriesNames = this.get('seriesNames');

	            var notNull = function notNull(point) {
	                return !Ember.isNone(point);
	            };

	            var series = {};
	            seriesNames.forEach(function (seriesName) {
	                series[seriesName] = data.mapProperty(seriesName).filter(notNull);
	            });

	            return series;
	        }.property('data', 'seriesNames'),
	        allPoints: function () {
	            var series = this.get('series');
	            var seriesNames = this.get('seriesNames');

	            var allPoints = [];

	            var addSeriesToAllPoints = function addSeriesToAllPoints(series) {
	                series.forEach(function (p) {
	                    allPoints.push(p);
	                });
	            };

	            seriesNames.forEach(function (seriesName) {
	                series[seriesName].forEach(addSeriesToAllPoints);
	            });

	            // FIXME: HARDCODED-SERIES
	            // series.Expected.forEach(addSeriesToAllPoints);
	            // series.Max.forEach(addSeriesToAllPoints);
	            // series.Min.forEach(addSeriesToAllPoints);

	            return allPoints;
	        }.property('series'),
	        allX: function () {
	            return new Ember.Set(this.get('allPoints').mapProperty('x'));
	        }.property('allPoints'),
	        allY: function () {
	            return new Ember.Set(this.get('allPoints').mapProperty('y'));
	        }.property('allPoints'),
	        minX: function () {
	            return Math.min.apply(Math, this.get('allX'));
	        }.property('allX'),
	        maxX: function () {
	            return Math.max.apply(Math, this.get('allX'));
	        }.property('allX'),
	        minY: function () {
	            return Math.min.apply(Math, this.get('allY'));
	        }.property('allY'),
	        maxY: function () {
	            return Math.max.apply(Math, this.get('allY'));
	        }.property('allY')
	    });

	    EAT.TimeTrendPointView = Ember.View.extend({
	        didInsertElement: function didInsertElement() {
	            var widget = this;
	            function b(f) {
	                return function () {
	                    f.apply(widget, arguments);
	                };
	            }

	            if (!this.get('point.fixedValue')) {
	                this.$().draggable({
	                    axis: "y",
	                    start: function start() {
	                        widget.set('frame.pointBeingDragged', widget);
	                    },
	                    stop: function stop(evt, ui) {
	                        widget.updateModelFromCSS(evt, ui);widget.set('frame.pointBeingDragged', null);
	                    },
	                    drag: b(this.updateModelFromCSS)
	                });
	                // boxPlot.find("#median").draggable({ axis: "x", containment: box, stop: b(this.updateModelValuesFromPixelPositions) });
	            }
	            this.colorChanged();
	        },
	        colorChanged: function () {
	            this.$(".dot").css('background-color', this.get('point.color'));
	        }.observes('point.color'),
	        updateModelFromCSS: function updateModelFromCSS(evt, ui) {
	            var frame = this.get('frame');
	            var point = this.get('point');
	            point.setProperties({
	                //year: frame.fromPixelX(ui.position.left),
	                value: frame.fromPixelY(ui.position.top)
	            });

	            // FIXME: BAD!!! bad bad bad cross band signalling, but works around the lack of proper
	            // recursive notifications in EmberJS (hopefully a bug that will be fixed soon... damnit?)
	            //window.setTimeout(function () {
	            frame.notifyPropertyChange('pointsChanged');
	        },
	        classNames: ["point"],
	        classNameBindings: ["point.fixedValue", "point.isNextUndefinedPoint", "point.isUndefined", "point.draggingOutOfBounds"],
	        templateName: "time-trend-point",
	        attributeBindings: ["style"],
	        style: function () {
	            var frame = this.get('frame');

	            if (Ember.isNone(frame)) return;

	            window.debugFrame = frame;
	            var x = parseFloat(this.get('point.x'));
	            var y = parseFloat(this.get('point.y'));

	            var top = TIME_TREND_UNDEFINED_POINT_OFFSET;
	            var left;

	            if (!isNaN(y)) {
	                top = frame.toPixelY(y);
	            }

	            left = frame.toPixelX(x);
	            var style = "top: " + top + "px; left: " + left + "px";

	            return style;
	        }.property('point.x', 'point.y', 'frame.coordsChanged')
	    });

	    EAT.TimeTrendSeriesView = Ember.View.extend({
	        classNameBindings: [":series", "series.isVisible", "series.isCurrentSeries", "series.complete"],
	        attributeBindings: ["title"],
	        titleBinding: "series.name"
	    });

	    var SeriesModel = EAT.WidgetDefinition.extend({
	        onInit: function () {
	            this.set('points', Ember.A(this.get('points')));
	        }.on('init'),
	        color: "#19b4eb",
	        name: undefined,
	        startingPoint: undefined, // a point "not in the series" that determines where drawing starts
	        points: undefined,
	        reversePoints: function () {
	            return this.get('points').copy().reverse();
	        }.property('points'),
	        virtualSeries: false,
	        isVisible: function () {
	            return this.get('isComplete') || this.get('isCurrentSeries');
	        }.property('isComplete', 'isCurrentSeries'),
	        isComplete: function () {
	            return Ember.isNone(this.get('nextUndefinedPoint'));
	        }.property('points.@each.isUndefined'),
	        nextUndefinedPoint: function () {
	            return this.get('points').findProperty('isUndefined');
	        }.property('points.@each.isUndefined'),

	        /* frame should /only/ be used for isCurrentSeries */
	        frame: undefined,
	        isCurrentSeries: function () {
	            return this.get('frame.currentSeries') == this;
	        }.property('frame.currentSeries'),
	        labelStyle: function () {
	            return "color: " + this.get('color');
	        }.property('color'),
	        fillBetweenRelativePoints: false
	    });

	    var PointModelKeyProperties = ['year', 'label', 'value', 'fixedValue', 'series'];
	    var PointModel = EAT.WidgetDefinition.extend(Ember.Copyable, {
	        copy: function copy() {
	            return PointModel.create(this.getProperties(PointModelKeyProperties));
	        },
	        label: "",
	        x: function () {
	            return parseFloat(this.get('year'));
	        }.property('year'),
	        y: function () {
	            return parseFloat(this.get('value'));
	        }.property('value'),
	        year: 2012,
	        value: 1.0,
	        fixedValue: false,
	        isAdjustable: function () {
	            return !this.get('fixedValue');
	        }.property('fixedValue'),
	        series: undefined,
	        isNextUndefinedPoint: function () {
	            return this == this.get('series.nextUndefinedPoint');
	        }.property('series', 'series.nextUndefinedPoint'),
	        isUndefined: function () {
	            return isNaN(parseFloat(this.get('year'))) || isNaN(parseFloat(this.get('value')));
	        }.property('year', 'value'),
	        draggingOutOfBounds: false,
	        color: function () {
	            if (this.get('isAdjustable')) {
	                return this.get('series.color');
	            } else {
	                return "rgb(128,128,128)";
	            }
	        }.property('series.color', 'isAdjustable')
	    });

	    var RelativePointModel = PointModel.extend({
	        relativeTo: undefined, // another PointModel
	        relativeValueMin: undefined,
	        relativeValueMax: undefined,
	        relativeValue: undefined,
	        yearBinding: 'relativeTo.year',
	        value: function (key, val) {
	            var relativeToValue = this.get('relativeTo.y');

	            if (arguments.length > 1) {
	                var relativeValue = parseFloat(val) - relativeToValue;

	                var outOfBounds = false;
	                var relativeValueMin = this.get('relativeValueMin');
	                if (!Ember.isNone(relativeValueMin) && relativeValue < relativeValueMin) {
	                    relativeValue = relativeValueMin;
	                    outOfBounds = true;
	                }

	                var relativeValueMax = this.get('relativeValueMax');
	                if (!Ember.isNone(relativeValueMax) && relativeValue > relativeValueMax) {
	                    relativeValue = relativeValueMax;
	                    outOfBounds = true;
	                }

	                this.set('draggingOutOfBounds', outOfBounds);
	                this.set('relativeValue', relativeValue);
	            }

	            return relativeToValue + this.get('relativeValue');
	        }.property('relativeValue', 'relativeTo', 'relativeTo.value')
	    });

	    function createMinAndMaxSeries(points, frame, labelPrefix) {
	        var adjustablePoints = points.filter(function (point) {
	            return !point.fixedValue;
	        });

	        var startingPoint = undefined;
	        if (adjustablePoints.length > 0) {
	            startingPoint = points[points.indexOf(adjustablePoints[0]) - 1];
	            if (Ember.isNone(startingPoint)) {
	                startingPoint = points[0];
	            }
	        }

	        var maxSeries = SeriesModel.create({
	            name: labelPrefix + "Max",
	            title: "The maximuum value you can imagine",
	            virtualSeries: true,
	            frame: frame,
	            color: '#ebb419',
	            startingPoint: startingPoint,
	            fillBetweenRelativePoints: true
	        });
	        maxSeries.set('points', adjustablePoints.map(function (point) {
	            return RelativePointModel.create({
	                relativeTo: point,
	                relativeValueMin: 0,
	                series: maxSeries
	            });
	        }));

	        var minSeries = SeriesModel.create({
	            name: labelPrefix + "Min",
	            title: "The minimuum value you can imagine",
	            virtualSeries: true,
	            frame: frame,
	            color: '#19ebb4',
	            startingPoint: startingPoint,
	            fillBetweenRelativePoints: true
	        });
	        minSeries.set('points', adjustablePoints.map(function (point) {
	            return RelativePointModel.create({
	                relativeTo: point,
	                relativeValueMax: 0,
	                series: minSeries
	            });
	        }));

	        window.debugMax = maxSeries;
	        window.debugPoints = points;

	        return {
	            min: minSeries,
	            max: maxSeries
	        };
	    }

	    var TimeTrendFrameModel = Ember.Object.extend({
	        renderingUsingExCanvas: false,
	        widget: undefined,
	        definitionBinding: 'widget.definition',
	        pointBeingDragged: null,
	        aPointIsBeingDragged: function () {
	            return !Ember.isNone(this.get('pointBeingDragged'));
	        }.property('pointBeingDragged'),
	        pointBeingDraggedYStatus: function () {
	            var point = this.get('pointBeingDragged');
	            if (Ember.isNone(point)) return "";

	            var y = point.get('point.y');
	            var range = this.get('modelRangeY');

	            // FIXME: set the number of decimal points based on modelRangeY

	            return parseFloat(y).toFixed(2);
	        }.property('modelRangeY', 'pointBeingDragged.point.y'),
	        theFrameIsBeingScaled: false,
	        series: function () {
	            var allSeries = Ember.A([]);
	            var frame = this;

	            var expectedSeries = SeriesModel.create({
	                name: this.get('definition.seriesLabel'),
	                title: "The value you expect",
	                frame: frame
	            });

	            var points = this.get('definition.points').map(function (existingPoint) {
	                return Ember.copy(existingPoint).set('series', expectedSeries);
	            });

	            expectedSeries.set('points', points);
	            allSeries.push(expectedSeries);

	            if (this.get('definition.requestRange')) {
	                var minMaxSeries = createMinAndMaxSeries(points, frame, "");
	                allSeries.push(minMaxSeries.max);
	                allSeries.push(minMaxSeries.min);
	            }

	            // Add in the extra series
	            var colors = ['#ebb419', '#98ef05', '#f00098', '#2349F0', '#39F034'];
	            this.get('definition.series').forEach(function (series) {
	                var label = series.get('label');

	                var model = SeriesModel.create({
	                    name: label,
	                    title: "",
	                    frame: frame,
	                    color: colors.pop()
	                });

	                var points = series.get('points').map(function (existingPoint) {
	                    return Ember.copy(existingPoint).set('series', model);
	                });

	                model.set('points', points);
	                allSeries.push(model);

	                if (series.get('requestRange')) {
	                    var minMaxSeries = createMinAndMaxSeries(points, frame, label + " ");
	                    allSeries.push(minMaxSeries.max);
	                    allSeries.push(minMaxSeries.min);
	                }
	            });

	            return allSeries;
	        }.property('definition.seriesLabel', 'definition.points', 'definition.requestRange', 'definition.pointsChanged', 'definition.series.@each', 'definition.series.@each.pointsChanged', 'definition.series.@each.requestRange', 'definition.series.@each.label'),
	        currentSeries: function () {
	            return this.get('series').find(function (series) {
	                return !series.get('isComplete');
	            });
	        }.property('series.@each.isComplete'),
	        dom: undefined,
	        frameDOM: function () {
	            return this.get('dom').find(".frame");
	        }.property('dom'),

	        axisCanvas: function () {
	            // we don't do canvas#axis because of a quirk with IE8 selectors and
	            // non-valid elements (it doesn't know what a canvas is... yet)
	            return this.get('frameDOM').find("canvas").filter("#axis")[0];
	        }.property('frameDOM').volatile(),
	        linesCanvas: function () {
	            // we don't do canvas#axis because of a quirk with IE8 selectors and
	            // non-valid elements (it doesn't know what a canvas is... yet)
	            return this.get('frameDOM').find("canvas").filter("#lines")[0];
	        }.property('frameDOM').volatile(),
	        minPixelX: 20,
	        maxPixelX: undefined,
	        minPixelY: 2,
	        maxPixelY: undefined,

	        minModelX: 2000,
	        maxModelX: 2030,
	        minModelY: 0.0,
	        maxModelY: 1.2,

	        modelRangeHasBeenSet: false,

	        /* Axis Scaling Code Here */
	        setModelRange: function setModelRange(toRange) {
	            var valueAxisMinUpperRange = parseFloat(this.get('definition.valueAxisMinUpperRange'));
	            if (!isNaN(valueAxisMinUpperRange)) {
	                toRange.maxModelY = Math.max(valueAxisMinUpperRange, toRange.maxModelY);
	            }

	            var valueAxisMaxLowerRange = parseFloat(this.get('definition.valueAxisMaxLowerRange'));
	            if (!isNaN(valueAxisMaxLowerRange)) {
	                toRange.minModelY = Math.min(valueAxisMaxLowerRange, toRange.minModelY);
	            }

	            var frame = this;

	            // Don't animate changes if we're using the rather slow exCanvas fallback for IE7 and IE8
	            var animateChange = this.get('modelRangeHasBeenSet') && !this.get('renderingUsingExCanvas');
	            this.set('modelRangeHasBeenSet', true);

	            if (animateChange) {
	                this.set('theFrameIsBeingScaled', true);

	                var fromRange = this.getProperties('minModelX', 'maxModelX', 'minModelY', 'maxModelY');
	                $(fromRange).animate(toRange, {
	                    duration: 1000,
	                    step: function step() {
	                        frame.setProperties(this);
	                        frame.notifyPropertyChange('coordsChanged');
	                    },
	                    complete: function complete() {
	                        frame.set('theFrameIsBeingScaled', false);
	                        frame.setProperties(this);
	                        frame.notifyPropertyChange('coordsChanged');
	                    }
	                });
	            } else {
	                frame.setProperties(toRange);
	                frame.notifyPropertyChange('coordsChanged');
	            }
	        },
	        extremePointsChanged: function () {
	            // Don't scale while dragging points
	            if (this.get('aPointIsBeingDragged')) return;

	            if (this.get('allPoints.length') < 1) {
	                this.setModelRange({
	                    minModelX: 0,
	                    maxModelX: 10,
	                    minModelY: 0,
	                    maxModelY: 1
	                });
	                return;
	            }

	            var minPointX = this.get('minPointX');
	            var maxPointX = this.get('maxPointX');
	            var minPointY = this.get('minPointY');
	            var maxPointY = this.get('maxPointY');

	            if (isNaN(minPointX)) minPointX = 0;
	            if (isNaN(maxPointX)) maxPointX = 10;
	            if (isNaN(minPointY)) minPointY = 0;
	            if (isNaN(maxPointY)) maxPointY = 1;

	            var rangeX = maxPointX - minPointX;
	            var rangeY = maxPointY - minPointY;

	            var offsetX = rangeX * 0.1;
	            var offsetY = rangeY * 0.2;

	            if (minPointX === maxPointX) {
	                offsetX = 4;
	            }

	            if (minPointY === maxPointY) {
	                offsetY = 4;
	            }

	            this.setModelRange({
	                minModelX: minPointX - offsetX,
	                maxModelX: maxPointX + offsetX,
	                minModelY: minPointY - offsetY,
	                maxModelY: maxPointY + offsetY * 2
	            });
	        }.observes('minPointX', 'maxPointX', 'minPointY', 'maxPointY', 'aPointIsBeingDragged', 'definition.timeAxisLogBase', 'definition.valueAxisLogBase').on('init'),
	        allPoints: function () {
	            var points = this.get('series').reduce(function (list, series) {
	                return list.concat(series.get('points'));
	            }, []);

	            // Wrap in an Ember.Array so allPoints.@each observers work
	            return Ember.A(points);
	        }.property('pointsChanged', 'series'),
	        mostExtremePoint: function mostExtremePoint(comparison) {
	            var mostExtreme = undefined;
	            this.get('allPoints').forEach(function (item) {
	                if (mostExtreme == undefined || comparison(item, mostExtreme)) {
	                    mostExtreme = item;
	                }
	            });
	            return mostExtreme;
	        },
	        minPointX: function () {
	            return this.mostExtremePoint(function (one, two) {
	                return one.get('x') < two.get('x');
	            }).get('x');
	        }.property('allPoints', 'allPoints.@each.x'),
	        minPointY: function () {
	            return this.mostExtremePoint(function (one, two) {
	                return one.get('y') < two.get('y');
	            }).get('y');
	        }.property('allPoints', 'allPoints.@each.y'),
	        maxPointX: function () {
	            return this.mostExtremePoint(function (one, two) {
	                return one.get('x') > two.get('x');
	            }).get('x');
	        }.property('allPoints', 'allPoints.@each.x'),
	        maxPointY: function () {
	            return this.mostExtremePoint(function (one, two) {
	                return one.get('y') > two.get('y');
	            }).get('y');
	        }.property('allPoints', 'allPoints.@each.y'),

	        pixelRangeX: function () {
	            return this.get('maxPixelX') - this.get('minPixelX');
	        }.property('minPixelX', 'maxPixelX'),
	        pixelRangeY: function () {
	            return this.get('minPixelY') - this.get('maxPixelY');
	        }.property('minPixelY', 'maxPixelY'),

	        modelRangeX: function () {
	            return this.get('maxModelX') - this.get('minModelX');
	        }.property('minModelX', 'maxModelX'),
	        modelRangeY: function () {
	            return this.get('maxModelY') - this.get('minModelY');
	        }.property('minModelY', 'maxModelY'),

	        // We use a notify on these to observe changes in one gulp
	        // this is a bad hack, but it works around the lack of properly functioning recursive observes
	        // in EmberJS 0.9.8.1
	        coordsChanged: undefined,
	        pointsChanged: undefined,

	        scale: function scale(x, logBase) {
	            // adjust model value by log scale, if relevant on this axis
	            if (logBase > 1) {
	                var sign = x >= 0 ? 1 : -1;
	                return sign * Math.log(Math.abs(x)) / Math.log(logBase);
	            } else {
	                return x;
	            }
	        },

	        fromPixel: function fromPixel(pixelVal, pixelOffset, pixelRange, minModel, maxModel, logBase) {
	            var pixelPercent = (pixelVal - pixelOffset) / pixelRange;
	            var scaledMinModel = this.scale(minModel, logBase);
	            var scaledRange = this.scale(maxModel, logBase) - scaledMinModel;
	            var unscaledResult = pixelPercent * scaledRange + scaledMinModel;
	            if (logBase > 1) {
	                return Math.pow(logBase, unscaledResult);
	            } else {
	                return unscaledResult;
	            }
	        },

	        fromPixelX: function fromPixelX(pixelX) {
	            return this.fromPixel(pixelX, this.get('minPixelX'), this.get('pixelRangeX'), this.get('minModelX'), this.get('maxModelX'), parseFloat(this.get('definition.timeAxisLogBase')));
	        },
	        fromPixelY: function fromPixelY(pixelY) {
	            return this.fromPixel(pixelY, this.get('maxPixelY'), this.get('pixelRangeY'), this.get('minModelY'), this.get('maxModelY'), parseFloat(this.get('definition.valueAxisLogBase')));
	        },
	        toPixel: function toPixel(modelVal, maxModel, minModel, pixelRange, offsetPixel, logBase) {
	            var modelRange = this.scale(maxModel, logBase) - this.scale(minModel, logBase);
	            var modelPercent = (this.scale(modelVal, logBase) - this.scale(minModel, logBase)) / modelRange;

	            return Math.round(modelPercent * pixelRange + offsetPixel);
	        },

	        toPixelX: function toPixelX(modelX) {
	            return this.toPixel(modelX, this.get('maxModelX'), this.get('minModelX'), this.get('pixelRangeX'), this.get('minPixelX'), parseFloat(this.get('definition.timeAxisLogBase')));
	        },
	        toPixelY: function toPixelY(modelY) {
	            return this.toPixel(modelY, this.get('maxModelY'), this.get('minModelY'), this.get('pixelRangeY'), this.get('maxPixelY'), parseFloat(this.get('definition.valueAxisLogBase')));
	        }
	    });

	    var pointsDef = {
	        type: "HasMany",
	        prettyName: 'Point',
	        emphasizeWhenEmpty: true,
	        accessor: EAT.WidgetDefinition.HasMany('point', {
	            model: PointModel,
	            year: { accessor: EAT.WidgetDefinition.Attr("year"), prettyName: "Year (X)" },
	            value: { accessor: EAT.WidgetDefinition.Attr("value"), prettyName: "Default Value (Y)", helpText: "Leave blank to start with an undefined y-value (recommended)" },
	            fixedValue: {
	                accessor: EAT.WidgetDefinition.Attr("fixed-value"),
	                type: "Boolean",
	                prettyName: "Value isn't user adjustable",
	                helpText: "The point is fixed at authoring time and experts cannot move it, e.g. use for historical or reference points."
	            },
	            label: { accessor: EAT.WidgetDefinition.Attr("label"), prettyName: "Label the point", helpText: "Add an annotation to the point" }
	        })
	    };

	    EAT.Widget.register('time-trend', {
	        prettyName: "Time Trend",
	        templateName: 'time-trend',
	        widgetResults: EAT.WidgetResultsViews.TimeTrend,
	        dataModel: EAT.WidgetData.extend({}),
	        definitionSchema: {
	            model: EAT.WidgetDefinition.extend({
	                pointsChanged: undefined, // used to signal when any aspect of a point changes, since we make a copy in frame.series
	                informWhenPointsChange: function () {
	                    this.notifyPropertyChange('pointsChanged');
	                }.observes('points.@each.year', 'points.@each.value', 'points.@each.fixedValue', 'points.@each.label'),
	                valueAxisLabel: "Weight in Kg",
	                seriesLabel: "Expected"
	            }),
	            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
	            requestRange: {
	                accessor: EAT.WidgetDefinition.Attr("request-range"),
	                prettyName: "Also request Min and Max series",
	                type: "Boolean"
	            },
	            valueAxisLabel: {
	                accessor: EAT.WidgetDefinition.Attr("value-axis-label"),
	                prettyName: "Value (Y) Axis Label",
	                type: "String"
	            },
	            timeAxisLabel: {
	                accessor: EAT.WidgetDefinition.Attr("time-axis-label"),
	                prettyName: "Time (X) Axis Label",
	                type: "String"
	            },
	            seriesLabel: {
	                accessor: EAT.WidgetDefinition.Attr("series-label"),
	                prettyName: "Series Label",
	                type: "String"
	            },
	            points: pointsDef,
	            valueAxisMinUpperRange: {
	                accessor: EAT.WidgetDefinition.Attr("value-axis-min-upper-range"),
	                prettyName: "Min Upper",
	                type: "String",
	                category: "Y-Axis Range"
	            },
	            valueAxisMaxLowerRange: {
	                accessor: EAT.WidgetDefinition.Attr("value-axis-max-lower-range"),
	                prettyName: "Max Lower",
	                type: "String",
	                category: "Y-Axis Range"
	            },
	            valueAxisLogBase: {
	                accessor: EAT.WidgetDefinition.Attr("value-axis-log-base"),
	                prettyName: "Y-Axis Log Base",
	                type: "String",
	                category: "Y-Axis Range"
	            },
	            timeAxisLogBase: {
	                accessor: EAT.WidgetDefinition.Attr("time-axis-log-base"),
	                prettyName: "X-Axis Log Base",
	                type: "String",
	                category: "Y-Axis Range"
	            },
	            series: {
	                type: "HasMany",
	                prettyName: 'Series',
	                accessor: EAT.WidgetDefinition.HasMany('series', {
	                    model: EAT.WidgetDefinition.extend({
	                        label: "A Series",
	                        pointsChanged: undefined, // used to signal when any aspect of a point changes, since we make a copy in frame.series
	                        informWhenPointsChange: function () {
	                            this.notifyPropertyChange('pointsChanged');
	                        }.observes('points.@each.year', 'points.@each.value', 'points.@each.fixedValue', 'points.@each.label')
	                    }),
	                    label: { accessor: EAT.WidgetDefinition.Attr("label"), prettyName: "Series Label" },
	                    points: pointsDef,
	                    requestRange: {
	                        accessor: EAT.WidgetDefinition.Attr("request-range"),
	                        prettyName: "Also request Min and Max series",
	                        type: "Boolean"
	                    }
	                })
	            }
	        },
	        initWidget: function initWidget() {
	            this._super();
	            var frame = TimeTrendFrameModel.create({ widget: this });
	            this.set('frame', frame);
	            this.set('data.frame', frame);
	        },
	        afterStateResume: function afterStateResume() {
	            this.get('frame').notifyPropertyChange("pointsChanged");
	        },
	        serializeData: function serializeData(data, errors) {
	            /* We serialize using the format:
	                 {
	              "SeriesName1": [
	                 { x: 5, y: 10 },
	                 { x: 7, y: 15 },
	                 ...
	              ],
	              "SeriesName2" : [
	                ...
	              ],
	              ...
	            }
	                 */

	            this.get('frame.series').forEach(function (series) {
	                var seriesName = ElicitationUtils.escapeForEmberProperty(series.get('name'));

	                if (!series.get('isComplete')) {
	                    errors.pushObject("Series '" + seriesName + "' has undragged points");
	                }

	                data.set(seriesName, series.get('points').filterProperty('isAdjustable').map(function (point) {
	                    return point.getProperties('x', 'y');
	                }));
	            });
	        },
	        redraw: function redraw() {
	            var frame = this.get('frame');
	            var frameDOM = frame.get('frameDOM');

	            var model = this.get('data');
	            var definition = this.get('definition');

	            // Draw in the axis on the canvas
	            var axis = frameDOM.find("canvas#axis");
	            var axisCanvas = axis.get(0);
	            var width = axisCanvas.width = axis.width() || frameDOM.width(); // we use the || to deal with cases (like IE7) where the DOM element is zero-sized
	            var height = axisCanvas.height = axis.height() || frameDOM.height();

	            var lines = frameDOM.find("canvas#lines");
	            var linesCanvas = lines.get(0);
	            linesCanvas.width = lines.width() || frameDOM.width();
	            linesCanvas.height = lines.height() || frameDOM.height();

	            frame.setProperties({
	                maxPixelX: width - 60,
	                maxPixelY: height - 20 // gives space for axis labels at the bottom
	            });

	            // We use this to inform clients that they should redraw
	            frame.notifyPropertyChange('coordsChanged');
	        },
	        frame: undefined,
	        setupDOM: function setupDOM() {
	            this.set('frame.dom', this.$());
	            this.set('haveSetupDOM', true);

	            // Need to initialze exCanvas, c.f. "IE Sux"
	            if (G_vmlCanvasManager != undefined) {
	                var frame = this.get('frame');

	                var axisCanvas = frame.get("axisCanvas");
	                var linesCanvas = frame.get("linesCanvas");

	                axisCanvas = ElicitationUtils.recreateCanvasElement(axisCanvas);
	                linesCanvas = ElicitationUtils.recreateCanvasElement(linesCanvas);

	                G_vmlCanvasManager.initElement(axisCanvas);
	                G_vmlCanvasManager.initElement(linesCanvas);
	                frame.set('renderingUsingExCanvas', true);
	            }

	            this.redraw();
	        },
	        drawConnectingLines: function () {
	            var CONNECTING_LINE_CANVAS_OFFSET = 30; // this canvas reaches into the undefined territory in order to capture lines

	            var frame = this.get('frame');
	            if (Ember.isNone(frame) || !this.get('haveSetupDOM')) return;

	            var canvas = frame.get("linesCanvas");
	            var ctx = canvas.getContext("2d");

	            var series = this.get('frame.series');

	            var minPixelX = frame.toPixelX(frame.minModelX);
	            var minPixelY = frame.toPixelY(frame.minModelY);
	            var maxPixelX = frame.toPixelX(frame.maxModelX);
	            var maxPixelY = frame.toPixelY(frame.maxModelY);

	            function getXFor(point) {
	                var x = parseFloat(point.get('x'));

	                if (isNaN(x)) {
	                    x = -15;
	                } else {
	                    x = frame.toPixelX(x);
	                }

	                return x;
	            }

	            function getYFor(point) {
	                var y = parseFloat(point.get('y'));

	                if (isNaN(y)) {
	                    y = TIME_TREND_UNDEFINED_POINT_OFFSET;
	                } else {
	                    y = frame.toPixelY(y);
	                }

	                return y;
	            }

	            ctx.save();{
	                ctx.clearRect(0, 0, canvas.width, canvas.height);

	                ctx.translate(0, CONNECTING_LINE_CANVAS_OFFSET);

	                series.forEach(function (series) {

	                    if (!series.get('isVisible')) return;

	                    ctx.beginPath();
	                    //ctx.moveTo(minPixelX, minPixelY);

	                    var lastX,
	                        lastY = undefined;
	                    var lastPointWasUndefined = false;

	                    var startingPoint = series.get('startingPoint');
	                    if (!Ember.isNone(startingPoint)) {
	                        lastX = getXFor(startingPoint);
	                        lastY = getYFor(startingPoint);
	                    }

	                    series.get('points').forEach(function (point) {
	                        var x = getXFor(point);
	                        var y = getYFor(point);

	                        var pointIsUndefined = point.get('isUndefined');
	                        if (lastX != undefined && lastY != undefined) {
	                            if (point.get('isAdjustable')) {
	                                ctx.strokeStyle = series.get('color');
	                                ctx.lineWidth = 3;
	                            } else {
	                                ctx.strokeStyle = "#333";
	                                ctx.lineWidth = 2;
	                            }

	                            ctx.beginPath();

	                            if (pointIsUndefined || lastPointWasUndefined) {
	                                dashedLine(ctx, lastX, lastY, x, y);
	                                ctx.lineWidth = 1;
	                            } else {
	                                ctx.moveTo(lastX, lastY);
	                                ctx.lineTo(x, y);
	                            }
	                            ctx.stroke();
	                        }
	                        lastX = x;
	                        lastY = y;
	                        lastPointWasUndefined = pointIsUndefined;
	                    });

	                    // Should we fill against another series?
	                    var otherSeries = series.get('fillBetweenRelativePoints');
	                    if (!Ember.isNone(otherSeries)) {
	                        if (!Ember.isNone(startingPoint)) {
	                            ctx.moveTo(getXFor(startingPoint), getYFor(startingPoint));
	                        }

	                        var points = series.get('points').filterProperty('isUndefined', false).filterProperty('relativeTo');

	                        // First add a line along the points in our series
	                        points.forEach(function (point) {
	                            ctx.lineTo(getXFor(point), getYFor(point));
	                        });

	                        // Now add a line (in reverse order) along the relativeTo points
	                        points.slice().reverse().mapProperty('relativeTo').forEach(function (point) {
	                            if (Ember.isNone(point)) return;
	                            ctx.lineTo(getXFor(point), getYFor(point));
	                        });

	                        ctx.fillStyle = "rgba(255,255,0,0.2)";
	                        ctx.fill();
	                    }
	                });
	            }ctx.restore();
	        }.observes('frame.coordsChanged', 'frame.pointsChanged'),
	        drawGrid: function drawGrid(ctx, min, max, minPixelY, maxPixelY, modelToPixelXFunc, textTransform) {
	            var GRID_COLOR = "rgb(200,200,200)";

	            ctx.save();{
	                ctx.lineWidth = 1;
	                ctx.strokeStyle = GRID_COLOR;

	                ctx.textAlign = "center";
	                ctx.textBaseline = "top";
	                ctx.font = "12pt Helvetica";

	                var range = max - min;
	                var scale = Math.round(log10(range));
	                var tickSize = Math.pow(10, scale);

	                var majorTickEvery = 1;

	                var minNumTicks = 9;
	                var maxNumMajorTicks = 15;

	                if (range / tickSize < minNumTicks) {
	                    tickSize /= 10;
	                    scale--;
	                }
	                if (range / tickSize < minNumTicks) {
	                    tickSize /= 2;
	                    scale--;
	                }

	                if (range / tickSize > maxNumMajorTicks) {
	                    majorTickEvery *= 2;
	                }

	                var majorTickSize = tickSize * majorTickEvery;
	                var start = Math.round(min / majorTickSize) * majorTickSize;

	                var numTicksSinceMajor = 0;
	                for (var modelX = start; modelX < max; modelX += tickSize) {
	                    var pixelX = modelToPixelXFunc(modelX);

	                    var majorTick = numTicksSinceMajor >= majorTickEvery;
	                    if (majorTick) numTicksSinceMajor = 0;
	                    numTicksSinceMajor++;

	                    // Don't draw ticks too close to the arrowheads
	                    //if (pixelX < 15 || pixelX > width - 15) continue;

	                    ctx.save();{
	                        var lengthOffset = 0;

	                        if (majorTick) {
	                            ctx.beginPath();
	                            ctx.moveTo(pixelX, minPixelY);
	                            ctx.lineTo(pixelX, maxPixelY);
	                            ctx.lineWidth = 1;
	                            ctx.stroke();

	                            ctx.save();{
	                                textTransform(ctx, pixelX, minPixelY);

	                                var tickLabel;
	                                if (scale < 1) {
	                                    tickLabel = modelX.toFixed(Math.abs(scale));
	                                } else {
	                                    tickLabel = modelX.toFixed();
	                                }
	                                ctx.fillText(tickLabel, 0, 5);
	                            }ctx.restore();
	                        } else {
	                            // option to draw minor ticks here
	                            /*
	                            ctx.beginPath();
	                            ctx.moveTo(0,0);
	                            ctx.lineTo(0,TICK_LENGTH - 2*lengthOffset);
	                            ctx.stroke();
	                            */
	                        }
	                    }ctx.restore();
	                }
	            }ctx.restore();
	        },
	        drawAxis: function () {
	            var frame = this.get('frame');
	            if (Ember.isNone(frame) || !this.get('haveSetupDOM')) return;

	            var canvas = frame.get("axisCanvas");
	            var ctx = canvas.getContext("2d");

	            ctx.clearRect(0, 0, canvas.width, canvas.height);

	            // Axis Draw Settings
	            var AXIS_COLOR = "black";
	            var TICK_LENGTH = 15;

	            var minPixelX = frame.toPixelX(frame.minModelX);
	            var minPixelY = frame.toPixelY(frame.minModelY);
	            var maxPixelX = frame.toPixelX(frame.maxModelX);
	            var maxPixelY = frame.toPixelY(frame.maxModelY);

	            function b(self, f) {
	                return function () {
	                    return f.apply(self, arguments);
	                };
	            }

	            var textTransform = function textTransform(ctx, pixelX, pixelY) {
	                ctx.translate(pixelX, pixelY);
	            };

	            // Draw the x grid and labels
	            this.drawGrid(ctx, frame.minModelX, frame.maxModelX, minPixelY, maxPixelY, b(frame, frame.toPixelX), textTransform);

	            // Draw the y grid and labels by rotating 90 degrees
	            ctx.save();{
	                ctx.translate(maxPixelX, 0);
	                ctx.rotate(Math.PI / 2.0);
	                var textTransform = function textTransform(ctx, pixelX, pixelY) {
	                    ctx.translate(pixelX, pixelY);
	                    ctx.rotate(-Math.PI / 2.0);
	                    ctx.translate(20, -15);
	                };
	                this.drawGrid(ctx, frame.minModelY, frame.maxModelY, 0, maxPixelX - minPixelX, b(frame, frame.toPixelY), textTransform);

	                // Draw a darker line at zero
	                ctx.beginPath();
	                var zero = frame.toPixelY(0);
	                ctx.moveTo(zero, 0);
	                ctx.lineTo(zero, maxPixelX - minPixelX);
	                ctx.lineWidth = 1;
	                ctx.strokeStyle = "rgb(64,64,64)";
	                ctx.stroke();
	            }ctx.restore();

	            ctx.save();{
	                ctx.strokeStyle = AXIS_COLOR;
	                ctx.lineCap = 'round';
	                ctx.lineWidth = 2;

	                ctx.beginPath();

	                ctx.moveTo(minPixelX, minPixelY);
	                ctx.lineTo(maxPixelX, minPixelY);
	                ctx.lineTo(maxPixelX, maxPixelY);
	                ctx.lineTo(minPixelX, maxPixelY);
	                ctx.closePath();

	                ctx.stroke();

	                var max = frame.maxModelX;
	                var min = frame.minModelX;
	            }ctx.restore();
	        }.observes('frame.coordsChanged')
	    });

	    function log10(val) {
	        return Math.log(val) / Math.log(10);
	    }

	    var dashedLine = function dashedLine(ctx, x, y, x2, y2, da) {
	        if (!da) da = [10, 5];
	        ctx.save();
	        var dx = x2 - x,
	            dy = y2 - y;
	        var len = Math.sqrt(dx * dx + dy * dy);
	        var rot = Math.atan2(dy, dx);
	        ctx.translate(x, y);
	        ctx.moveTo(0, 0);
	        ctx.rotate(rot);
	        var dc = da.length;
	        var di = 0,
	            draw = true;
	        x = 0;
	        while (len > x) {
	            x += da[di++ % dc];
	            if (x > len) x = len;
	            draw ? ctx.lineTo(x, 0) : ctx.moveTo(x, 0);
	            draw = !draw;
	        }
	        ctx.restore();
	    };
	})(EAT, Ember, window.G_vmlCanvasManager);

/***/ }
]);