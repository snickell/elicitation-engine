import Ember from 'ember'
import EAT from 'eat/eat'

EAT.Widget.register('dropdown', {
    prettyName: "Dropdown",
    value: null,
    templateName: 'dropdown',
    dataModel: EAT.WidgetData.extend({
        selection: null
    }),
    definitionSchema: {
        model: EAT.WidgetDefinition.extend({
            writein: true,
            placeholder: "Select one...",
            populateWithDiscussionMembers: true
        }),
        label: { accessor: EAT.WidgetDefinition.ChildNode("label"), type: "Text" },
        populateWithDiscussionMembers: { accessor: EAT.WidgetDefinition.Attr("populate-with-discussion-members"), type: "Boolean", prettyName: "Populate dropdown with participant names" },
        writein: { accessor: EAT.WidgetDefinition.Attr("writein"), type: "Boolean", prettyName: "Allow write-in answers" },
        selections: {
            type: "HasMany",
            prettyName: 'Selection',
            accessor: EAT.WidgetDefinition.HasMany('selection', {
                model: EAT.WidgetDefinition.extend({
                    label: "an item in the list"
                }),
                label: { accessor: EAT.WidgetDefinition.Contents() }
            })
        },
        placeholder: { accessor: EAT.WidgetDefinition.Attr("placeholder") }
    },
    setupDOM: function () {
        if (this.get('definition.writein')) {
            var combobox = this.$().find("select").combobox({
                // properties could be set here, if you want
            });
            this.set('combobox', combobox);
        }
    },
    selections: function () {
        var selections = this.get('definition.selections').map(function (selection) { return selection.get('label'); });

        if (this.get('definition.populateWithDiscussionMembers')) {
            EAT.get('experts').forEach(function (expert) {
                selections.push(expert);
            });
        }
        return selections;
    }.property('elicitation.experts.@each', 'definition.selections.@each.label', 'definition.populateWithDiscussionMembers'),
    rerenderOnChange: function () {
        this.rerender();
    }.observes('definition.writein', 'definition.placeholder'),
    serializeData: function (data, errors) {
        var selection;
        if (this.get('definition.writein')) {
            selection = this.$().find("input.ui-autocomplete-input").val();
        } else {
            selection = this.get('data.selection');
        }

        if (!selection) {
            errors.pushObject("You need to select an item from the dropdown.");
        }

        data.set('selection', selection);
    },
    resumeFromSerializedData: function (serializedData) {
        if (serializedData) {
            var selection = serializedData['selection'];
            if (this.get('definition.writein')) {
                this.$().find("input.ui-autocomplete-input").val(selection);
            } else {
                this.set('data.selection', selection);
            }
        }
    }
});

/*

function storeDataForMultipleChoiceWidget(widget, data) {
    var key_prefix = widget.attr("name");

    var previousChoices = [];

    widget.find("select").each(function (i, e) {
        var select = $(this);
        var key = key_prefix + "_" + (i + 1);

        var selectedOption = select.find("option:selected");
        if (selectedOption.length > 0) {
            var choice = null;
            if (selectedOption.attr("writein")) {
                var writein = select.nextAll("input.writein").first();
                choice = writein.val();
            } else {
                choice = selectedOption.text();
            }

            if ($.inArray(choice, previousChoices) != -1) {
                console.log(choice, previousChoices);
                return ["Please select option \"" + choice + "\" only once."];
            }

            data[key] = choice;
            previousChoices.push(choice);
            console.log("Set " + key + " to " + choice);
        } else {
            return ["One or more drop-downs haven't been filled in"];
        }
    });

    return [];
}

*/



// THIS WAS RETRIEVED FROM JQUERY-UI.COM AND CUSTOMIZED, LOOK FOR NZ_CUSTOM BELOW
(function ($) {
  $.widget("ui.combobox", {
      _create: function () {
          var input,
            that = this,
            wasOpen = false,
            select = this.element.hide(),
            selected = select.children(":selected"),
            value = selected.val() ? selected.text() : "",
            wrapper = this.wrapper = $("<span>")
              .addClass("ui-combobox")
              .insertAfter(select);

          function removeIfInvalid(element) {
              var value = $(element).val(),
                matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(value) + "$", "i"),
                valid = false;
              select.children("option").each(function () {
                  if ($(this).text().match(matcher)) {
                      this.selected = valid = true;
                      return false;
                  }
              });

              if (!valid) {
                  // remove invalid value, as it didn't match anything
                  $(element)
                    .val("")
                    .attr("title", value + " didn't match any item")
                    .tooltip("open");
                  select.val("");
                  setTimeout(function () {
                      input.tooltip("close").attr("title", "");
                  }, 2500);
                  input.data("ui-autocomplete").term = "";
              }
          }

          input = $("<input>")
            .appendTo(wrapper)
            .val(value)
            .attr("title", "")
            .addClass("ui-state-default ui-combobox-input")
            .autocomplete({
                delay: 0,
                minLength: 0,
                source: function (request, response) {
                    var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
                    response(select.children("option").map(function () {
                        var text = $(this).text();
                        if (this.value && (!request.term || matcher.test(text)))
                            return {
                                label: text.replace(
                                  new RegExp(
                                    "(?![^&;]+;)(?!<[^<>]*)(" +
                                    $.ui.autocomplete.escapeRegex(request.term) +
                                    ")(?![^<>]*>)(?![^&;]+;)", "gi"
                                  ), "<strong>$1</strong>"),
                                value: text,
                                option: this
                            };
                    }));
                },
                select: function (event, ui) {
                    ui.item.option.selected = true;
                    that._trigger("selected", event, {
                        item: ui.item.option
                    });
                },
                change: function (event, ui) {
                    if (!ui.item) {
                        // NZ_CUSTOM: we allow new items in the combox, that's the point!!!
                        // in return, we have to read the selection directly from the input
                        // and not from the select element
                        //removeIfInvalid(this);
                    }
                }
            })
            .addClass("ui-widget ui-widget-content ui-corner-left");

          input.data("ui-autocomplete")._renderItem = function (ul, item) {
              return $("<li>")
                .append("<a>" + item.label + "</a>")
                .appendTo(ul);
          };

          $("<a>")
            .attr("tabIndex", -1)
            .attr("title", "Show All Items")
            .tooltip()
            .appendTo(wrapper)
            .button({
                icons: {
                    primary: "ui-icon-triangle-1-s"
                },
                text: false
            })
            .removeClass("ui-corner-all")
            .addClass("ui-corner-right ui-combobox-toggle")
            .mousedown(function () {
                wasOpen = input.autocomplete("widget").is(":visible");
            })
            .click(function () {
                input.focus();

                // close if already visible
                if (wasOpen) {
                    return;
                }

                // pass empty string as value to search for, displaying all results
                input.autocomplete("search", "");
            });

          input.tooltip({
              tooltipClass: "ui-state-highlight"
          });
      },

      _destroy: function () {
          this.wrapper.remove();
          this.element.show();
      }
  });
})(jQuery);