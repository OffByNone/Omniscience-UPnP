"use strict";
const Constants = require('../Constants');

class SOAPService {
    constructor(fetch, xmlParser, stringUtilities) {
        this._fetch = fetch;
        this._xmlParser = xmlParser;
        this._stringUtilities = stringUtilities;
    }
    post(url, serviceName, methodName, parameters) {
        return this._fetch(url, {
            headers: {
                SOAPAction: `"${serviceName}#${methodName}"`,
                'content-Type': Constants.SOAP.ContentType
            },
            method: 'post',
            body: this._stringUtilities.format(Constants.SOAP.Body, serviceName, methodName, this.parametersToXml(parameters))
        }).then((response) => {
            let responseText = response._bodyText;
            let responseXML = this._xmlParser.parseFromString(responseText);
            return { xml: responseXML, text: responseText };
        });
    }
    parametersToXml(parameters) {
        let xml = '';
        for (let parameterKey in parameters)
            if (parameters.hasOwnProperty(parameterKey))
                xml += '<' + parameterKey + '>' + parameters[parameterKey] + '</' + parameterKey + '>';
        return xml;
    }
}

module.exports = SOAPService;
