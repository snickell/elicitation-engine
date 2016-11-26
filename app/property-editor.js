import Ember from 'ember'
import ElicitationUtils from './elicitation-utils'


var PropertyEditorView = Ember.View.extend({
    content: null,
    value: undefined,
    property: undefined,
    parentDefinition: undefined,
    toggleHelpText: function () {
        var helpText = this.$().find(".help-text");
        if (helpText.is(":visible")) {
            helpText.slideUp();
        } else {
            helpText.slideDown();
        }
    }
});

var EnumPropertyEditorView = PropertyEditorView.extend({
    templateName: 'property-editor-enum',
    classNames: ['property-editor', 'property-editor-enum']
});

var ImagePropertyEditorView = PropertyEditorView.extend({
    templateName: 'property-editor-image',
    classNameBindings: [':property-editor', ':property-editor-image', 'uploadInProgress'],
    uploadInProgress: false,
    message: undefined,
    clearFileInput: function () {
        this.$(':file')[0].value = "";
    },
    actions: {
        fileChanged: function () {
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
        },
    },
    uploadImage: function () {
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
            xhr: function () {
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

var PropertyEditors = Ember.Object.create({
    String: PropertyEditorView.extend({
        templateName: 'property-editor-string',
        classNames: ['property-editor', 'property-editor-string']
    }),
    Boolean: PropertyEditorView.extend({
        templateName: 'property-editor-boolean',
        classNames: ['property-editor', 'property-editor-boolean']
    }),
    Formula: PropertyEditorView.extend({
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
    Text: PropertyEditorView.extend({
        templateName: 'property-editor-text',
        classNames: ['property-editor', 'property-editor-text']
    }),
    MillionsOfDollars: PropertyEditorView.extend({
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
            accessor: WidgetDefinition.Attr('choice-type')
        }
    */
    Color: PropertyEditorView.extend({
        templateName: 'property-editor-color',
        classNames: ['property-editor', 'property-editor-color'],
        didInsertElement: function () {
            this._super();
            console.log("Converting to miniColors");
            this.$().find("input#color").miniColors({
                letterCase: 'uppercase',
                change: function (hex, rgb) {
                    console.log("Change happened", hex);
                }
            });
        }
    }),
    HasMany: PropertyEditorView.extend({
        templateName: 'property-editor-hasmany',
        classNames: ['property-editor', 'property-editor-hasmany'],
        childrenBinding: 'value',
        moveChild: function (child, directionToMove) {
            var children = this.get('children');
            var childIndex = children.indexOf(child);
            var newChildIndex = childIndex + directionToMove;
            if (newChildIndex >= 0 && newChildIndex < children.get('length')) {
                children.removeAt(childIndex);
                children.insertAt(newChildIndex, child);
            }
        },
        actions: {
            addChild: function () {
                var children = this.get('children');
                var schema = children.get('schema');
                var newChild = schema.createDefinition(this.get('parentDefinition'));
                children.pushObject(newChild);
            },
            removeChild: function (child) {
                var children = this.get('children');
                children.removeObject(child);
            },

            moveChildUp: function (child) {
                this.moveChild(child, -1);
            },
            moveChildDown: function (child) {
                this.moveChild(child, 1);
            }
        }
    })
});

export { PropertyEditorView, PropertyEditors };