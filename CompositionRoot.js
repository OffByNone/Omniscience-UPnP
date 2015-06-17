const DeviceFactory = require('./lib/Factories/DeviceFactory');
const UDPSocketFactory = require('./lib/Factories/UDPSocketFactory');
const ServiceInfoFactory = require('./lib/Factories/ServiceInfoFactory');
const ExecutableServiceFactory = require('./lib/Factories/ExecutableServiceFactory');
const ServiceExecutor = require('./lib/Services/ServiceExecutor');
const SOAPService = require('./lib/Services/SOAPService');
const SubscriptionService = require('./lib/Services/SubscriptionService');
const XmlParser = require('./lib/XmlParser');
const StringUtils = require('./lib/StringUtilities');

const Utils = require('omniscienceutilities');
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