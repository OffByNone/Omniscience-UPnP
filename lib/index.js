"use strict";

const Constants = require('./Constants');
const XmlParser = require('./Services/XmlParser');
const SSDPClient = require('./Searcher/SSDPClient');
const StringUtils = require('./StringUtilities');
const SOAPService = require('./Services/SOAPService');
const DeviceService = require('./Services/DeviceService');
const DeviceLocator = require('./Searcher/DeviceLocator');
const DeviceFactory = require('./Factories/DeviceFactory');
const ActiveSearcher = require('./Searcher/ActiveSearcher');
const ServiceExecutor = require('./Services/ServiceExecutor');
const PassiveSearcher = require('./Searcher/PassiveSearcher');
const ParameterValidator = require('./Services/ParameterValidator');
const UPnPServiceFactory = require('./Factories/UPnPServiceFactory');
const SubscriptionService = require('./Services/SubscriptionService');
const ServiceMethodFactory = require('./Factories/ServiceMethodFactory');
const ServicePropertyFactory = require('./Factories/ServicePropertyFactory');
const UPnPExtensionInfoFactory = require('./Factories/UPnPExtensionInfoFactory');
const ExecutableServiceMethodFactory = require('./Factories/ExecutableServiceMethodFactory');
//const AccessPointSearcher = require('./Searcher/AccessPointSearcher'); //todo: add this back in

const { Utilities } = require('omniscience-utilities');
const SdkResolver = require("omniscience-sdk-resolver");

class UPnP {
	constructor() {
		this._sdk = new SdkResolver().resolve();
		this._utilities = new Utilities();
	}
	createDeviceService() {
		return this.createDeviceLocator().then((deviceLocator) => {
			return new DeviceService(
				new DeviceFactory(
					new XmlParser(this._sdk.createDomParser()),
					this._utilities.createUrlProvider(),
					this._utilities.MD5(),
					new UPnPServiceFactory(
						this._utilities.fetch(),
						this._utilities.MD5(),
						new XmlParser(this._sdk.createDomParser()),
						this._utilities.createUrlProvider(),
						UPnPExtensionInfoFactory,
						new ServicePropertyFactory(new XmlParser(this._sdk.createDomParser())),
						new ServiceMethodFactory(new XmlParser(this._sdk.createDomParser())),
						ServiceExecutor,
						new ExecutableServiceMethodFactory(
							new XmlParser(this._sdk.createDomParser()),
							new SOAPService(this._utilities.fetch(), new XmlParser(this._sdk.createDomParser()), StringUtils),
							ParameterValidator)),
					UPnPExtensionInfoFactory,
					this._sdk.XMLHttpRequest(),
					this._sdk.createBase64Utils()),
				deviceLocator,
				this._sdk.createStorageService(),
				this._sdk.notifications(), this._utilities.fetch(),
				this._utilities.MD5(),
				this._sdk.timers());
		});
	}
	createSubscriptionService() {
		return new SubscriptionService(this._utilities.fetch());
	}
	getServiceExecutor() {
		return ServiceExecutor;
	}
	createDeviceLocator() {
		return this._sdk.createIPResolver().resolveIPs().then((ipAddresses) => {
			return new DeviceLocator(this._sdk.timers(), this._utilities.fetch(),
				new ActiveSearcher(this.createSSDPClients(ipAddresses)),
				new PassiveSearcher(this.createSSDPClients(ipAddresses, Constants.MulticastPort)),
				new XmlParser(this._sdk.createDomParser()),
				this._sdk.createSimpleTCP(),
				this._utilities.createUrlProvider());
		});
	}
	createSSDPClients(ipAddresses, sourcePort) {
		return ipAddresses.map((ipAddress) => {
			try {
				let socket = this._sdk.createUDPSocket();
				socket.init(sourcePort, ipAddress, Constants.MulticastIP);
				let ssdpClient = new SSDPClient(StringUtils, socket);
				return ssdpClient;
			}
			catch (error) {
				console.log(error);
			}
		}).filter(ssdpClient => ssdpClient);
	}
}

module.exports = UPnP;