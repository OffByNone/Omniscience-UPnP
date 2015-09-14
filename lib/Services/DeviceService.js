/* global Promise */
"use strict";
const Constants = require('../Constants');
const { Eventable } = require('omniscience-utilities');
const Device = require('../Entities/Device');

class DeviceService extends Eventable {
	constructor(deviceFactory, deviceLocator, storageService, notifications, fetch, md5) {
		super();
		this._deviceFactory = deviceFactory;
		this._storageService = storageService;
		this._deviceLocator = deviceLocator;
		this._notifications = notifications;
		this._fetch = fetch;
		this._md5 = md5;
		this._isInitialized = false;

		this.devices = [];
	}
	loadDevices() {
		this.devices.forEach(device=> this.emit("deviceFound", device));
	}
	stop() {
		this._deviceLocator.stop();
	}
	search() {
		if (!this._isInitialized) {
			this._deviceLocator.on("deviceFound", (id, location, fromAddress, serverIP) => {
				if (location.toLowerCase().indexOf("http") !== 0)
					location = "http://" + location; //Microsoft special
				this._fetch(location).then(response => {
					let responseText = response._bodyText;
					let deviceResponseHash = this._md5(responseText);
					let device = this.devices.filter(device => device.id === id)[0];

					if (!device || (deviceResponseHash !== device.responseHash && device.fromAddress === fromAddress)) {
						/* for devices that show up on multiple network interfaces, their response hashes will be different, and their fromAddresses will also be different
						 * don't rebuild if it is simply the same device on a different network interface
						 */
						try {
							this._deviceFactory.build(responseText, location, fromAddress, serverIP);
						}
						catch (err) {
							console.log(err);
						}
					}
				});
			});
			this._deviceFactory.on("deviceBuilt", (newDevice) => {
				let oldDevice = this.devices.filter(device => device.id === newDevice.id)[0];
				this._addDevice(newDevice, oldDevice);
			});
			this._deviceLocator.on("deviceLost", (id) => this._removeDevice(id));
			this._isInitialized = true;
			this._deviceLocator.search(this.devices);
		}
		else
			this._deviceLocator.search(this.devices);
	}
	_removeDevice(id) {
		for (let i = 0; i < this.devices.length; i++) {
			if (this.devices[i].id === id) {
				let lostDevice = this.devices.splice(i, 1)[0];
				this.emit("deviceLost", lostDevice);
				this._saveDeviceList();
				return;
			}
		}
	}
	_addDevice(newDevice, device) {
		if (typeof device === "undefined" || device === null)
			device = newDevice;
		else
			this._copyObj(device, newDevice);

		let isNew = this.devices.every(existingDevice => existingDevice.id !== device.id);
		if (isNew) {
			this.devices.push(device);
			this._notifications.notify({
				title: 'Found ' + device.name,
				text: "a " + device.model.name + " by " + device.manufacturer.name,
				iconURL: device.icon.base64Image
			});
		}
		this._saveDeviceList();
		this.emit('deviceFound', device);
	}
	_copyObj(copyTo, copyFrom) {
		for (let prop in copyFrom) {
			if (copyFrom.hasOwnProperty(prop)) {
				if (typeof copyFrom[prop] === "object" && copyFrom[prop] !== null && !copyFrom[prop].hasOwnProperty("scheme")) //second part is ugly hack to stop it form trying to copy urls as objects in firefox which wont work.
					this._copyObj(copyTo[prop], copyFrom[prop]);
				else
					copyTo[prop] = copyFrom[prop];
			}
		}
	}
	_saveDeviceList() {
		this._storageService.set("devices", this.devices);
	}
}

module.exports = DeviceService;