const ServiceProperty = require('../Entities/ServiceProperty');
const AllowedValueRange = require('../Entities/AllowedValueRange');

class ServicePropertyFactory {
	constructor(xmlParser) {
		this._xmlParser = xmlParser;
	}
	create(propertyXml) {
        let property = new ServiceProperty();
        property.name = this._xmlParser.getText(propertyXml, "name");
        property.datatype = this._xmlParser.getText(propertyXml, "dataType"); //todo: use the table containing allowed datatypes to better parse this
        property.defaultValue = this._xmlParser.getText(propertyXml, "defaultValue");
        property.evented = this._xmlParser.getAttribute(propertyXml, "sendEvents") == "yes";

        property.allowedValues = this._xmlParser.getElements(propertyXml, "allowedValue").map(value => value.innerHTML);
        property.allowedValueRange = new AllowedValueRange();

        if (this._xmlParser.hasNode(propertyXml, "allowedValueRange")) {
            property.allowedValueRange.minimum = this._xmlParser.getText(propertyXml, "allowedValueRange minimum");
            property.allowedValueRange.maximum = this._xmlParser.getText(propertyXml, "allowedValueRange maximum");
            property.allowedValueRange.step = this._xmlParser.getText(propertyXml, "allowedValueRange step");
        }
        return property;
    }
}

module.exports = ServicePropertyFactory;