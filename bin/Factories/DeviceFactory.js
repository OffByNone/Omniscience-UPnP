/* global Promise */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var UPnPVersion = require('../Entities/UPnPVersion');
var DeviceManufacturer = require('../Entities/DeviceManufacturer');
var DeviceModel = require('../Entities/DeviceModel');
var Icon = require('../Entities/Icon');

var DeviceFactory = (function () {
	function DeviceFactory(xmlParser, urlProvider, md5, upnpServiceFactory, upnpExtensionInfoFactory, xhr, base64Utils) {
		_classCallCheck(this, DeviceFactory);

		this._xmlParser = xmlParser;
		this._urlProvider = urlProvider;
		this._md5 = md5;
		this._upnpServiceFactory = upnpServiceFactory;
		this._upnpExtensionInfoFactory = upnpExtensionInfoFactory;
		this._xhr = xhr;
		this._base64Utils = base64Utils;
	}

	_createClass(DeviceFactory, [{
		key: 'create',
		value: function create(device, responseText, location, fromAddress, serverIP) {
			var _this = this;

			var responseXml = this._xmlParser.parseFromString(responseText);

			var root = this._xmlParser.getElement(responseXml, "root");

			if (!root) throw new Error("Required element 'root' was not found in responseXml");

			var base = this._xmlParser.getText(root, "baseUrl");
			var deviceXml = this._xmlParser.getElement(root, "device");

			if (!deviceXml) throw new Error("Required element 'device' was not found inside 'root' node");

			this._parseDeviceAttributes(device, deviceXml);
			return this._parseDeviceIcons(device, deviceXml, location, base).then(function () {
				var servicesXml = _this._xmlParser.getElements(deviceXml, "serviceList service");

				servicesXml.forEach(function (serviceXml) {
					var serviceInfo = _this._upnpServiceFactory.create(serviceXml, location, base, serverIP);
					device.services.push(serviceInfo);
				});

				device.upnpVersion = new UPnPVersion();
				device.upnpVersion.major = _this._xmlParser.getText(root, "specVersion major");
				device.upnpVersion.minor = _this._xmlParser.getText(root, "specVersion minor");

				device.address = _this._urlProvider.createUrl(base || _this._urlProvider.createUrl(location).origin);
				device.ssdpDescription = _this._urlProvider.createUrl(location);
				device.responseHash = _this._md5(responseText);
				device.fromAddress = fromAddress;
				device.serverIP = serverIP;
			});
		}
	}, {
		key: '_parseDeviceAttributes',
		value: function _parseDeviceAttributes(device, deviceXml) {
			device.serialNumber = this._xmlParser.getText(deviceXml, "serialNumber");
			device.webPage = this._xmlParser.getText(deviceXml, "presentationURL");
			device.name = this._xmlParser.getText(deviceXml, "friendlyName");
			device.id = this._xmlParser.getText(deviceXml, "UDN").replace(/uuid\:/, "");

			device.type = this._upnpExtensionInfoFactory.create(this._xmlParser.getText(deviceXml, "deviceType"));
			device.manufacturer = new DeviceManufacturer();
			device.manufacturer.name = this._xmlParser.getText(deviceXml, "manufacturer");
			device.manufacturer.url = this._xmlParser.getText(deviceXml, "manufacturerURL");
			device.model = new DeviceModel();
			device.model.number = this._xmlParser.getText(deviceXml, "modelNumber");
			device.model.description = this._xmlParser.getText(deviceXml, "modelDescription");
			device.model.name = this._xmlParser.getText(deviceXml, "modelName");
			device.model.url = this._xmlParser.getText(deviceXml, "modelUrl");
			device.upc = this._xmlParser.getText(deviceXml, "UPC");
		}
	}, {
		key: '_parseDeviceIcons',
		value: function _parseDeviceIcons(device, deviceXml, location, base) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {
				var iconsXml = _this2._xmlParser.getElements(deviceXml, "iconList icon");
				if (!iconsXml.length) {
					resolve();
				}
				iconsXml.forEach(function (iconXml) {
					var icon = new Icon();
					icon.mimeType = _this2._xmlParser.getText(iconXml, "mimetype");
					icon.width = _this2._xmlParser.getText(iconXml, "width");
					icon.height = _this2._xmlParser.getText(iconXml, "height");
					icon.depth = _this2._xmlParser.getText(iconXml, "depth");
					icon.url = _this2._urlProvider.toUrl(_this2._xmlParser.getText(iconXml, "url"), location, base);
					if (icon.url && icon.url.href) {
						_this2._getImage(icon.url.href, icon.mimeType).then(function (response) {
							icon.base64Image = response;
							device.icons.push(icon);
							resolve();
						});
					} else {
						icon.base64Image = "";
						device.icons.push(icon);
						resolve();
					}
				});
			});
		}

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
	}, {
		key: '_getImage',
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
						resolve("data:" + mimeType + ";base64," + base64);
					} else {
						reject();
					}
				};
				xhr.send();
			});
		}
	}]);

	return DeviceFactory;
})();

module.exports = DeviceFactory;