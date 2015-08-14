"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Constants = require('../Constants');

var SOAPService = (function () {
    function SOAPService(fetch, xmlParser, stringUtilities) {
        _classCallCheck(this, SOAPService);

        this._fetch = fetch;
        this._xmlParser = xmlParser;
        this._stringUtilities = stringUtilities;
    }

    _createClass(SOAPService, [{
        key: 'post',
        value: function post(url, serviceName, methodName, parameters) {
            var _this = this;

            return this._fetch(url, {
                headers: {
                    SOAPAction: '"' + serviceName + '#' + methodName + '"',
                    'content-Type': Constants.SOAP.ContentType
                },
                method: 'post',
                body: this._stringUtilities.format(Constants.SOAP.Body, serviceName, methodName, this.parametersToXml(parameters))
            }).then(function (response) {
                var responseText = response._bodyText;
                var responseXML = _this._xmlParser.parseFromString(responseText);
                return { xml: responseXML, text: responseText };
            });
        }
    }, {
        key: 'parametersToXml',
        value: function parametersToXml(parameters) {
            var xml = '';
            for (var parameterKey in parameters) {
                if (parameters.hasOwnProperty(parameterKey)) xml += '<' + parameterKey + '>' + parameters[parameterKey] + '</' + parameterKey + '>';
            }return xml;
        }
    }]);

    return SOAPService;
})();

module.exports = SOAPService;