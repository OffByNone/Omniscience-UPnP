'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DeviceFactory = require('./Factories/DeviceFactory');
var ServiceInfoFactory = require('./Factories/ServiceInfoFactory');
var ExecutableServiceFactory = require('./Factories/ExecutableServiceFactory');
var ServiceExecutor = require('./Services/ServiceExecutor');
var SOAPService = require('./Services/SOAPService');
var SubscriptionService = require('./Services/SubscriptionService');
var XmlParser = require('./XmlParser');
var StringUtils = require('./StringUtilities');

var Utils = require('omniscience-utilities');

var CompositionRoot = (function () {
	function CompositionRoot(sdk) {
		_classCallCheck(this, CompositionRoot);

		this._sdk = sdk;
	}

	_createClass(CompositionRoot, [{
		key: 'createDeviceFactory',
		value: function createDeviceFactory() {
			return new DeviceFactory(Utils.fetch(), new XmlParser(this._sdk.createDomParser()), Utils.createUrlProvider(), Utils.MD5());
		}
	}, {
		key: 'createSubscriptionService',
		value: function createSubscriptionService() {
			return new SubscriptionService(Utils.fetch());
		}
	}, {
		key: 'createServiceExecutor',
		value: function createServiceExecutor() {
			return new ServiceExecutor(new ServiceInfoFactory(Utils.fetch(), new XmlParser(this._sdk.createDomParser()), Utils.createUrlProvider(), Utils.MD5()), new ExecutableServiceFactory(new XmlParser(this._sdk.createDomParser()), new SOAPService(Utils.fetch(), this._sdk.createDomParser(), StringUtils)));
		}
	}]);

	return CompositionRoot;
})();

module.exports = CompositionRoot;