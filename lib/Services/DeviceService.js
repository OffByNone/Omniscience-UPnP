﻿/* global Promise */
const Constants = require('../Constants');
const { Eventable } = require('omniscience-utilities');
const Device = require('../Entities/Device');

class DeviceService extends Eventable {
	constructor(deviceFactory, deviceLocator, storageService, notifications, fetch) {
		super();
		this._deviceFactory = deviceFactory;
		this._storageService = storageService;
		this._deviceLocator = deviceLocator;
		this._notifications = notifications;
		this._fetch = fetch;

		this.devices = [];
	}
	loadDevices() {
		this.devices.forEach(device => this.emit('deviceFound', device));
	}
	search() {
		this._deviceLocator.on("deviceFound",(id, location, fromAddress, serverIP) => {
			if (location.toLowerCase().indexOf("http") != 0)
				location = "http://" + location; //Microsoft special
			this._fetch(location).then((deviceXml) => {
				var deviceResponseHash = this._md5(deviceXml);
				var device = this.devices.filter(device => device.id === id)[0];

				if (!device || (deviceResponseHash !== device.responseHash && device.fromAddress === fromAddress)) {//todo: figure out why I compare on fromAddress
					var isNew = false;
					if (!device) {
						isNew = true;
						device = new Device();
					}
					try {
						this._deviceFactory.create(device, deviceXml, location, fromAddress, serverIP);
						this._addDevice(device, isNew);
					}
					catch (err) { 
						//todo: either root node or device node were missing.  probably log a warning/error to the console.
					}
				}
			});
		});
		this._deviceLocator.on("deviceLost",(id) => this._removeDevice(id));
		this._deviceLocator.search(this.devices);
	}
	_removeDevice(id) {
		for (var i = 0; i < this.devices.length; i++) {
			if (this.devices[i].id === id) {
				var lostDevice = this.devices.splice(i, 1)[0];
				this.emit("deviceLost", lostDevice);
				this._saveDeviceList();
				return;
			}
		}
	}
	_addDevice(device, isNew) {
		if (!isNew) {
			this.devices.push(device);
			this._notifications.notify({
				title: 'Found ' + device.name,
				text: "a " + device.model.name + " by " + device.manufacturer.name,
				iconURL: device.icons.length > 0 && device.icons[0].url ? device.icons[0].url.href : Constants.defaultIcon
			});
		}
		this._saveDeviceList();
		this.emit('deviceFound', device);
	}
	_saveDeviceList() {
		this._storageService.devices = this.devices;
	}
}

module.exports = DeviceService;