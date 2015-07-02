const ServiceMethod = require('../Entities/ServiceMethod');
const ServiceArgument = require('../Entities/ServiceArgument');

class ServiceMethodFactory { 
	constructor(xmlParser) { 
		this._xmlParser = xmlParser;
	}
    create(methodXml, backingProperties) {
        var method = new ServiceMethod();
        method.name = this._xmlParser.getText(methodXml, "name");

        var args = this._xmlParser.getElements(methodXml, "argument").map(argumentXml => {
            return {
                name: this._xmlParser.getText(argumentXml, "name"),
                direction: this._xmlParser.getText(argumentXml, "direction"),
                relatedStateVariable: this._xmlParser.getText(argumentXml, "relatedStateVariable")
            };
        });
        args.forEach(argument => {
            var backingProperty = backingProperties.filter(serviceProperty => serviceProperty.name === argument.relatedStateVariable)[0];
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
}
module.exports = ServiceMethodFactory;