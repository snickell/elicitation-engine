(function (EAT, Ember) {
    "use strict;"

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
            var imageID = this.get('definition.image');
            if (Ember.isNone(imageID)) return undefined;

            return this.get('elicitation.imageURL') + "&id=" + imageID;
        }.property('definition.image'),
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