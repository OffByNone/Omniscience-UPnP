/* global Promise */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var Device = require('../Entities/Device');
var UPnPVersion = require('../Entities/UPnPVersion');
var DeviceManufacturer = require('../Entities/DeviceManufacturer');
var DeviceModel = require('../Entities/DeviceModel');
var Icon = require('../Entities/Icon');

var _require = require('omniscience-utilities');

var Eventable = _require.Eventable;

var DeviceFactory = (function (_Eventable) {
	function DeviceFactory(xmlParser, urlProvider, md5, upnpServiceFactory, upnpExtensionInfoFactory, xhr, base64Utils) {
		_classCallCheck(this, DeviceFactory);

		_get(Object.getPrototypeOf(DeviceFactory.prototype), 'constructor', this).call(this);
		this._xmlParser = xmlParser;
		this._urlProvider = urlProvider;
		this._md5 = md5;
		this._upnpServiceFactory = upnpServiceFactory;
		this._upnpExtensionInfoFactory = upnpExtensionInfoFactory;
		this._xhr = xhr;
		this._base64Utils = base64Utils;
	}

	_inherits(DeviceFactory, _Eventable);

	_createClass(DeviceFactory, [{
		key: 'build',
		value: function build(responseText, location, fromAddress, serverIP) {
			var responseXml = this._xmlParser.parseFromString(responseText);
			var responseHash = this._md5(responseText);

			var root = this._xmlParser.getElement(responseXml, 'root');
			if (!root) throw new Error('Required element \'root\' was not found in responseXml');

			var base = this._xmlParser.getText(root, 'baseUrl');
			var upnpVersion = new UPnPVersion();
			upnpVersion.major = this._xmlParser.getText(root, 'specVersion major');
			upnpVersion.minor = this._xmlParser.getText(root, 'specVersion minor');

			var deviceXml = this._xmlParser.getElement(root, 'device');
			if (!deviceXml) throw new Error('Required element \'device\' was not found inside \'root\' node');

			this._parseDeviceAttributes(deviceXml, responseHash, serverIP, fromAddress, location, upnpVersion, base);
		}
	}, {
		key: '_parseDeviceAttributes',
		value: function _parseDeviceAttributes(deviceXml, responseHash, serverIP, fromAddress, location, upnpVersion, base) {
			var _this = this;

			var device = new Device();

			device.serialNumber = this._xmlParser.getText(deviceXml, 'serialNumber');
			device.webPage = this._xmlParser.getText(deviceXml, 'presentationURL');
			device.name = this._xmlParser.getText(deviceXml, 'friendlyName');
			device.id = this._xmlParser.getText(deviceXml, 'UDN').replace(/uuid\:/, '');

			device.type = this._upnpExtensionInfoFactory.create(this._xmlParser.getText(deviceXml, 'deviceType'));
			device.manufacturer = new DeviceManufacturer();
			device.manufacturer.name = this._xmlParser.getText(deviceXml, 'manufacturer');
			device.manufacturer.url = this._xmlParser.getText(deviceXml, 'manufacturerURL');
			device.model = new DeviceModel();
			device.model.number = this._xmlParser.getText(deviceXml, 'modelNumber');
			device.model.description = this._xmlParser.getText(deviceXml, 'modelDescription');
			device.model.name = this._xmlParser.getText(deviceXml, 'modelName');
			device.model.url = this._xmlParser.getText(deviceXml, 'modelUrl');
			device.upc = this._xmlParser.getText(deviceXml, 'UPC');

			device.address = this._urlProvider.createUrl(base || this._urlProvider.createUrl(location).origin);
			device.ssdpDescription = this._urlProvider.createUrl(location);
			device.responseHash = responseHash;
			device.fromAddress = fromAddress;
			device.serverIP = serverIP;

			var subDevices = this._xmlParser.getElements(deviceXml, 'deviceList device');
			subDevices.forEach(function (subDeviceXml) {
				_this._parseDeviceAttributes(subDeviceXml, responseHash, serverIP, fromAddress, location, upnpVersion, base);
			});

			this._parseDeviceIcons(device, deviceXml, location, base).then(function () {
				var servicesXml = _this._xmlParser.getElements(deviceXml, 'serviceList service');
				servicesXml.forEach(function (serviceXml) {
					var serviceInfo = _this._upnpServiceFactory.create(serviceXml, location, base, serverIP);
					device.services.push(serviceInfo);
				});

				_this.emit('deviceBuilt', device);
			});
		}
	}, {
		key: '_parseDeviceIcons',
		value: function _parseDeviceIcons(device, deviceXml, location, base) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {
				var iconsXml = _this2._xmlParser.getElements(deviceXml, 'iconList icon');
				if (!iconsXml.length) {
					resolve();
				} else {
					(function () {
						var icons = [];
						iconsXml.forEach(function (iconXml) {
							var icon = new Icon();
							icon.mimeType = _this2._xmlParser.getText(iconXml, 'mimetype');
							icon.width = _this2._xmlParser.getText(iconXml, 'width');
							icon.height = _this2._xmlParser.getText(iconXml, 'height');
							icon.depth = _this2._xmlParser.getText(iconXml, 'depth');
							icon.url = _this2._urlProvider.toUrl(_this2._xmlParser.getText(iconXml, 'url'), location, base);
							console.log('width: ' + Number.parseInt(icon.width, 10) + ' height: ' + Number.parseInt(icon.height, 10));
							icon.area = (!isNaN(Number.parseInt(icon.width, 10)) ? Number.parseInt(icon.width, 10) : 1) * (!isNaN(Number.parseInt(icon.height, 10)) ? Number.parseInt(icon.height, 10) : 1);
							icons.push(icon);
						});
						//Find the biggest png or the biggest image if no png
						var sortFunc = function sortFunc(a, b) {
							if (a.area <= b.area) return 1;
							return -1;
						};
						var pngIcons = icons.filter(function (icon) {
							return icon.mimeType === 'image/png';
						}).sort(sortFunc);
						if (pngIcons && pngIcons.length) {
							device.icon = pngIcons[0];
						} else {
							icons.sort(sortFunc).filter(function (icon) {
								return true;
							});
							device.icon = icons.sort(sortFunc)[0];
						}

						if (device.icon.url && device.icon.url.href) {
							_this2._getImage(device.icon.url.href, device.icon.mimeType).then(function (response) {
								device.icon.base64Image = response;
								resolve();
							});
						} else {
							device.icon.base64Image = '';
							resolve();
						}
					})();
				}
			});
		}
	}, {
		key: '_getImage',

		/*_base64EncodeImage(binaryImage) {
  	let uInt8Array = new Uint8Array(binaryImage);
      let arrayLength = uInt8Array.length;
      let binaryString = new Array(arrayLength);
      while (arrayLength--) {
        binaryString[arrayLength] = String.fromCharCode(uInt8Array[arrayLength]);
      }
      let data = binaryString.join('');
  
      let base64 = window.btoa(data);
      return "data:image/jpeg;base64," + base64;
  }*/
		value: function _getImage(url, mimeType) {
			var _this3 = this;

			return new Promise(function (resolve, reject) {
				var xhr = new _this3._xhr();
				xhr.open('GET', url, true);
				xhr.responseType = 'arraybuffer';
				xhr.onload = function (e) {
					if (e.target.status == 200) {
						var uInt8Array = new Uint8Array(e.target.response);
						var i = uInt8Array.length;
						var binaryString = new Array(i);
						while (i--) {
							binaryString[i] = String.fromCharCode(uInt8Array[i]);
						}
						var base64 = _this3._base64Utils.encode(binaryString.join(''));
						resolve('data:' + mimeType + ';base64,' + base64);
					} else {
						reject();
					}
				};
				xhr.send();
			});
		}
	}]);

	return DeviceFactory;
})(Eventable);

module.exports = DeviceFactory;