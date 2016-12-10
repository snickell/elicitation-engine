// This module handles the fancy imports required for our legacy "global namespace polluting" legacy libs

import './../public/libs/codemirror/codemirror.css';

window.CodeMirror = require("./../public/libs/codemirror/codemirror");
require("imports?require=>false,define=>false,exports=>false!./../public/libs/codemirror/javascript");
