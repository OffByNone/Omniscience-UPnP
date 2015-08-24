"use strict";

const Constants = require('../Constants');
const { Eventable } = require('omniscience-utilities');

class DeviceLocator extends Eventable {
	constructor(timer, fetch, activeSearcher, passiveSearcher, xmlParser, simpleTCP, urlProvider) {
		super();
		this._timer = timer;
		this._fetch = fetch;
		this._activeSearcher = activeSearcher;
		this._passiveSearcher = passiveSearcher;
		this._xmlParser = xmlParser;
		this._simpleTCP = simpleTCP;
		this._urlProvider = urlProvider;

		this.debounceTimeout = 1000;
		this._deviceTimeouts = {};
		this._deviceLastResponses = {};

		this._isInitialized = false;
	}
	_initializeSearchers() {
		this._activeSearcher.on("found", (headers, ignoreDebounce) => this._deviceFound(headers, ignoreDebounce));
		this._passiveSearcher.on("found", (headers, ignoreDebounce) => this._deviceFound(headers, ignoreDebounce));
		this._passiveSearcher.on("lost", (headers) => this.emit("deviceLost", headers.usn));
		this._passiveSearcher.listen();

		this._isInitialized = true;
	}
	search(devices) {
		if (!this._isInitialized)
			this._initializeSearchers();

		devices.forEach((device) => {
			this._checkForLostDevice(device.ssdpDescription, device.id, false).then(found => {
				if (!found) {
					delete this._deviceLastResponses[device.id];
					this.emit("deviceLost", device.id);
				}
			});
		});

		this._activeSearcher.search();
	}
	stop() {
		this._activeSearcher.stop();
		this._passiveSearcher.stop();
	}
	_deviceFound(headers, ignoreDebounce) {
		let id = Constants.uuidRegex.exec(headers.usn)[1];

		if (this._deviceTimeouts.hasOwnProperty(id))
			this._timer.clearTimeout(this._deviceTimeouts[id]);

		let waitTimeInSeconds = Constants.defaultDeviceTimeoutInSeconds;

		if (headers.hasOwnProperty("cache-control"))
			waitTimeInSeconds = headers["cache-control"].split("=")[1];

		this._deviceTimeouts[id] = this._timer.setTimeout(() => {
			this._checkForLostDevice(this._urlProvider.toUrl(headers.location), id).then(found => {
				if (!found) {
					delete this._deviceLastResponses[id];
					this.emit("deviceLost", id);
				}
				else {
					this._deviceFound(headers, true);
				}
			});
		}, (waitTimeInSeconds * 1000));

		let lastResponse = this._deviceLastResponses[id];
		let currentTime = Date.now();
		if ((lastResponse && lastResponse + this.debounceTimeout < currentTime) || ignoreDebounce || !lastResponse) {
			this._deviceLastResponses[id] = currentTime;
			this.emit('deviceFound', id, headers.location, headers.fromAddress, headers.serverIP);
		}
	}
	_checkForLostDevice(location, deviceId) {
		return this._simpleTCP.ping(location.hostname, location.port)
			.then((deviceFound) => {
				if (!deviceFound)
					return false;

				return this._fetch(location).then(
					(response) => {
						if (!response.ok)
							return false;
						else {
							let responseXml = this._xmlParser.parseFromString(response._bodyText);
							let deviceElements = this._xmlParser.getElements(responseXml, "device");

							return deviceElements
								.map((deviceElement) => {
									let deviceUDN = this._xmlParser.getText(deviceElement, ":scope > UDN");
									let deviceType = this._xmlParser.getText(deviceElement, ":scope > deviceType");
									return deviceUDN + "::" + deviceType;
								})
								.some(foundDeviceId => deviceId === foundDeviceId);
							//check the xml to make sure what we got back has the same id as what we were looking for --my matchstick and firetv stick gets a new id on each boot (in violation of spec)
							//also make sure to check against all UDN elements as sub devices will have their own and we don't know what we are looking for
						}
					},
					(err) => { return false; });/*error occured while trying to ping device, consider lost.*/
			});
	}
}

module.exports = DeviceLocator;
