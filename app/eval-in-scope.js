//WEBPACKCONVERT: we broke evalInScope

console.error("WEBPACKCONVERT: evalInScope broken");

// Defined out here because 'with' isn't allowed in strict mode
export default function (toEval, scope) {
    /*with (scope) {
        return eval(toEval);
    }*/
        console.error("EliciationUtils.evalInScope from elicitation-utils.js IS BROKEN BY USE-STRICT BABEL");
        throw "EliciationUtils.evalInScope from elicitation-utils.js IS BROKEN BY USE-STRICT BABEL";
}