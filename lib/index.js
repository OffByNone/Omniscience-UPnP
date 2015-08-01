"use strict";

const DeviceFactory = require('./Factories/DeviceFactory');
const ServiceMethodFactory = require('./Factories/ServiceMethodFactory');
const ServicePropertyFactory = require('./Factories/ServicePropertyFactory');
const UPnPExtensionInfoFactory = require('./Factories/UPnPExtensionInfoFactory');
const UPnPServiceFactory = require('./Factories/UPnPServiceFactory');
const ExecutableServiceMethodFactory = require('./Factories/ExecutableServiceMethodFactory');
const ServiceExecutor = require('./Services/ServiceExecutor');
const SOAPService = require('./Services/SOAPService');
const SubscriptionService = require('./Services/SubscriptionService');
const XmlParser = require('./Services/XmlParser');
const StringUtils = require('./StringUtilities');
const DeviceLocator = require('./Searcher/DeviceLocator');
const ActiveSearcher = require('./Searcher/ActiveSearcher');
const ParameterValidator = require('./Services/ParameterValidator');
//const AccessPointSearcher = require('./Searcher/AccessPointSearcher'); //todo: add this back in
const PassiveSearcher = require('./Searcher/PassiveSearcher');
const SSDPClient = require('./Searcher/SSDPClient');
const Constants = require('./Constants');
const DeviceService = require('./Services/DeviceService');

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
					UPnPExtensionInfoFactory),
				deviceLocator,
				this._sdk.createStorageService(),
				this._sdk.notifications(), this._utilities.fetch(),
				this._utilities.MD5());
		});
	}
	createSubscriptionService() {
		return new SubscriptionService(this._utilities.fetch());
	}
	getServiceExecutor() {
		return ServiceExecutor;
	}
	createDeviceLocator() {
		return this._sdk.IPResolver.resolveIPs().then((ipAddresses) => {
			return new DeviceLocator(this._sdk.timers(), this._utilities.fetch(),
				new ActiveSearcher(this.createSSDPClients(ipAddresses)),
				new PassiveSearcher(this.createSSDPClients(ipAddresses, Constants.MulticastPort)),
				new XmlParser(this._sdk.createDomParser()));
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