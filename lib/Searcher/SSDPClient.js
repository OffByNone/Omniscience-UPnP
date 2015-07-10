"use strict";

const Constants = require('../Constants');
const { Eventable } = require('omniscience-utilities');

class SSDPClient extends Eventable {
	constructor(stringUtils, udpSocket) {
		super();
		this._socket = udpSocket;
		this._stringUtils = stringUtils;
	}
	startListening() {
		this._socket.asyncListen(this);
	}
	search(service) {
		let searchText = this._stringUtils.format(Constants.MSearch, Constants.MulticastIP, Constants.MulticastPort, service);
		let message = new Uint8Array([].map.call(searchText, i => i.charCodeAt(0)));
		this._socket.send(Constants.MulticastIP, Constants.MulticastPort, message, message.length);
	}
	stop() {
		this._socket.close();
	}
	setMulticastInterface(ipAddress) {
		this._ipAddress = ipAddress;
		this._socket.multicastInterface = ipAddress;
	}
	joinMulticast() {
		this._socket.joinMulticast(Constants.MulticastIP, this._ipAddress);
	}
	leaveMulticast() {
		this._socket.leaveMulticast(Constants.MulticastIP, this._ipAddress);
	}
	onStopListening(socket, status) { // nsIUDPSocketListener
		this.emit('close', status);
	}
	onPacketReceived(socket, message) { // See: https://bugzilla.mozilla.org/show_bug.cgi?id=952927
		let headers = this._parseHeaders(message.data);
		headers.fromAddress = message.fromAddr.address + ":" + message.fromAddr.port;
		headers.serverIP = this._ipAddress;
		this.emit('messageReceived', headers);
	}
	_parseHeaders(headerString) {
		//todo: move this to another file, it doesnt belong here
		let headers = {};
		headerString.split("\r\n").forEach(x => {
			if (!x || x.indexOf(":") === -1) return;
			let colon = x.indexOf(":");
			headers[x.substring(0, colon).toLowerCase()] = x.substring(colon + 1).trim();
		});
		return headers;
	}
}

/**
 * Simple Service Discovery Protocol
 * DLNA, and DIAL are built on top of this
 */
module.exports = SSDPClient;
