'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ServiceProperty = require('../Entities/ServiceProperty');
var AllowedValueRange = require('../Entities/AllowedValueRange');

var ServicePropertyFactory = (function () {
    function ServicePropertyFactory(xmlParser) {
        _classCallCheck(this, ServicePropertyFactory);

        this._xmlParser = xmlParser;
    }

    _createClass(ServicePropertyFactory, [{
        key: 'create',
        value: function create(propertyXml) {
            var property = new ServiceProperty();
            property.name = this._xmlParser.getText(propertyXml, 'name');
            property.datatype = this._xmlParser.getText(propertyXml, 'dataType'); //todo: use the table containing allowed datatypes to better parse this
            property.defaultValue = this._xmlParser.getText(propertyXml, 'defaultValue');
            property.evented = this._xmlParser.getAttribute(propertyXml, 'sendEvents') === 'yes';

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
    }]);

    return ServicePropertyFactory;
})();

module.exports = ServicePropertyFactory;