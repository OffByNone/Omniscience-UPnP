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
					UPnPExtensionInfoFactory,
					this._sdk.XMLHttpRequest()),
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
		return this._sdk.createIPResolver().resolveIPs().then((ipAddresses) => {
			return new DeviceLocator(this._sdk.timers(), this._utilities.fetch(),
				new ActiveSearcher(this.createSSDPClients(ipAddresses)),
				new PassiveSearcher(this.createSSDPClients(ipAddresses, Constants.MulticastPort)),
				new XmlParser(this._sdk.createDomParser()),
				this._sdk.createSimpleTCP());
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

// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else      
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}