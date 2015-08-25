"use strict";

const Constants = require('../Constants');
const { Eventable } = require('omniscience-utilities');

class SSDPClient extends Eventable {
	constructor(stringUtils, udpSocket) {
		super();
		this._socket = udpSocket;
		this._stringUtils = stringUtils;
	}
	initialize() {
		this._socket.onStopListeningEvent((status) => this.emit('close', status));
		this._socket.onPacketReceivedEvent((message) => {
			let messageData = typeof message.data === "string" ? message.data : this._toString(message.data);
			let headers = this._parseHeaders(messageData);
			headers.fromAddress = message.fromAddr.address + ":" + message.fromAddr.port;
			headers.serverIP = this._socket.localIP;
			if (headers.st !== Constants.PeerNameResolutionProtocolST) //this is a Microsoft thing to resolve names on ipv6 networks and in this case just causes problems
				this.emit('messageReceived', headers);
		});
	}
	search(service) {
		let searchText = this._stringUtils.format(Constants.MSearch, Constants.MulticastIP, Constants.MulticastPort, service);
		let message = new Uint8Array([].map.call(searchText, i => i.charCodeAt(0)));
		this._socket.send(Constants.MulticastIP, Constants.MulticastPort, message);
	}
	stop() { this._socket.close(); }
	_parseHeaders(headerString) {
		let headers = {};
		headerString.split("\r\n").forEach(x => {
			if (!x || x.indexOf(":") === -1) return;
			let colon = x.indexOf(":");
			headers[x.substring(0, colon).toLowerCase()] = x.substring(colon + 1).trim();
		});
		return headers;
	}
	_toString(arrayBuffer) {
        let uint8Array = new Uint8Array(arrayBuffer);

		return String.fromCharCode(...uint8Array);
		//the above could error if too many arguments are passed into fromCharCode
		//I dont think this is likely to happen, so I removed the loop that was here
		//for more information see http://stackoverflow.com/questions/22747068/is-there-a-max-number-of-arguments-javascript-functions-can-accept
    }
}

/**
 * Simple Service Discovery Protocol
 * DLNA, and DIAL are built on top of this
 */
module.exports = SSDPClient;
