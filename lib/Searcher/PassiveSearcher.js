"use strict";

const Constants = require('../Constants');
const { Eventable } = require('omniscience-utilities');

class PassiveSearcher extends Eventable {
	constructor(ssdpClients) {
		super();
		this._ssdpClients = ssdpClients;
		this._isInitialized = false;
	}
	listen() {
		if (!this._isInitialized)
			this._initializeSSDPClients();
	}
	stop() {
		this._ssdpClients.forEach(ssdpClient=> ssdpClient.stop());
	}
	_initializeSSDPClients() {
		this._ssdpClients.forEach((ssdpClient) => {
			ssdpClient.initialize();
			ssdpClient.on('messageReceived', headers => {
				let nts = (headers.nts || "").toLowerCase();

				if (nts === Constants.ssdp.update || nts === Constants.ssdp.new)
					this.emit("found", headers, nts === Constants.ssdp.update);
				else if (nts === Constants.ssdp.gone)
					this.emit("lost", headers);
			});
		});
		this._isInitialized = true;
	}
}

module.exports = PassiveSearcher;
