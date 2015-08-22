'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var Constants = require('../Constants');

var _require = require('omniscience-utilities');

var Eventable = _require.Eventable;

var DeviceLocator = (function (_Eventable) {
	function DeviceLocator(timer, fetch, activeSearcher, passiveSearcher, xmlParser, simpleTCP, urlProvider) {
		_classCallCheck(this, DeviceLocator);

		_get(Object.getPrototypeOf(DeviceLocator.prototype), 'constructor', this).call(this);
		this._timer = timer;
		this._fetch = fetch;
		this._activeSearcher = activeSearcher;
		this._passiveSearcher = passiveSearcher;
		this._xmlParser = xmlParser;
		this._simpleTCP = simpleTCP;
		this._urlProvider = urlProvider;

		this.debounceTimeout = 15000;
		this._deviceTimeouts = {};
		this._deviceLastResponses = {};

		this._isInitialized = false;
	}

	_inherits(DeviceLocator, _Eventable);

	_createClass(DeviceLocator, [{
		key: '_initializeSearchers',
		value: function _initializeSearchers() {
			var _this = this;

			this._activeSearcher.on('found', function (headers, ignoreDebounce) {
				return _this._deviceFound(headers, ignoreDebounce);
			});
			this._passiveSearcher.on('found', function (headers, ignoreDebounce) {
				return _this._deviceFound(headers, ignoreDebounce);
			});
			this._passiveSearcher.on('lost', function (headers) {
				return _this.emit('deviceLost', headers.usn.split('::')[0]);
			});
			this._passiveSearcher.listen();

			this._isInitialized = true;
		}
	}, {
		key: 'search',
		value: function search(devices) {
			var _this2 = this;

			if (!this._isInitialized) this._initializeSearchers();

			devices.forEach(function (device) {
				_this2._checkForLostDevice(device.ssdpDescription, device.id, false).then(function (found) {
					if (!found) {
						delete _this2._deviceLastResponses[device.id];
						_this2.emit('deviceLost', device.id);
					}
				});
			});

			this._activeSearcher.search();
		}
	}, {
		key: 'stop',
		value: function stop() {
			this._activeSearcher.stop();
			this._passiveSearcher.stop();
		}
	}, {
		key: '_deviceFound',
		value: function _deviceFound(headers, ignoreDebounce) {
			var _this3 = this;

			var id = Constants.uuidRegex.exec(headers.usn)[1];

			if (this._deviceTimeouts.hasOwnProperty(id)) this._timer.clearTimeout(this._deviceTimeouts[id]);

			var waitTimeInSeconds = Constants.defaultDeviceTimeoutInSeconds;

			if (headers.hasOwnProperty('cache-control')) waitTimeInSeconds = headers['cache-control'].split('=')[1];

			this._deviceTimeouts[id] = this._timer.setTimeout(function () {
				_this3._checkForLostDevice(_this3._urlProvider.toUrl(headers.location), id).then(function (found) {
					if (!found) {
						delete _this3._deviceLastResponses[id];
						_this3.emit('deviceLost', id);
					} else {
						_this3._deviceFound(headers, true);
					}
				});
			}, waitTimeInSeconds * 1000);

			var lastResponse = this._deviceLastResponses[id];
			var currentTime = Date.now();
			if (lastResponse && lastResponse + this.debounceTimeout < currentTime || ignoreDebounce || !lastResponse) {
				this._deviceLastResponses[id] = currentTime;
				this.emit('deviceFound', id, headers.location, headers.fromAddress, headers.serverIP);
			}
		}
	}, {
		key: '_checkForLostDevice',
		value: function _checkForLostDevice(location, id) {
			var _this4 = this;

			return this._simpleTCP.ping(location.hostname, location.port).then(function (deviceFound) {
				if (!deviceFound) return false;

				return _this4._fetch(location).then(function (response) {
					if (!response.ok) return false;else {
						var responseXml = _this4._xmlParser.parseFromString(response._bodyText);
						var deviceIdElements = _this4._xmlParser.getElements(responseXml, 'UDN');
						return deviceIdElements.some(function (deviceIdElement) {
							return id === deviceIdElement.innerHTML.replace('uuid:', '');
						});
						//check the xml to make sure what we got back has the same id as what we were looking for --my matchstick gets a new ip on each boot
						//also make sure to check against all UDN elements as sub devices will have their own and we don't know what we are looking for
					}
				}, function (err) {
					return false;
				}); /*error occured while trying to ping device, consider lost.*/
			});
		}
	}]);

	return DeviceLocator;
})(Eventable);

module.exports = DeviceLocator;