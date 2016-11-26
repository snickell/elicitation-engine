import Ember from 'ember'
import ElicitationUtils from './elicitation-utils'


var PhraseDefinition = Ember.Object.extend(Ember.Evented, {
    phrase: "",
    definition: "",
    isDefined: function () {
        var definition = this.get('definition');
        return (definition != undefined && definition.length > 0);
    }.property('definition'),
    serializeDefinition: function (doc) {
        var serialized = $(doc.createElement("definition"));
        serialized.attr('phrase', this.get('phrase'));
        serialized.text(this.get('definition'));
        return serialized;
    },
    scrollToDefinition: function () {
        this.trigger('scrollToDefinition');
    }
});

var PhraseDefinitionView = Ember.View.extend({
    init: function () {
        this._super();
        this.get('content').on('scrollToDefinition', this, 'scrollToDefinition');
    },
    scrollToDefinition: function () {
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

var PhraseDefinitionsView = Ember.View.extend({
    classNames: ['phrase-definitions-view'],
    templateName: 'phrase-definitions-view',
    showBody: false,
    togglePopout: function () {
        this.set('showBody', !this.get('showBody'));
    }
});

var PhraseDefinitionsController = Ember.ArrayController.extend({
    definePhrase: function (phrase, definition) {
        var def = this.getDefinitionOrCreate(phrase);
        def.set('definition', definition);
        return def;
    },
    getDefinition: function (phrase) {
        var definition = this.find(function (def) {
            return def.phrase === phrase;
        });
        return definition;
    },
    getDefinitionOrCreate: function (phrase) {
        var definition = this.getDefinition(phrase);
        if (Ember.isNone(definition)) {
            var definition = PhraseDefinition.create({
                phrase: phrase
            });
            this.pushObject(definition);
        }
        return definition;
    },
    content: [],
    unknownProperty: function (key) {
        return this.getDefinition(key);
    },
    isNamespace: false,
    serializeDefinition: function (doc) {
        return this.filterProperty('isDefined').map(function (definition) {
            return definition.serializeDefinition(doc);
        });
    },
    loadPhrasesFromXML: function (phrasesXML) {
        var self = this;

        phrasesXML.each(function () {
            self.definePhrase($(this).attr("phrase"), $(this).text());
        });
    }
});

export { PhraseDefinition, PhraseDefinitionView, PhraseDefinitionsView, PhraseDefinitionsController };

