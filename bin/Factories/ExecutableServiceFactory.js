'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Constants = require('../Constants');
var Service = require('../Entities/Service');

var ExecutableServiceFactory = (function () {
    function ExecutableServiceFactory(xmlParser, soapService) {
        _classCallCheck(this, ExecutableServiceFactory);

        this._xmlParser = xmlParser;
        this._soapService = soapService;
    }

    _createClass(ExecutableServiceFactory, [{
        key: 'create',
        value: function create(serviceInfo) {
            var _this = this;

            var executableService = {};
            if (!Array.isArray(serviceInfo.methods)) return null;
            serviceInfo.methods.forEach(function (method) {
                return _this._addMethod(executableService, method, serviceInfo.type.raw);
            });

            return executableService;
        }
    }, {
        key: '_addMethod',
        value: function _addMethod(executableService, serviceInfoMethod, urn) {
            var _this2 = this;

            if (serviceInfoMethod == null) return;
            if (typeof serviceInfoMethod.name !== 'string' || serviceInfoMethod.name.length === 0) return;

            executableService[serviceInfoMethod.name] = function (controlUrl, params) {
                serviceInfoMethod.parameters.forEach(function (parameter) {
                    return _this2._validateParam(parameter, params);
                });

                return _this2._soapService.post(controlUrl, urn, serviceInfoMethod.name, params).then(function (response) {
                    //todo: try to coerce the type using returnValue.datatype
                    var result = {};

                    serviceInfoMethod.returnValues.forEach(function (returnValue) {
                        if (typeof returnValue.name === 'string' && returnValue.name.length > 0) result[returnValue.name] = _this2._xmlParser.getText(response.xml, returnValue.name);
                    });

                    result._raw = response.text;
                    return result;
                });
            };
        }
    }, {
        key: '_validateParam',
        value: function _validateParam(parameter, params) {
            //todo: validate datatype as well
            //todo: there are serious issues with this validation as different devices allow different inputs and this won't allow for that.
            //should probably set it up so that when calling the service it pulls in the allowed values from the device.serviceInfo on the backend
            if (typeof parameter.name !== 'string' || parameter.name.length === 0) return;
            if (!params.hasOwnProperty(parameter.name)) throw new Error('Missing required argument: ' + parameter.name);
            var param = params[parameter.name];

            if (parameter.allowedValues.length > 0 && parameter.allowedValues.every(function (allowedValue) {
                return allowedValue != param;
            })) throw new Error('value for argument ' + parameter.name + ' is not allowed');
            if (parameter.allowedValueRange.maximum != null && parameter.allowedValueRange.minimum != null && parameter.allowedValueRange.step != null) {
                var paramNum = Number(param);
                if (isNaN(paramNum) || paramNum < Number(parameter.allowedValueRange.minimum) || paramNum > Number(parameter.allowedValueRange.maximum) || paramNum - Number(parameter.allowedValueRange.maximum) % Number(parameter.allowedValueRange.step) !== 0) throw new Error('argument ' + parameter.name + ' is invalid.It must be a number between ' + parameter.allowedValueRange.minimum + ' and ' + parameter.allowedValueRange.maximum + ', and incremented by ' + parameter.allowedValueRange.step + '.');
            }
        }
    }]);

    return ExecutableServiceFactory;
})();

module.exports = ExecutableServiceFactory;