import Ember from 'ember'
import EAT from './eat'
import ElicitationUtils from './elicitation-utils'


var WidgetQualification = Ember.Object.extend({
    widget: undefined,
    content: undefined,
    propertyName: undefined,
    prettyName: undefined,
    xmlAttr: undefined,
    editorView: QualificationEditorView,
    serializedDataBinding: 'content',
    init: function () {
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

var QualificationEditorView = Ember.View.extend({
    classNames: ["qualification-editor"],
    content: undefined, // bound to the associated qualification
    didInsertElement: function () {
        if (this.get('content.showQualification') && !this.get('content.enabledInDefinition') && !this.get('content.beenHighlightedByView')) {
            // This was just toggled on, for the first time, so lets highlight it (scroll to it, and flash it)
            this.highlight();
        }
    },
    highlight: function () {
        this.set('content.beenHighlightedByView', true);
        var widget = this;
        window.setTimeout(function () {
            var domElement = widget.$();
            $.scrollTo(domElement, 300, {
                offset: { top: -500 },
                axis: 'y',
                onAfter: function () {
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

var DropdownQualificationEditorView = QualificationEditorView.extend({
    templateName: "dropdown-qualification-editor-view",
    selections: [
        { value: 0, label: "0 - None" },
        { value: 1, label: "1" },
        { value: 2, label: "2 - Medium" },
        { value: 3, label: "3" },
        { value: 4, label: "4 - High" }
    ]
});
var TextCommentQualificationEditorView = QualificationEditorView.extend({
    templateName: "text-comment-qualification-editor-view",
    classNames: ["text-comment"]
});

// This array defines the qualifications that experts (and elicitation authors) can apply to widgets
var qualifications = Ember.A([
    WidgetQualification.extend({
        propertyName: "qualifyExpertise",
        prettyName: "Your Expertise",
        xmlAttr: "qualify-expertise",
        serializedDataBinding: "content.value",
        editorView: DropdownQualificationEditorView
    }),
    WidgetQualification.extend({
        propertyName: "qualifyConfidence",
        prettyName: "Your Confidence",
        xmlAttr: "qualify-confidence",
        serializedDataBinding: "content.value",
        editorView: DropdownQualificationEditorView
    }),
    WidgetQualification.extend({
        propertyName: "qualifyTextComment",
        prettyName: "Text Comment",
        xmlAttr: "qualify-text-comment",
        editorView: TextCommentQualificationEditorView
    })/*,
    WidgetQualification.extend({
        propertyName: "qualifyMostExpertParticipants",
        prettyName: "Most Expert Participants",
        xmlAttr: "qualify-most-expert-participants"
    })*/
]);

EAT.WidgetQualification = WidgetQualification;
EAT.QualificationEditorView = QualificationEditorView;
EAT.qualifications = qualifications;

export { WidgetQualification, QualificationEditorView, qualifications };