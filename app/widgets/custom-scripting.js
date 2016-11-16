
(function (EAT, Ember) {
    "use strict";


    function bindRunEventHandler(eventName) {
        return function (page) {
            this.runEventHandler(eventName, page);
        }
    }

    function bindCustomScriptingAPI(elicitation) {
        function notYetImplemented() { throw "Not yet implemented! Yell at Seth if you need this now."; }
        function getWidget(widgetID) {
            return elicitation.get('widgets').findBy('dataKey', widgetID);
        }
        function getPage(pageNum) {
            return elicitation.get('pagesController.content')[pageNum];
        }

        var api = {
            getValueOfVariable: function (variableName) {
                return elicitation.get('variableScope')[variableName];
            },
            setCustomVariable: function (variableName, value) {
                var existingVariable = elicitation.get("variables").findBy("name", variableName);
                if (existingVariable && existingVariable.get("widget")) {
                    throw "Sorry, cannot override a variable defined by a widget, setCustomVariable() can only be used with new variable names";
                }
                
                elicitation.get('customScriptingVariables').pushObject(Ember.Object.create({
                    name: variableName,
                    value: value
                }));
            },
            setWidgetLabel: function (widgetID, label) {
                this.setWidgetProperty(widgetID, 'definition.label', label);
            },
            getWidgetLabel: function (widgetID) {
                return this.getWidgetProperty(widgetID, 'definition.label');
            },
            gotoPage: function (pageNumStartingAtPageOne) {
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
            getElicitedData: function () {
                return elicitation.getSerializedData();
            },
            getElicitatedDataFor: function (widgetID) {
                return elicitation.getSerializedDataFor(widgetID);
            },
            /* Supported, but not the property names... */
            setWidgetProperty: function (widgetID, propertyName, value, redrawAfterSetting) {
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
            getWidgetProperty: function (widgetID, propertyName) {
                return getWidget(widgetID).get(propertyName);
            },

            /* Helpful for learning to develop */
            findWidgetID: function (pageNum, widgetNum) {
                return getPage(pageNum).get('widgets').get(widgetNum).get('dataKey');
            },
            printWidgetProperties: function (widgetID, maxPropertyDepthToPrint) {
                var widget = getWidget(widgetID);
                var props = widget.stateGetPropertyNames(maxPropertyDepthToPrint, true);

                var header = "Some properties for widget with label " + widget.get('definition.label') + ":\n";
                var msg = "\n\nYou can use these properties with api.setWidgetProperty('" + widgetID + "', 'some.property.here', 'new value') as well as api.getWidgetProperty('" + widgetID + "', 'some.property.here'), but please note that widget properties may change over time, might disappear, and are NOT OFFICIALLY SUPPORTED.";
                console.log(header + props.join("\n") + msg);


                return props;
            },
            printAllWidgetIDs: function () {
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
        }

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
                    return ['beforeEnteringPage', 'beforeExitingPage']
                        .map(function (eventName) {
                            return {
                                name: eventName, 
                                handler: this.get(eventName), 
                            }
                        }.bind(this))
                        .filter(function (event) {
                            return event.handler.trim() != '';
                        });
                }.property('beforeEnteringPage', 'beforeExitingPage')
            }),
            label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text", prettyName: "Description of code" },
            beforeEnteringPage: { accessor: EAT.WidgetDefinition.ChildNode("beforeEnteringPage"), type: "Text", prettyName: "BeforeEnteringPage(api, unsupported) {", helpText: "The JavaScript in BeforeEnteringPage is executed before the page in which this widget resides is switched to. You can use the 'Preview' button to test your custom script in actual usage, or just click the test button to manually execute your script.\n\nYour code has access to an 'api' variable, which is an object with functions you can use for scripting the elicitation. You can explore this API by opening your javascript console and exploring customScripting.api . You can also directly access the raw elicitation to do anything you want by using unsupported.elicitation in your script, but in general this is not recommended." },
            beforeExitingPage: { accessor: EAT.WidgetDefinition.ChildNode("beforeExitingPage"), type: "Text", prettyName: "BeforeExitingPage(api, unsupported) {", helpText: "See help for BeforeEnteringPage for details on using the custom scripting feature" },
        },
        beforeEnteringPage: bindRunEventHandler("beforeEnteringPage"),
        beforeExitingPage: bindRunEventHandler("beforeExitingPage"),
        conditionallyHidden: function () {
            return true; // custom scripting stuff should never be visible to end-users...
        }.property(),
        serializeData: function (data, errors) { },
        init: function () {
            this._super();
            debug.customScriptingWidget = this;
            window.customScripting = {
                api: bindCustomScriptingAPI(this.get('elicitation')),
            }
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
        setupDOM: function () {
            if (this.get('elicitation.allowEditing')) {
                var widget = this;
            
                function createEditor(eventName) {
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
                }
            
                debug.widgie = this;
            
                Ember.run.later(this, function () {
                    this.editors.beforeEnteringPage = createEditor("beforeEnteringPage");
                    this.editors.beforeExitingPage = createEditor("beforeExitingPage");                
                }, 750);                
            }
        },        
        runEventHandler: function (eventName, page) {
            var handlerBody = this.get('definition').get(eventName);

            if (handlerBody.trim() == '') return;

            var elicitation = this.get('elicitation');

            var unsupported = {
                page: page,
                elicitation: elicitation
            }
            var api = bindCustomScriptingAPI(elicitation);
            window.customScripting.lastScriptRun = {
                name: eventName,
                runItAgain: function () { this.runEventHandler(eventName, page); },
                sourceCode: handlerBody,
                api: api,
                unsupported: unsupported,
                exception: null
            }

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
            testEventHandler: function (eventName) {
                this.runEventHandler(eventName, "noPageDefinedOops");
            }
        },
    });


})(EAT, Ember);
