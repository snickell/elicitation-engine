// This module handles the fancy imports required for our legacy "global namespace polluting" legacy libs

window.jQuery = window.$ = require("./../public/libs/jquery-1.11.3");
require("./../public/libs/jquery.textarea_auto_expand");
require("./../public/libs/browser-detection-from-old-jquery");
require("./../public/libs/jquery.scrollTo");

require("imports?define=>false!./../public/libs/jquery-ui-1.11.4");

require("./../public/libs/jquery.ui.touch-punch");
require("./../public/libs/jquery.color");
require("./../public/libs/jquery.placeholder");

window.Handlebars = require("exports?Handlebars!./../public/libs/handlebars");
window.Ember = window.Em = require("exports?Ember!./../public/libs/ember");

window.Markdown = require("imports?require=>false!exports?Markdown!./../public/libs/pagedown/Markdown.Converter");
require("./../public/libs/pagedown/Markdown.Editor");
require("imports?require=>false!./../public/libs/pagedown/Markdown.Sanitizer");
