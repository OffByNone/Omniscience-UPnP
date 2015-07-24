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
			ssdpClient.joinMulticast();
			ssdpClient.startListening();
			ssdpClient.on('error', error => this._error(error));
			ssdpClient.on('messageReceived', headers => {
				if (headers.st === Constants.PeerNameResolutionProtocolST)
					return;//this is a Microsoft thing to resolve names on ipv6 networks and in this case just causes problems

				let nts = (headers.nts || "").toLowerCase();

				if (nts === Constants.ssdp.update || nts === Constants.ssdp.new)
					this.emit("found", headers, nts === Constants.ssdp.update);
				else if (nts === Constants.ssdp.gone)
					this.emit("lost", headers);
			});
		});
		this._isInitialized = true;
	}
	_error(error) {
		console.log(error);
	}
}

module.exports = PassiveSearcher;
