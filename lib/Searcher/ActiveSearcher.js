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
	_initializeSSDPClients(){
		this._ssdpClients.forEach( (ssdpClient) => {
			ssdpClient.joinMulticast();
			ssdpClient.startListening();
			ssdpClient.on('error', error => this._error(error));
			ssdpClient.on('messageReceived', headers => {
				if(headers["st"] === Constants.PeerNameResolutionProtocolST)
					return;//this is a Microsoft thing to resolve names on ipv6 networks and in this case just causes problems

				this.emit("found", headers);
			});
		});
		this._isInitialized = true;
	}
	_error(error){
		console.error(error);
	}
}

module.exports = ActiveSearcher;

//todo: I think there is a way to merge the active and passive searchers. Have them simply take in a list of active ssdpclients and passive ssdpclients
//the messageReceived function is different - don't forget
//I could then move the bulk of the initializessdpclients somewhere else, the bigger problem is that if I move it back to ssdpclient it will be harder to test