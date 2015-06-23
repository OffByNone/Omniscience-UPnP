const DeviceFactory = require('./Factories/DeviceFactory');
const ServiceInfoFactory = require('./Factories/ServiceInfoFactory');
const ExecutableServiceFactory = require('./Factories/ExecutableServiceFactory');
const ServiceExecutor = require('./Services/ServiceExecutor');
const SOAPService = require('./Services/SOAPService');
const SubscriptionService = require('./Services/SubscriptionService');
const XmlParser = require('./XmlParser');
const StringUtils = require('./StringUtilities');

const Utils = require('omniscience-utilities');

class CompositionRoot {
	constructor(sdk) {
		this._sdk = sdk;
	}
	createDeviceFactory() {
		return new DeviceFactory(Utils.fetch(), new XmlParser(this._sdk.createDomParser()), Utils.createUrlProvider(), Utils.MD5());
	}
	createSubscriptionService() {
		return new SubscriptionService(Utils.fetch());
	}
	createServiceExecutor() {
		return new ServiceExecutor(new ServiceInfoFactory(Utils.fetch(), new XmlParser(this._sdk.createDomParser()), Utils.createUrlProvider(), Utils.MD5()),
			new ExecutableServiceFactory(new XmlParser(this._sdk.createDomParser()), new SOAPService(Utils.fetch(), this._sdk.createDomParser(), StringUtils)));
	}
}

module.exports = CompositionRoot;