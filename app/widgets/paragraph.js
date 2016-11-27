import Ember from 'ember'

import { Widget } from 'eat/widget'
import { WidgetDefinition } from 'eat/widget-definition'

Widget.register('paragraph', {
    prettyName: "Paragraph",
    templateName: 'paragraph',
    definitionSchema: {
        model: WidgetDefinition.extend({
            label: "##This is a Header##\nWith a block of text under it demonstrating a few features of Markdown formatting, including:\n\n- A link to [another website](http://www.google.com)\n- *Italicized text*\n- **Bold text**\n- Support for<sup>superscript</sup>\n\nAnd another paragraph, with a [[term definition]]."
        }),
        label: { accessor: WidgetDefinition.ChildNode("label"), type: "Text" }
    },
    // Disable qualifications on this widget
    qualifications: []
});
