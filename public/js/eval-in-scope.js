// Defined out here because 'with' isn't allowed in strict mode
function eat_evalInScope(toEval, scope) {
    with (scope) {
        return eval(toEval);
    }
}