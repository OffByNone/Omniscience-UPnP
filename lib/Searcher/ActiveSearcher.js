"use strict";

const Constants = require('../Constants');
const { Eventable } = require('omniscience-utilities');

class ActiveSearcher extends Eventable {
	constructor(ssdpClients) {
		super();
		this._ssdpClients = ssdpClients;
		this._isInitialized = false;
	}
	search() {
		if (!this._isInitialized)
			this._initializeSSDPClients();

		this._ssdpClients.forEach(ssdpClient => ssdpClient.search(Constants.SSDPServiceType));
	}
	stop() {
		this._ssdpClients.forEach(ssdpClient => ssdpClient.stop());
	}
	_initializeSSDPClients() {
		this._ssdpClients.forEach((ssdpClient) => {
			ssdpClient.initialize();
			ssdpClient.on('messageReceived', headers => this.emit("found", headers));
		});
		this._isInitialized = true;
	}
}

module.exports = ActiveSearcher;