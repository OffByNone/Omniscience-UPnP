const Constants = require('./Constants');

class SOAPService {
    constructor(fetch, domParser, stringUtilities) {
        this._fetch = fetch;
        this._DOMParser = domParser;
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
            var responseText = response._bodyText;
            var responseXML = this._DOMParser.parseFromString(responseText, 'text/xml'); //todo: what if this fails [hint: it does... all the time]
            return { xml: responseXML, text: responseText };
        });
    }
    parametersToXml(parameters) {
        var xml = '';
        for (var parameterKey in parameters)
            if (parameters.hasOwnProperty(parameterKey))
                xml += '<' + parameterKey + '>' + parameters[parameterKey] + '</' + parameterKey + '>';
        return xml;
    }
}

module.exports = SOAPService;
