'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DeviceFactory = require('./Factories/DeviceFactory');
var UDPSocketFactory = require('./Factories/UDPSocketFactory');
var ServiceInfoFactory = require('./Factories/ServiceInfoFactory');
var ExecutableServiceFactory = require('./Factories/ExecutableServiceFactory');
var ServiceExecutor = require('./Services/ServiceExecutor');
var SOAPService = require('./Services/SOAPService');
var SubscriptionService = require('./Services/SubscriptionService');
var XmlParser = require('./XmlParser');
var StringUtils = require('./StringUtilities');

var Utils = require('omniscienceutilities');
var fetch = require('fetch');
var MD5 = require('md5');

var CompositionRoot = (function () {
	function CompositionRoot(sdk) {
		_classCallCheck(this, CompositionRoot);

		this._sdk = sdk;
	}

	_createClass(CompositionRoot, [{
		key: 'createDeviceFactory',
		value: function createDeviceFactory() {
			return new DeviceFactory(fetch, new XmlParser(this._sdk.createDOMParser()), Utils.createUrlProvider(), MD5);
		}
	}, {
		key: 'createSubscriptionService',
		value: function createSubscriptionService() {
			return new SubscriptionService(fetch);
		}
	}, {
		key: 'createServiceExecutor',
		value: function createServiceExecutor() {
			return new ServiceExecutor(new ServiceInfoFactory(fetch, new XmlParser(this._sdk.createDOMParser()), Utils.createUrlProvider(), MD5), new ExecutableServiceFactory(new XmlParser(this._sdk.createDOMParser()), new SOAPService(fetch, this._sdk.createDOMParser(), StringUtils)));
		}
	}]);

	return CompositionRoot;
})();

module.exports = CompositionRoot;