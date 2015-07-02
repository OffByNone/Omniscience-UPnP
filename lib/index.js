"use strict";

const DeviceFactory = require('./Factories/DeviceFactory');
const ServiceInfoFactory = require('./Factories/ServiceInfoFactory');
const ExecutableServiceFactory = require('./Factories/ExecutableServiceFactory');
const ServiceExecutor = require('./Services/ServiceExecutor');
const SOAPService = require('./Services/SOAPService');
const SubscriptionService = require('./Services/SubscriptionService');
const XmlParser = require('./Services/XmlParser');
const DeviceXmlParser = require('./Services/DeviceXmlParser');
const StringUtils = require('./StringUtilities');
const DeviceLocator = require('./Searcher/DeviceLocator');
const ActiveSearcher = require('./Searcher/ActiveSearcher');
//const AccessPointSearcher = require('./Searcher/AccessPointSearcher'); //todo: add this back in
const PassiveSearcher = require('./Searcher/PassiveSearcher');
const SSDPClient = require('./Searcher/SSDPClient');
const Constants = require('./Constants');
const DeviceService = require('./Services/DeviceService');

const { Utilities } = require('omniscience-utilities');
const SdkResolver = require("omniscience-sdk-resolver");

class UPnP {
	constructor(sdk) {
		this._sdk = new SdkResolver().resolve();
		this._utilities = new Utilities();
		this._serviceExecutor = new ServiceExecutor(
			new ServiceInfoFactory(this._utilities.fetch(), new XmlParser(this._sdk.createDomParser()), this._utilities.createUrlProvider(), this._utilities.MD5()),
			new ExecutableServiceFactory(new XmlParser(this._sdk.createDomParser()), new SOAPService(this._utilities.fetch(), this._sdk.createDomParser(), StringUtils)));;
	}
	createDeviceService() {
		return this._createDeviceLocator().then((deviceLocator) => {
			return new DeviceService(
				new DeviceFactory(this._utilities.fetch(), new XmlParser(this._sdk.createDomParser()), this._utilities.createUrlProvider(), this._utilities.MD5(),
					new DeviceXmlParser(new XmlParser(this._sdk.createDomParser()), this._utilities.createUrlProvider(), this._utilities.MD5()))
				, deviceLocator, this._sdk.storage(), this._serviceExecutor, this._sdk.notifications());
		});
	}
	createSubscriptionService() {
		return new SubscriptionService(this._utilities.fetch());
	}
	getServiceExecutor() {
		return this._serviceExecutor;
	}
	_createDeviceLocator() {
		return this._sdk.IPResolver.resolveIPs().then((ipAddresses) => {
			return new DeviceLocator(this._sdk.timers(), this._utilities.fetch(),
				new ActiveSearcher(this.createSSDPClients(ipAddresses)),
				new PassiveSearcher(this.createSSDPClients(ipAddresses, Constants.MulticastPort)));
		});
	}
	createSSDPClients(ipAddresses, sourcePort) {
		return ipAddresses.map((ipAddress) => {
			let ssdpClient = new SSDPClient(StringUtils, this._sdk.udp.createUDPSocket(sourcePort));
			ssdpClient.setMulticastInterface(ipAddress);
			return ssdpClient;
		});
	}	
}

module.exports = UPnP;