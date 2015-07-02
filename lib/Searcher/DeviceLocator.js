"use strict";

const Constants = require('./Constants');
const { Eventable } = require('omniscience-utilities');

class DeviceLocator extends Eventable {
	constructor(timer, fetch, activeSearcher, passiveSearcher) {
		super();
		this._timer = timer;
		this._fetch = fetch;
		this._activeSearcher = activeSearcher;
		this._passiveSearcher = passiveSearcher;

		this.debounceTimeout = 15000;
		this._deviceTimeouts = {};
		this._deviceLastResponses = {};

		this._isInitialized = false;
	}
	search(devices) {
		if (!this._isInitialized)
			this._initializeSearchers();
		if (Array.isArray(devices))
			devices.forEach((device) => this._checkForLostDevice(device));

		this._activeSearcher.search();
		this._passiveSearcher.search();
	}
	_initializeSearchers() {
		this._activeSearcher.on("found", (headers, ignoreDebounce) => this._deviceFound(headers, ignoreDebounce));

		this._passiveSearcher.on("found", (headers, ignoreDebounce) => this._deviceFound(headers, ignoreDebounce));
		this._passiveSearcher.on("lost", (headers) => this.emit("deviceLost", headers.usn.split("::")[0]));

		this._isInitialized = true;
	}
	_deviceFound(headers, ignoreDebounce) {
		let id = Constants.uuidRegex.exec(headers.usn)[1];

		this._timer.clearTimeout(this._deviceTimeouts[id]);
		if (headers.hasOwnProperty("cache-control")) {
			let waitTime = headers["cache-control"].split("=")[1] * 1000;
			this._deviceTimeouts[id] = this._timer.setTimeout(() => {
				this._fetch(headers.location, { method: 'head' }).then(
					() => this._deviceFound(headers, true),
					() => this.emit("deviceLost", id));
				//todo: looks like some devices don't support the head request and return a 501 not implemented.
				//I am not entirely sure this is what is happening as I just get a 501 not implemented but this is my best guess as the page it was coming from does exist
				//below is the exact error message I get in the log
				//HEAD XHR http://192.168.1.1:54080/rootDesc.xml [HTTP/1.1 501 Not Implemented 24ms]
			}, waitTime);
		}
		let lastResponse = this._deviceLastResponses[id];
		let currentTime = Date.now();
		if ((lastResponse && lastResponse + this.debounceTimeout < currentTime) || ignoreDebounce || !lastResponse) {
			this._deviceLastResponses[id] = currentTime;
			this.emit('deviceFound', id, headers.location, headers.fromAddress, headers.serverIP);
		}
	}
	_checkForLostDevice(device) {
		this._fetch(device.ssdpDescription, { method: 'head' }).then(
			(response) => { /*we heard back from device, do nothing.*/ },
			(response) => { /*pinging device errored out, consider lost.*/
				this.emit("deviceLost", device.id);
			});
	}
}

module.exports = DeviceLocator;
