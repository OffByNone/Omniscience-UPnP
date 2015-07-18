"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ExecutableServiceMethodFactory = (function () {
    function ExecutableServiceMethodFactory(xmlParser, soapService, parameterValidator) {
        _classCallCheck(this, ExecutableServiceMethodFactory);

        this._xmlParser = xmlParser;
        this._soapService = soapService;
        this._parameterValidator = parameterValidator;
    }

    _createClass(ExecutableServiceMethodFactory, [{
        key: "create",
        value: function create(method, urn) {
            var _this = this;

            if (!method) throw new Error("Argument 'method' cannot be null.");
            if (!urn) throw new Error("Argument 'urn' cannot be null.");

            return function (controlUrl, params) {
                method.parameters.forEach(function (parameter) {
                    return _this._parameterValidator.validate(parameter, params[parameter.name]);
                });

                return _this._soapService.post(controlUrl, urn, method.name, params).then(function (response) {
                    //todo: try to coerce the type using returnValue.datatype
                    var result = {};

                    method.returnValues.forEach(function (returnValue) {
                        if (typeof returnValue.name === "string" && returnValue.name.length > 0) result[returnValue.name] = _this._xmlParser.getText(response.xml, returnValue.name);
                    });

                    result._raw = response.text;
                    return result;
                });
            };
        }
    }]);

    return ExecutableServiceMethodFactory;
})();

module.exports = ExecutableServiceMethodFactory;