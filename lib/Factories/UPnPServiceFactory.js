const UPnPVersion = require('../Entities/UPnPVersion');
const UPnPService = require('../Entities/UPnPService');

class UPnPServiceFactory {
    constructor(fetch, xmlParser, urlProvider, upnpExtensionInfoFactory, serviceProperyFactory, serviceMethodFactory, serviceExecutor, executableServiceMethodFactory) {
        this._fetch = fetch;
        this._xmlParser = xmlParser;
        this._urlProvider = urlProvider;
		this._upnpExtensionInfoFactory = upnpExtensionInfoFactory;
		this._serviceProperyFactory = serviceProperyFactory;
		this._serviceMethodFactory = serviceMethodFactory;
		this._serviceExecutor = serviceExecutor;
		this._executableServiceMethodFactory = executableServiceMethodFactory;
    }

	create(serviceXml, location, base, serverIP) {
		var upnpService = new UPnPService();
		upnpService.controlUrl = this._urlProvider.toUrl(this._xmlParser.getText(serviceXml, "controlURL"), location, base);
		upnpService.eventSubUrl = this._urlProvider.toUrl(this._xmlParser.getText(serviceXml, "eventSubURL"), location, base);
		upnpService.scpdUrl = this._urlProvider.toUrl(this._xmlParser.getText(serviceXml, "SCPDURL"), location, base);
		upnpService.uuid = this._xmlParser.getText(serviceXml, "serviceId").split(":")[3];
		upnpService.id = this._upnpExtensionInfoFactory.createFromString(this._xmlParser.getText(serviceXml, "serviceId"));
		upnpService.type = this._upnpExtensionInfoFactory.createFromString(this._xmlParser.getText(serviceXml, "serviceType"));
		upnpService.serverIP = serverIP;

		if (this._urlProvider.isValidUri(upnpService.scpdUrl)) {
			this._fetch(upnpService.scpdUrl).then((response) => {
				//todo: take in the current upnpService object as a parameter, and add a hash of the response to said object so I can lazy rebuild it like I do the device			
				var responseXml = this._xmlParser.parseFromString(response._bodyText);
				upnpService.upnpVersion = new UPnPVersion();
				upnpService.upnpVersion.major = this._xmlParser.getText(responseXml, "specVersion major");
				upnpService.upnpVersion.minor = this._xmlParser.getText(responseXml, "specVersion minor");

				var propertiesXml = this._xmlParser.getElements(responseXml, "stateVariable");
				propertiesXml.forEach(propertyXml => upnpService.properties.push(this._serviceProperyFactory.create(propertyXml)));

				var methodsXml = this._xmlParser.getElements(responseXml, "action");
				methodsXml.forEach(methodXml => upnpService.methods.push(this._serviceMethodFactory.create(methodXml, upnpService.properties)));


				var executableService = {};
				upnpService.methods.forEach(method => executableService[method.name] = this._executableServiceMethodFactory.create(method, upnpService.type.raw));
				this._serviceExecutor.addExecutableService(executableService, upnpService.uuid);

				return upnpService;
			});
		}

		return upnpService;
	}
}

module.exports = UPnPServiceFactory;