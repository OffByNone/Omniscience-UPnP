/* global Promise */
"use strict";

const Device = require('../Entities/Device');
const UPnPVersion = require('../Entities/UPnPVersion');
const DeviceManufacturer = require('../Entities/DeviceManufacturer');
const DeviceModel = require('../Entities/DeviceModel');
const Icon = require('../Entities/Icon');
const { Eventable } = require('omniscience-utilities');

class DeviceFactory extends Eventable {
    constructor(xmlParser, urlProvider, md5, upnpServiceFactory, upnpExtensionInfoFactory, xhr, base64Utils) {
		super();
        this._xmlParser = xmlParser;
        this._urlProvider = urlProvider;
        this._md5 = md5;
		this._upnpServiceFactory = upnpServiceFactory;
		this._upnpExtensionInfoFactory = upnpExtensionInfoFactory;
		this._xhr = xhr;
		this._base64Utils = base64Utils;
    }
    build(responseText, location, fromAddress, serverIP) {
		let responseXml = this._xmlParser.parseFromString(responseText);
		let responseHash = this._md5(responseText);

		let root = this._xmlParser.getElement(responseXml, "root");
		if (!root) throw new Error("Required element 'root' was not found in responseXml");

		let base = this._xmlParser.getText(root, "baseUrl");
		let upnpVersion = new UPnPVersion();
		upnpVersion.major = this._xmlParser.getText(root, "specVersion major");
		upnpVersion.minor = this._xmlParser.getText(root, "specVersion minor");

		let deviceXml = this._xmlParser.getElement(root, ":scope > device");
		if (!deviceXml) throw new Error("Required element 'device' was not found inside 'root' node");

		this._parseDeviceAttributes(deviceXml, responseHash, serverIP, fromAddress, location, upnpVersion, base);
    }
	_parseDeviceAttributes(deviceXml, responseHash, serverIP, fromAddress, location, upnpVersion, base) {
		let device = new Device();

		let deviceUDN = this._xmlParser.getText(deviceXml, ":scope > UDN");
		let deviceType = this._xmlParser.getText(deviceXml, ":scope > deviceType");

		device.serialNumber = this._xmlParser.getText(deviceXml, ":scope > serialNumber");
		device.webPage = this._xmlParser.getText(deviceXml, ":scope > presentationURL");
		device.name = this._xmlParser.getText(deviceXml, ":scope > friendlyName");
		device.uuid = deviceUDN.replace(/uuid\:/, "");
		device.upc = this._xmlParser.getText(deviceXml, ":scope > UPC");
		device.type = this._upnpExtensionInfoFactory.create(deviceType);

		device.manufacturer = new DeviceManufacturer();
		device.manufacturer.name = this._xmlParser.getText(deviceXml, ":scope > manufacturer");
		device.manufacturer.url = this._xmlParser.getText(deviceXml, ":scope > manufacturerURL");

		device.model = new DeviceModel();
		device.model.number = this._xmlParser.getText(deviceXml, ":scope > modelNumber");
		device.model.description = this._xmlParser.getText(deviceXml, ":scope > modelDescription");
		device.model.name = this._xmlParser.getText(deviceXml, ":scope > modelName");
		device.model.url = this._xmlParser.getText(deviceXml, ":scope > modelUrl");

		device.address = this._urlProvider.createUrl(base || this._urlProvider.createUrl(location).origin);
		device.ssdpDescription = this._urlProvider.createUrl(location);
		device.responseHash = responseHash;
		device.fromAddress = fromAddress;
		device.serverIP = serverIP;

		device.id = deviceUDN + "::" + deviceType;

		var subDevices = this._xmlParser.getElements(deviceXml, ":scope > deviceList > device");
		subDevices.forEach((subDeviceXml) => {
			this._parseDeviceAttributes(subDeviceXml, responseHash, serverIP, fromAddress, location, upnpVersion, base);
		});

		this._parseDeviceIcons(device, deviceXml, location, base).then(() => {
			let servicesXml = this._xmlParser.getElements(deviceXml, ":scope > serviceList > service");
			servicesXml.forEach((serviceXml) => {
				let serviceInfo = this._upnpServiceFactory.create(serviceXml, location, base, serverIP);
				device.services.push(serviceInfo);
			});
			this.emit("deviceBuilt", device);
		});
	}
	_parseDeviceIcons(device, deviceXml, location, base) {
		return new Promise((resolve, reject) => {
			let iconsXml = this._xmlParser.getElements(deviceXml, ":scope > iconList > icon");
			if (!iconsXml.length) {
				resolve();
			}
			else {
				let icons = [];
				iconsXml.forEach((iconXml) => {
					let icon = new Icon();
					icon.mimeType = this._xmlParser.getText(iconXml, "mimetype");
					icon.width = this._xmlParser.getText(iconXml, "width");
					icon.height = this._xmlParser.getText(iconXml, "height");
					icon.depth = this._xmlParser.getText(iconXml, "depth");
					icon.url = this._urlProvider.toUrl(this._xmlParser.getText(iconXml, "url"), location, base);

					let iconHeight = Number.parseInt(icon.height, 10);
					let iconWidth = Number.parseInt(icon.width, 10);

					if (isNaN(iconHeight)) iconHeight = 1;
					if (isNaN(iconWidth)) iconWidth = 1;

					icon.area = iconHeight * iconWidth;
					icons.push(icon);
				});
				//Find the biggest png or the biggest image if no png
				let sortFunc = (a, b) => {
					if (a.area <= b.area)
						return 1;
					return -1;
				};
				let pngIcons = icons.filter((icon) => {
					return icon.mimeType === "image/png";
				}).sort(sortFunc);
				if (pngIcons && pngIcons.length) {
					device.icon = pngIcons[0];
				} else {
					icons.sort(sortFunc).filter((icon) => {
						return true;
					});
					device.icon = icons.sort(sortFunc)[0];
				}

				if (device.icon.url && device.icon.url.href) {
					this._getImage(device.icon.url.href, device.icon.mimeType).then(function (response) {
						device.icon.base64Image = response;
						resolve();
					});
				} else {
					device.icon.base64Image = "";
					resolve();
				}
			}
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
	_getImage(url, mimeType) {
		return new Promise((resolve, reject) => {
			let xhr = new this._xhr();
			xhr.open('GET', url, true);
			xhr.responseType = 'arraybuffer';
			xhr.onload = (e) => {
				if (e.target.status == 200) {
					let uInt8Array = new Uint8Array(e.target.response);
					let i = uInt8Array.length;
					let binaryString = new Array(i);
					while (i--) {
						binaryString[i] = String.fromCharCode(uInt8Array[i]);
					}
					let base64 = this._base64Utils.encode(binaryString.join(''));
					resolve("data:" + mimeType + ";base64," + base64);
				} else {
					reject();
				}
			};
			xhr.send();
		});
	}
}

module.exports = DeviceFactory;
