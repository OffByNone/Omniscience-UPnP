/* global Promise */
"use strict";
const UPnPVersion = require('../Entities/UPnPVersion');
const DeviceManufacturer = require('../Entities/DeviceManufacturer');
const DeviceModel = require('../Entities/DeviceModel');
const Icon = require('../Entities/Icon');

class DeviceFactory {
    constructor(xmlParser, urlProvider, md5, upnpServiceFactory, upnpExtensionInfoFactory) {
        this._xmlParser = xmlParser;
        this._urlProvider = urlProvider;
        this._md5 = md5;
		this._upnpServiceFactory = upnpServiceFactory;
		this._upnpExtensionInfoFactory = upnpExtensionInfoFactory;
    }
    create(device, responseText, location, fromAddress, serverIP) {
		let responseXml = this._xmlParser.parseFromString(responseText);

		let root = this._xmlParser.getElement(responseXml, "root");

		if (!root) throw new Error("Required element 'root' was not found in responseXml");

		let base = this._xmlParser.getText(root, "baseUrl");
		let deviceXml = this._xmlParser.getElement(root, "device");

		if (!deviceXml) throw new Error("Required element 'device' was not found inside 'root' node");

		this._parseDeviceAttributes(device, deviceXml);
		this._parseDeviceIcons(device, deviceXml, location, base);
		let servicesXml = this._xmlParser.getElements(deviceXml, "serviceList service");

		servicesXml.forEach((serviceXml) => {
			let serviceInfo = this._upnpServiceFactory.create(serviceXml, location, base, serverIP);
			device.services.push(serviceInfo);
		});

		device.upnpVersion = new UPnPVersion();
		device.upnpVersion.major = this._xmlParser.getText(root, "specVersion major");
		device.upnpVersion.minor = this._xmlParser.getText(root, "specVersion minor");

		device.address = this._urlProvider.createUrl(base || this._urlProvider.createUrl(location).origin);
		device.ssdpDescription = this._urlProvider.createUrl(location);
		device.responseHash = this._md5(responseText);
		device.fromAddress = fromAddress;
		device.serverIP = serverIP;
    }
	_parseDeviceAttributes(device, deviceXml) {
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
	_parseDeviceIcons(device, deviceXml, location, base) {
		let iconsXml = this._xmlParser.getElements(deviceXml, "iconList icon");

		iconsXml.forEach((iconXml) => {
			let icon = new Icon();
			icon.mimeType = this._xmlParser.getText(iconXml, "mimetype");
			icon.width = this._xmlParser.getText(iconXml, "width");
			icon.height = this._xmlParser.getText(iconXml, "height");
			icon.depth = this._xmlParser.getText(iconXml, "depth");
			icon.url = this._urlProvider.toUrl(this._xmlParser.getText(iconXml, "url"), location, base);

			device.icons.push(icon);
		});
	}
}

module.exports = DeviceFactory;
