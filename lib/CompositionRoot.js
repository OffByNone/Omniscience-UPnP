const DeviceFactory = require('./Factories/DeviceFactory');
const UDPSocketFactory = require('./Factories/UDPSocketFactory');
const ServiceInfoFactory = require('./Factories/ServiceInfoFactory');
const ExecutableServiceFactory = require('./Factories/ExecutableServiceFactory');
const ServiceExecutor = require('./Services/ServiceExecutor');
const SOAPService = require('./Services/SOAPService');
const SubscriptionService = require('./Services/SubscriptionService');
const XmlParser = require('./XmlParser');
const StringUtils = require('./StringUtilities');

const Utils = require('omniscience-utilities');
const fetch = require('fetch');
const MD5 = require('md5');

class CompositionRoot {
	constructor(sdk) {
		this._sdk = sdk;
	}
	createDeviceFactory() {
		return new DeviceFactory(fetch, new XmlParser(this._sdk.createDOMParser()), Utils.createUrlProvider(), MD5);
	}
	createSubscriptionService() {
		return new SubscriptionService(fetch);
	}
	createServiceExecutor() {
		return new ServiceExecutor(new ServiceInfoFactory(fetch, new XmlParser(this._sdk.createDOMParser()), Utils.createUrlProvider(), MD5),
			new ExecutableServiceFactory(new XmlParser(this._sdk.createDOMParser()), new SOAPService(fetch, this._sdk.createDOMParser(), StringUtils)));
	}
}

module.exports = CompositionRoot;