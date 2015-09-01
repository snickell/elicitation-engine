
if (BrowserDetection.msie && BrowserDetection.version < 9) {
    // IE8 and 7 don't allow unknown DOM elements (which we use for elicitation
    // definitions), unless they're first created using document.createElement
    EAT.definitionDOMElements.forEach(function (domElement) {
        console.log("Registering " + domElement);
        document.createElement(domElement);
    });
}
