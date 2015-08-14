"use strict";

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

var SdkResolver = require("omniscience-sdk-resolver");

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
        return new DeviceService(new DeviceFactory(new XmlParser(_this._sdk.createDomParser()), _this._utilities.createUrlProvider(), _this._utilities.MD5(), new UPnPServiceFactory(_this._utilities.fetch(), new XmlParser(_this._sdk.createDomParser()), _this._utilities.createUrlProvider(), UPnPExtensionInfoFactory, new ServicePropertyFactory(new XmlParser(_this._sdk.createDomParser())), new ServiceMethodFactory(new XmlParser(_this._sdk.createDomParser())), ServiceExecutor, new ExecutableServiceMethodFactory(new XmlParser(_this._sdk.createDomParser()), new SOAPService(_this._utilities.fetch(), new XmlParser(_this._sdk.createDomParser()), StringUtils), ParameterValidator)), UPnPExtensionInfoFactory, _this._sdk.XMLHttpRequest()), deviceLocator, _this._sdk.createStorageService(), _this._sdk.notifications(), _this._utilities.fetch(), _this._utilities.MD5());
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

      return this._sdk.createIPResolver().resolveIPs().then(function (ipAddresses) {
        return new DeviceLocator(_this2._sdk.timers(), _this2._utilities.fetch(), new ActiveSearcher(_this2.createSSDPClients(ipAddresses)), new PassiveSearcher(_this2.createSSDPClients(ipAddresses, Constants.MulticastPort)), new XmlParser(_this2._sdk.createDomParser()), _this2._sdk.createSimpleTCP());
      });
    }
  }, {
    key: 'createSSDPClients',
    value: function createSSDPClients(ipAddresses, sourcePort) {
      var _this3 = this;

      return ipAddresses.map(function (ipAddress) {
        try {
          var socket = _this3._sdk.createUDPSocket();
          socket.init(sourcePort, ipAddress, Constants.MulticastIP);
          var ssdpClient = new SSDPClient(StringUtils, socket);
          return ssdpClient;
        } catch (error) {
          console.log(error);
        }
      }).filter(function (ssdpClient) {
        return ssdpClient;
      });
    }
  }]);

  return UPnP;
})();

module.exports = UPnP;

// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function isCallable(fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function toInteger(value) {
      var number = Number(value);
      if (isNaN(number)) {
        return 0;
      }
      if (number === 0 || !isFinite(number)) {
        return number;
      }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function toLength(value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike /*, mapFn, thisArg */) {
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
  })();
}