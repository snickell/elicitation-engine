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
        init: function () {
            this._super();
            Ember.assert("MarkdownLabel.elicitation must be set to an elicitation", !Ember.isNone(this.get('elicitation')));
        },
        template: Ember.Handlebars.compile("{{view.html}}"),
        variableSubstitutions: [],
        setupVariableSubstitutionObservers: function () {
            var self = this;
            var variableSubstitutions = this.get('variableSubstitutions');
            variableSubstitutions.forEach(function (variable) {
                var variablePath = 'elicitation.variableScope.' + variable;
                self.addObserver(variablePath, function () {
                    Ember.run.once(function () {
                        var value = self.get(variablePath);
                        var subtitutedVariable = self.$(".substituted-variable").filter("[variable='" + variable + "']");
                        subtitutedVariable.html(value);
                    });
                });
            });
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
        didInsertElement: function () {
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
            })
            .on("mouseleave", ".defined-term", function (evt) {
                var term = $(this);

                term.find(".popup").remove();
                term.removeClass("popped-out");
            })
            .on("click", "img", function (evt) {
                var img = $(this);
                var url = img.attr("src");
                window.open(url);
            });
        },
        // templateName: "markdown-label"
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
        didInsertElement: function () {
            this.$()
            .on("click", "img", function (evt) {
                var img = $(this);
                var url = img.attr("src");
                window.open(url);
            });
        },
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