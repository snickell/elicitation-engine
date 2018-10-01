// Defined out here because 'with' isn't allowed in strict mode
window.eat_evalInScope = function (toEval, scope) {
    with (scope) {
        return eval(toEval);
    }
}
