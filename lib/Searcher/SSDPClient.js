"use strict";

const Constants = require('../Constants');
const { Eventable } = require('omniscience-utilities');

class SSDPClient extends Eventable {
	constructor(stringUtils, udpSocket) {
		super();
		this._socket = udpSocket;
		this._ipAddress = udpSocket._localIP;
		this._stringUtils = stringUtils;
	}
	startListening() {
		this._socket.onStopListeningEvent((status) => this.emit('close', status));
		this._socket.onPacketReceivedEvent((message) => {
			let messageData = this._toString(message.data);
			let headers = this._parseHeaders(messageData);
			headers.fromAddress = message.fromAddr.address + ":" + message.fromAddr.port;
			headers.serverIP = this._ipAddress;
			this.emit('messageReceived', headers);
		});
		this._socket.listen();
	}
	search(service) {
		let searchText = this._stringUtils.format(Constants.MSearch, Constants.MulticastIP, Constants.MulticastPort, service);
		let message = new Uint8Array([].map.call(searchText, i => i.charCodeAt(0)));
		this._socket.send(Constants.MulticastIP, Constants.MulticastPort, message);
	}
	stop() { this._socket.close(); }
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
	_toString (arrayBuffer) {
        let results = [];
        let uint8Array = new Uint8Array(arrayBuffer);

        for (let i = 0, length = uint8Array.length; i < length; i += 200000) //todo: figure out what this 200000 means, then move to constants
            results.push(String.fromCharCode(...uint8Array.subarray(i, i + 200000)));

        return results.join('');
    }
}

/**
 * Simple Service Discovery Protocol
 * DLNA, and DIAL are built on top of this
 */
module.exports = SSDPClient;
