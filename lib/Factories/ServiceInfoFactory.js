const UPnPVersion = require('../Entities/UPnPVersion');
const ServiceInfo = require('../Entities/ServiceInfo');

class ServiceInfoFactory {
    constructor(fetch, xmlParser, urlProvider, upnpExtensionInfoFactory, serviceProperyFactory, serviceMethodFactory, serviceExecutor) {
        this._fetch = fetch;
        this._xmlParser = xmlParser;
        this._urlProvider = urlProvider;
		this._upnpExtensionInfoFactory = upnpExtensionInfoFactory;
		this._serviceProperyFactory = serviceProperyFactory;
		this._serviceMethodFactory = serviceMethodFactory;
		this._serviceExecutor = serviceExecutor;
    }

	create(serviceXml, location, base, serverIP) {
		var serviceInfo = new ServiceInfo();
		serviceInfo.controlUrl = this._urlProvider.toUrl(this._xmlParser.getText(serviceXml, "controlURL"), location, base);
		serviceInfo.eventSubUrl = this._urlProvider.toUrl(this._xmlParser.getText(serviceXml, "eventSubURL"), location, base);
		serviceInfo.scpdUrl = this._urlProvider.toUrl(this._xmlParser.getText(serviceXml, "SCPDURL"), location, base);
		serviceInfo.uuid = this._xmlParser.getText(serviceXml, "serviceId").split(":")[3];
		serviceInfo.id = this._upnpExtensionInfoFactory.createFromString(this._xmlParser.getText(serviceXml, "serviceId"));
		serviceInfo.type = this._upnpExtensionInfoFactory.createFromString(this._xmlParser.getText(serviceXml, "serviceType"));
		serviceInfo.serverIP = serverIP;

		if (this._urlProvider.isValidUri(serviceInfo.scpdUrl)) {
			this._fetch(serviceInfo.scpdUrl).then((response) => {
				//todo: take in the current serviceInfo object as a parameter, and add a hash of the response to said object so I can lazy rebuild it like I do the device			
				var responseXml = this._xmlParser.parseFromString(response._bodyText);
				serviceInfo.upnpVersion = new UPnPVersion();
				serviceInfo.upnpVersion.major = this._xmlParser.getText(responseXml, "specVersion major");
				serviceInfo.upnpVersion.minor = this._xmlParser.getText(responseXml, "specVersion minor");

				var propertiesXml = this._xmlParser.getElements(responseXml, "stateVariable");

				propertiesXml.forEach(propertyXml => serviceInfo.properties.push(this._serviceProperyFactory.create(propertyXml)));

				var methodsXml = this._xmlParser.getElements(responseXml, "action");

				methodsXml.forEach(methodXml => serviceInfo.methods.push(this._serviceMethodFactory.create(methodXml, serviceInfo.properties)));

				return serviceInfo;
				this._serviceExecutor.addExecutableService(serviceInfo);
			});
		}

		return serviceInfo;
	}
}

module.exports = ServiceInfoFactory;