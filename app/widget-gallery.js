(function (EAT, ElicitationUtils, window, undefined) {
    "use strict";

    EAT.WidgetGalleryView = Ember.View.extend({
        addToPage: undefined, // page that will be added to!
        elicitationBinding: "controller.elicitation",

        templateName: "widget-gallery",
        classNames: ["widget-gallery"],
        widgetClicked: function (widget) {
            this.set('elicitation.widgetGalleryIsOpen', false);

            var widgetName = widget.widgetName;
            var pageToAddTo = this.get('addToPage');
            this.get('addToPage').createNewWidget(widgetName);
        },
        closeWidgetGallery: function () {
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