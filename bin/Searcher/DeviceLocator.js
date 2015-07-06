'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var Constants = require('../Constants');

var _require = require('omniscience-utilities');

var Eventable = _require.Eventable;

var DeviceLocator = (function (_Eventable) {
	function DeviceLocator(timer, fetch, activeSearcher, passiveSearcher) {
		_classCallCheck(this, DeviceLocator);

		_get(Object.getPrototypeOf(DeviceLocator.prototype), 'constructor', this).call(this);
		this._timer = timer;
		this._fetch = fetch;
		this._activeSearcher = activeSearcher;
		this._passiveSearcher = passiveSearcher;

		this.debounceTimeout = 15000;
		this._deviceTimeouts = {};
		this._deviceLastResponses = {};

		this._isInitialized = false;
	}

	_inherits(DeviceLocator, _Eventable);

	_createClass(DeviceLocator, [{
		key: 'search',
		value: function search(devices) {
			var _this = this;

			if (!this._isInitialized) this._initializeSearchers();
			if (Array.isArray(devices)) devices.forEach(function (device) {
				return _this._checkForLostDevice(device);
			});

			this._activeSearcher.search();
			this._passiveSearcher.search();
		}
	}, {
		key: '_initializeSearchers',
		value: function _initializeSearchers() {
			var _this2 = this;

			this._activeSearcher.on('found', function (headers, ignoreDebounce) {
				return _this2._deviceFound(headers, ignoreDebounce);
			});

			this._passiveSearcher.on('found', function (headers, ignoreDebounce) {
				return _this2._deviceFound(headers, ignoreDebounce);
			});
			this._passiveSearcher.on('lost', function (headers) {
				return _this2.emit('deviceLost', headers.usn.split('::')[0]);
			});

			this._isInitialized = true;
		}
	}, {
		key: '_deviceFound',
		value: function _deviceFound(headers, ignoreDebounce) {
			var _this3 = this;

			var id = Constants.uuidRegex.exec(headers.usn)[1];

			this._timer.clearTimeout(this._deviceTimeouts[id]);
			if (headers.hasOwnProperty('cache-control')) {
				var waitTime = headers['cache-control'].split('=')[1] * 1000;
				this._deviceTimeouts[id] = this._timer.setTimeout(function () {
					_this3._fetch(headers.location, { method: 'head' }).then(function () {
						return _this3._deviceFound(headers, true);
					}, function () {
						return _this3.emit('deviceLost', id);
					});
					//todo: looks like some devices don't support the head request and return a 501 not implemented.
					//I am not entirely sure this is what is happening as I just get a 501 not implemented but this is my best guess as the page it was coming from does exist
					//below is the exact error message I get in the log
					//HEAD XHR http://192.168.1.1:54080/rootDesc.xml [HTTP/1.1 501 Not Implemented 24ms]
				}, waitTime);
			}
			var lastResponse = this._deviceLastResponses[id];
			var currentTime = Date.now();
			if (lastResponse && lastResponse + this.debounceTimeout < currentTime || ignoreDebounce || !lastResponse) {
				this._deviceLastResponses[id] = currentTime;
				this.emit('deviceFound', id, headers.location, headers.fromAddress, headers.serverIP);
			}
		}
	}, {
		key: '_checkForLostDevice',
		value: function _checkForLostDevice(device) {
			var _this4 = this;

			this._fetch(device.ssdpDescription, { method: 'head' }).then(function (response) {}, function (response) {
				/*pinging device errored out, consider lost.*/
				_this4.emit('deviceLost', device.id);
			});
		}
	}]);

	return DeviceLocator;
})(Eventable);

module.exports = DeviceLocator;
/*we heard back from device, do nothing.*/