(function (EAT, window, undefined) {
    "use strict";

    EAT.reopen({
        makeDataKeyFromText: function (title) {
            if (title) {
                return title.toLowerCase().replace(/ /g, "_").replace(/[^_a-z0-9]/g, "");
            } else {
                console.log("WARNING: blank data key text was specified");
                return null;
            }
        },
        Widgets: {},
        ready: function () {
            this.instantiateResultsViews();
            this.instantiateInlineViews();

            $("#page-load-throbber").remove();
            $.Placeholder.init();

            $("body").on("click", ".markdown a", function (evt) {
                console.log("Opening markdown link in new window");
                evt.preventDefault();
                window.open($(this).attr("href"));
            });
        },
        instantiateResultsViews: function () {
            $("script[type='text/x-elicitation-widget-results-data']").each(function () {
                var resultsDataString = $(this).html();
                try {
                    var resultsDataJSON = JSON.parse(resultsDataString);
                    var widgetType = Ember.String.classify(resultsDataJSON.widgetType);
                    // convert, e.g., card-rank to CardRank
                    console.log("Widget type is: " + widgetType);
                    var resultsViewClass = EAT.WidgetResultsViews[widgetType];
                    if (!Ember.isNone(resultsViewClass)) {
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
                        console.log("ERROR: couldn't find a ResultsView to display chart results of "
                            + widgetType + " widget");
                    }
                } catch (e) {
                    console.log("Error parsing JSON: " + e.toString());
                    debug.resultsDataString = resultsDataString;
                }
            });
        },
        instantiateInlineViews: function () {

        },
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
        serializeDefinition: function (doc) {
            var serialized = $(doc.createElement("page-footer"));
            serialized.text(this.get('label'));
            return serialized;
        },
        loadFromXML: function (pageFooterXML) {
            this.set('label', $(pageFooterXML).text());
        }
    });

    EAT.CustomWidgetsController = Ember.Object.extend({
        javascript: "",
        css: "",
        serializeDefinition: function (doc) {
            var customWidget = doc.createElement("custom-widget");
            var javascript = doc.createElement("javascript");
            var css = doc.createElement("css");
            $(javascript).text(this.get("javascript"));
            $(css).text(this.get("css"));
            customWidget.appendChild(javascript);
            customWidget.appendChild(css);
            return customWidget;
        },
        loadFromXML: function (customWidgetXMLs) {
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
        injectCSSAndJavascript: function () {

            try {
                // Run javascript
                window.eval(this.get('javascript'));

                // Update CSS
                $("style#custom-widget").remove();
                $("<style></style>")
                    .attr("id", "custom-widget")
                    .text(this.get('css'))
                    .appendTo($("body"));

            } catch (e) {
                console.log("Error loading custom widget javascript or CSS: ", e);
                alert("Error loading custom widget javascript / css, see console for details.");
            }
        }
    });

    EAT.SerializedData = Ember.Object.extend();
    EAT.RootSerializedData = EAT.SerializedData.extend({
        getDataForWidget: function (widget) {
            var key = widget.get('dataKey');
            return this.getDataForWidgetID(key);
        },
        getDataForWidgetID: function (key) {
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
    EAT.definitionDOMElements
        .addObject("elicitation-definition")
        .addObject("elicitation")
        .addObject("page")
        .addObject("phraseDefinitions")
        .addObject("definition");

    EAT.Variable = Ember.Object.extend({
        key: undefined,
        value: undefined
    });

    EAT.DataDidntValidate = Ember.Object.extend({
        init: function () {
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
    })

    /* Example of an EmberJS setter:
        id: function (key, val) {
            if (arguments.length > 1) {
                this.set('_id', val);
            }
            return this.get('_id');
        }.property('_id')
    */

    EAT.StoreDataResult = Ember.Object.extend({
        init: function () {
            this.set('errors', Ember.A(this.get('errors')));
        },
        dataKey: null,
        dataKeyText: null,
        errors: null,
        data: null
    });

})(EAT, window);