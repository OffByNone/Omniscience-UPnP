"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ServiceMethod = require('../Entities/ServiceMethod');
var ServiceArgument = require('../Entities/ServiceArgument');

var ServiceMethodFactory = (function () {
    function ServiceMethodFactory(xmlParser) {
        _classCallCheck(this, ServiceMethodFactory);

        this._xmlParser = xmlParser;
    }

    _createClass(ServiceMethodFactory, [{
        key: 'create',
        value: function create(methodXml, backingProperties) {
            var _this = this;

            var method = new ServiceMethod();
            method.name = this._xmlParser.getText(methodXml, "name");

            var args = this._xmlParser.getElements(methodXml, "argument").map(function (argumentXml) {
                return {
                    name: _this._xmlParser.getText(argumentXml, "name"),
                    direction: _this._xmlParser.getText(argumentXml, "direction"),
                    relatedStateVariable: _this._xmlParser.getText(argumentXml, "relatedStateVariable")
                };
            });
            args.forEach(function (argument) {
                var backingProperty = backingProperties.filter(function (serviceProperty) {
                    return serviceProperty.name === argument.relatedStateVariable;
                })[0];
                var arg = new ServiceArgument();
                arg.name = argument.name;
                arg.backingProperty = backingProperty;
                arg.datatype = backingProperty.datatype;
                arg.allowedValues = backingProperty.allowedValues;
                arg.allowedValueRange = backingProperty.allowedValueRange;

                argument.direction === 'in' ? method.parameters.push(arg) : method.returnValues.push(arg);
            });

            return method;
        }
    }]);

    return ServiceMethodFactory;
})();

module.exports = ServiceMethodFactory;