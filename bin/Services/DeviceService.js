/* global Promise */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var Constants = require('../Constants');

var _require = require('omniscience-utilities');

var Eventable = _require.Eventable;

var Device = require('../Entities/Device');

var DeviceService = (function (_Eventable) {
	function DeviceService(deviceFactory, deviceLocator, storageService, notifications, fetch, md5) {
		_classCallCheck(this, DeviceService);

		_get(Object.getPrototypeOf(DeviceService.prototype), 'constructor', this).call(this);
		this._deviceFactory = deviceFactory;
		this._storageService = storageService;
		this._deviceLocator = deviceLocator;
		this._notifications = notifications;
		this._fetch = fetch;
		this._md5 = md5;
		this._isInitialized = false;

		this.devices = [];
		/* todo: this is now a race condition full of problems
   * what if we execute a search before we resolve the promise?
   */
		this._storageService.get('devices').then(function (devices) {});
	}

	_inherits(DeviceService, _Eventable);

	_createClass(DeviceService, [{
		key: 'loadDevices',
		value: function loadDevices() {
			var _this = this;

			this.devices.forEach(function (device) {
				return _this.emit('deviceFound', device);
			});
		}
	}, {
		key: 'stop',
		value: function stop() {
			this._deviceLocator.stop();
		}
	}, {
		key: 'search',
		value: function search() {
			var _this2 = this;

			if (!this._isInitialized) {
				this._deviceLocator.on('deviceFound', function (id, location, fromAddress, serverIP) {
					if (location.toLowerCase().indexOf('http') !== 0) location = 'http://' + location; //Microsoft special
					_this2._fetch(location).then(function (response) {
						var deviceXml = response._bodyText;
						var deviceResponseHash = _this2._md5(deviceXml);
						var device = _this2.devices.filter(function (device) {
							return device.id === id;
						})[0];

						if (!device || deviceResponseHash !== device.responseHash && device.fromAddress === fromAddress) {
							/* for devices that show up on multiple network interfaces, their response hashes will be different, and their fromAddresses will also be different
        * don't rebuild if it is simply the same device on a different network interface
        */
							device = device || new Device();

							try {
								_this2._deviceFactory.create(device, deviceXml, location, fromAddress, serverIP);
								_this2._addDevice(device);
							} catch (err) {
								console.log(err);
							}
							/*todo: either root node or device node were missing.  probably log a warning/error to the console.*/
						}
					});
				});
				this._deviceLocator.on('deviceLost', function (id) {
					return _this2._removeDevice(id);
				});
				this._isInitialized = true;
			}

			this._deviceLocator.search(this.devices);
		}
	}, {
		key: '_removeDevice',
		value: function _removeDevice(id) {
			for (var i = 0; i < this.devices.length; i++) {
				if (this.devices[i].id === id) {
					var lostDevice = this.devices.splice(i, 1)[0];
					this.emit('deviceLost', lostDevice);
					this._saveDeviceList();
					return;
				}
			}
		}
	}, {
		key: '_addDevice',
		value: function _addDevice(device) {
			var isNew = this.devices.every(function (existingDevice) {
				return existingDevice.id !== device.id;
			});
			if (isNew) {
				this.devices.push(device);
				this._notifications.notify({
					title: 'Found ' + device.name,
					text: 'a ' + device.model.name + ' by ' + device.manufacturer.name,
					iconURL: /*device.icons.length > 0 && device.icons[0].url ? device.icons[0].url.href :*/Constants.defaultIcon
				});
			}
			this._saveDeviceList();
			this.emit('deviceFound', device);
		}
	}, {
		key: '_saveDeviceList',
		value: function _saveDeviceList() {
			this._storageService.set('devices', this.devices);
		}
	}]);

	return DeviceService;
})(Eventable);

module.exports = DeviceService;

/*this.devices = devices || [];*/