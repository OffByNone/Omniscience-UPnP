"use strict";
class ExecutableServiceMethodFactory {
    constructor(xmlParser, soapService, parameterValidator) {
        this._xmlParser = xmlParser;
        this._soapService = soapService;
		this._parameterValidator = parameterValidator;
    }
    create(method, urn) {
        if (!method) throw new Error("Argument 'method' cannot be null.");
        if (!urn) throw new Error("Argument 'urn' cannot be null.");

		return (controlUrl, params) => {
            method.parameters.forEach(parameter => this._parameterValidator.validate(parameter, params[parameter.name]));

            return this._soapService.post(controlUrl, urn, method.name, params).then(response => {
                //todo: try to coerce the type using returnValue.datatype
                let result = {};

                method.returnValues.forEach(returnValue => {
                    if (typeof returnValue.name === "string" && returnValue.name.length > 0)
                        result[returnValue.name] = this._xmlParser.getText(response.xml, returnValue.name);
                });

                result._raw = response.text;
                return result;
            });
        };
    }
}

module.exports = ExecutableServiceMethodFactory;