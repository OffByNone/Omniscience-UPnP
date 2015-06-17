/* global Promise */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ServiceInfo = require('../Entities/ServiceInfo');
var UPnPExtensionInfo = require('../Entities/UPnPExtensionInfo');
var UPnPVersion = require('../Entities/UPnPVersion');
var ServiceProperty = require('../Entities/ServiceProperty');
var AllowedValueRange = require('../Entities/AllowedValueRange');
var ServiceMethod = require('../Entities/ServiceMethod');
var ServiceArgument = require('../Entities/ServiceArgument');

var ServiceInfoFactory = (function () {
    function ServiceInfoFactory(fetch, xmlParser, urlProvider, md5) {
        _classCallCheck(this, ServiceInfoFactory);

        this._fetch = fetch;
        this._xmlParser = xmlParser;
        this._md5 = md5;
        this._urlProvider = urlProvider;
    }

    _createClass(ServiceInfoFactory, [{
        key: 'createServiceProperty',
        value: function createServiceProperty(propertyXml) {
            var property = new ServiceProperty();
            property.name = this._xmlParser.getText(propertyXml, 'name');
            property.datatype = this._xmlParser.getText(propertyXml, 'dataType'); //todo: use the table containing allowed datatypes to better parse this
            property.defaultValue = this._xmlParser.getText(propertyXml, 'defaultValue');
            property.evented = this._xmlParser.getAttribute(propertyXml, 'sendEvents') == 'yes';

            property.allowedValues = this._xmlParser.getElements(propertyXml, 'allowedValue').map(function (value) {
                return value.innerHTML;
            });
            property.allowedValueRange = new AllowedValueRange();

            if (this._xmlParser.hasNode(propertyXml, 'allowedValueRange')) {
                property.allowedValueRange.minimum = this._xmlParser.getText(propertyXml, 'allowedValueRange minimum');
                property.allowedValueRange.maximum = this._xmlParser.getText(propertyXml, 'allowedValueRange maximum');
                property.allowedValueRange.step = this._xmlParser.getText(propertyXml, 'allowedValueRange step');
            }
            return property;
        }
    }, {
        key: 'createServiceMethod',
        value: function createServiceMethod(methodXml, backingProperties) {
            var _this = this;

            var method = new ServiceMethod();
            method.name = this._xmlParser.getText(methodXml, 'name');

            var args = this._xmlParser.getElements(methodXml, 'argument').map(function (argumentXml) {
                return {
                    name: _this._xmlParser.getText(argumentXml, 'name'),
                    direction: _this._xmlParser.getText(argumentXml, 'direction'),
                    relatedStateVariable: _this._xmlParser.getText(argumentXml, 'relatedStateVariable')
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
    }, {
        key: 'getDetailedServiceInformation',
        value: function getDetailedServiceInformation(serviceInfo) {
            var _this2 = this;

            if (!this._urlProvider.isValidURI(serviceInfo.scpdUrl)) return Promise.reject('scpdURL was null');
            return this._fetch(serviceInfo.scpdUrl).then(function (response) {
                var responseText = response._bodyText;
                var responseHash = _this2._md5(responseText);
                if (serviceInfo.responseHash !== responseHash) {
                    var responseXml = _this2._xmlParser.parseFromString(responseText);

                    serviceInfo.responseHash = responseHash;
                    serviceInfo.upnpVersion = new UPnPVersion();
                    serviceInfo.upnpVersion.major = _this2._xmlParser.getText(responseXml, 'specVersion major');
                    serviceInfo.upnpVersion.minor = _this2._xmlParser.getText(responseXml, 'specVersion minor');

                    var propertiesXml = _this2._xmlParser.getElements(responseXml, 'stateVariable');

                    propertiesXml.forEach(function (propertyXml) {
                        return serviceInfo.properties.push(_this2.createServiceProperty(propertyXml));
                    });

                    var methodsXml = _this2._xmlParser.getElements(responseXml, 'action');

                    methodsXml.forEach(function (methodXml) {
                        return serviceInfo.methods.push(_this2.createServiceMethod(methodXml, serviceInfo.properties));
                    });
                }

                return serviceInfo;
            });
        }
    }]);

    return ServiceInfoFactory;
})();

module.exports = ServiceInfoFactory;