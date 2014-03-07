(function() {

    function isTypeOf(type, val) {
        return typeof val === type;
    }


    function isUndefined(val) {
        return isTypeOf("undefined", val);
    }
    function isObject(val) {
        return isTypeOf("object", val);
    }
    function isNumber(val) {
        return isTypeOf("number", val);
    }
    function isString(val) {
        return isTypeOf("string", val);
    }

    // lazyloading utility?

    window.u = {
        isUndef: isUndefined,
        isObj: isObject,
        isNum: isNumber,
        isStr: isString
    }
}());
