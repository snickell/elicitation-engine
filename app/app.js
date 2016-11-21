// For cross-iframe communication with the discussion engine
try { document.domain = 'nearzero.org' } catch (e) { }

if (window.console == undefined) {
    window.console = Object();
}
if (window.console.log == undefined) {
    window.console.log = function (s) { try { console.log(s) } catch (e) { }; };
}

window.debug = {};

// For IE7 and IE8, which don't support Date.now()
Date.now = Date.now || function () { return (new Date).valueOf(); };

(function (window, undefined) {
    "use strict";

    // Remove circular reference problem on IE7/8 created by the
    // Meta object being enumerable, and Meta.source containing
    // a circular reference back to the related Ember.Object
    (function () {
        if (Ember.platform.defineProperty.isSimulated) {
            var Meta = Ember.meta(Ember.Object.create()).constructor;
            Meta.prototype.toJSON = function () { };
        }
    })();

    var ElicitationAppClass = Ember.Application.extend({
        LOG_TRANSITIONS: true,
        ready: function () {
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

        }
    });
    
    var EAT = Ember.Object.extend({
        createApp: function (rootElement, elicitationProperties) {
            var app = ElicitationAppClass.create({
                rootElement: rootElement
            });

            app.deferReadiness();

            app.Router.map(function () {
                //this.resource('widget', { path: '/widgets/:widget_id' });
                this.route('edit', { path: '/edit/:widget_id' });
            });

            app.EditRoute = Ember.Route.extend({
                setupController: function (controller) {
                    console.log("Setting up edit route controller!");
                }
            });

            app.applicationView = Ember.View.extend({
                classNames: ['elicitation-application']
            });

            app.IndexController = Ember.Controller.extend({
                elicitationBinding: 'content',
                content: null
            });

            app.IndexRoute = Ember.Route.extend({
                setupController: function (controller) {
                    var elicitation = EAT.Elicitation.create(elicitationProperties);
                    controller.set('content', elicitation);
                }
            });

            app.IndexView = Ember.View.extend({
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