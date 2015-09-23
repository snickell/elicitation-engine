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

    var App = Ember.Application.create({
        LOG_TRANSITIONS: true
    });

    App.deferReadiness();

    App.Router.map(function () {
        //this.resource('widget', { path: '/widgets/:widget_id' });
        this.route('edit', { path: '/edit/:widget_id' });
    });

    App.EditRoute = Ember.Route.extend({
        setupController: function (controller) {
            console.log("Setting up edit route controller!");
        }
    });

    App.ApplicationView = Ember.View.extend({
        classNames: ['elicitation-application']
    });

    App.IndexController = Ember.Controller.extend({
        elicitationBinding: 'content',
        content: null
    });

    App.IndexRoute = Ember.Route.extend({
        setupController: function (controller) {
            var elicitationDefinition = $("script[type='text/x-elicitation-definition']").html();
            var priorSessionData = $("script[type='text/x-elicitation-prior-session-data']").html();

            if (!Ember.isNone(elicitationDefinition)) {
                var elicitation = EAT.Elicitation.create($.extend(window.DEFAULT_ELICITATION_CONFIGURATION, {
                    elicitationDefinition: elicitationDefinition,
                    priorSessionData: priorSessionData,
                    switchToEditModeAfterLoading: window.DEFAULT_ELICITATION_CONFIGURATION.switchToEditModeAfterLoading && !EAT.get('unsupportedBrowserForEditing'),
                }));
                controller.set('content', elicitation);
            } else {
                console.log("WARNING: no elicitation-definition to load in EAT.IndexRoute.setupController, not initializing elicitation");
            }
        }
    });

    App.IndexView = Ember.View.extend({
        templateName: 'elicitation',
        editModeBinding: 'controller.elicitation.editMode'
    });

    // Most EAT.* members are defined in eat.js

    // EXPORTS:
    window.ElicitationApp = App;
    window.EAT = Ember.Object.create();
    //window.widgets = [];

})(window);