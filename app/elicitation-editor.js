// Webpack Entry Point: Imports required for elicitation editing

import './styles/elicitation-editor.css';
import './styles/elicitation-print.css';

import './../public/libs/jquery.miniColors.css';
require("./../public/libs/jquery.miniColors");

import './../public/libs/codemirror/codemirror.css';

window.CodeMirror = require("./../public/libs/codemirror/codemirror");
require("imports?require=>false,define=>false,exports=>false!./../public/libs/codemirror/javascript");