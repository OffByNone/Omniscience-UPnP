'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DeviceFactory = require('./Factories/DeviceFactory');
var ServiceMethodFactory = require('./Factories/ServiceMethodFactory');
var ServicePropertyFactory = require('./Factories/ServicePropertyFactory');
var UPnPExtensionInfoFactory = require('./Factories/UPnPExtensionInfoFactory');
var UPnPServiceFactory = require('./Factories/UPnPServiceFactory');
var ExecutableServiceMethodFactory = require('./Factories/ExecutableServiceMethodFactory');
var ServiceExecutor = require('./Services/ServiceExecutor');
var SOAPService = require('./Services/SOAPService');
var SubscriptionService = require('./Services/SubscriptionService');
var XmlParser = require('./Services/XmlParser');
var StringUtils = require('./StringUtilities');
var DeviceLocator = require('./Searcher/DeviceLocator');
var ActiveSearcher = require('./Searcher/ActiveSearcher');
var ParameterValidator = require('./Services/ParameterValidator');
//const AccessPointSearcher = require('./Searcher/AccessPointSearcher'); //todo: add this back in
var PassiveSearcher = require('./Searcher/PassiveSearcher');
var SSDPClient = require('./Searcher/SSDPClient');
var Constants = require('./Constants');
var DeviceService = require('./Services/DeviceService');

var _require = require('omniscience-utilities');

var Utilities = _require.Utilities;

var SdkResolver = require('omniscience-sdk-resolver');

var UPnP = (function () {
	function UPnP() {
		_classCallCheck(this, UPnP);

		this._sdk = new SdkResolver().resolve();
		this._utilities = new Utilities();
	}

	_createClass(UPnP, [{
		key: 'createDeviceService',
		value: function createDeviceService() {
			var _this = this;

			return this.createDeviceLocator().then(function (deviceLocator) {
				return new DeviceService(new DeviceFactory(new XmlParser(_this._sdk.createDomParser()), _this._utilities.createUrlProvider(), _this._utilities.MD5(), new UPnPServiceFactory(_this._utilities.fetch(), new XmlParser(_this._sdk.createDomParser()), _this._utilities.createUrlProvider(), UPnPExtensionInfoFactory, new ServicePropertyFactory(new XmlParser(_this._sdk.createDomParser())), new ServiceMethodFactory(new XmlParser(_this._sdk.createDomParser())), ServiceExecutor, new ExecutableServiceMethodFactory(new XmlParser(_this._sdk.createDomParser()), new SOAPService(_this._utilities.fetch(), new XmlParser(_this._sdk.createDomParser()), StringUtils), ParameterValidator)), UPnPExtensionInfoFactory), deviceLocator, _this._sdk.createStorageService(), _this._sdk.notifications(), _this._utilities.fetch(), _this._utilities.MD5());
			});
		}
	}, {
		key: 'createSubscriptionService',
		value: function createSubscriptionService() {
			return new SubscriptionService(this._utilities.fetch());
		}
	}, {
		key: 'getServiceExecutor',
		value: function getServiceExecutor() {
			return ServiceExecutor;
		}
	}, {
		key: 'createDeviceLocator',
		value: function createDeviceLocator() {
			var _this2 = this;

			return this._sdk.IPResolver.resolveIPs().then(function (ipAddresses) {
				return new DeviceLocator(_this2._sdk.timers(), _this2._utilities.fetch(), new ActiveSearcher(_this2.createSSDPClients(ipAddresses)), new PassiveSearcher(_this2.createSSDPClients(ipAddresses, Constants.MulticastPort)), new XmlParser(_this2._sdk.createDomParser()));
			});
		}
	}, {
		key: 'createSSDPClients',
		value: function createSSDPClients(ipAddresses, sourcePort) {
			var _this3 = this;

			return ipAddresses.map(function (ipAddress) {
				try {
					var socket = _this3._sdk.createUDPSocket();
					socket.init(sourcePort);
					var ssdpClient = new SSDPClient(StringUtils, socket);
					ssdpClient.setMulticastInterface(ipAddress);
					return ssdpClient;
				} catch (error) {}
			}).filter(function (ssdpClient) {
				return ssdpClient;
			});
		}
	}]);

	return UPnP;
})();

module.exports = UPnP;