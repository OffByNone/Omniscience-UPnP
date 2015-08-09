'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var Constants = require('../Constants');

var _require = require('omniscience-utilities');

var Eventable = _require.Eventable;

var SSDPClient = (function (_Eventable) {
	function SSDPClient(stringUtils, udpSocket) {
		_classCallCheck(this, SSDPClient);

		_get(Object.getPrototypeOf(SSDPClient.prototype), 'constructor', this).call(this);
		this._socket = udpSocket;
		this._ipAddress = udpSocket.localIP;
		this._stringUtils = stringUtils;
	}

	_inherits(SSDPClient, _Eventable);

	_createClass(SSDPClient, [{
		key: 'initialize',
		value: function initialize() {
			var _this = this;

			this._socket.onStopListeningEvent(function (status) {
				return _this.emit('close', status);
			});
			this._socket.onPacketReceivedEvent(function (message) {
				var messageData = typeof message.data === 'string' ? message.data : _this._toString(message.data);
				var headers = _this._parseHeaders(messageData);
				headers.fromAddress = message.fromAddr.address + ':' + message.fromAddr.port;
				headers.serverIP = _this._ipAddress;
				_this.emit('messageReceived', headers);
			});
		}
	}, {
		key: 'search',
		value: function search(service) {
			var searchText = this._stringUtils.format(Constants.MSearch, Constants.MulticastIP, Constants.MulticastPort, service);
			var message = new Uint8Array([].map.call(searchText, function (i) {
				return i.charCodeAt(0);
			}));
			this._socket.send(Constants.MulticastIP, Constants.MulticastPort, message);
		}
	}, {
		key: 'stop',
		value: function stop() {
			this._socket.close();
		}
	}, {
		key: '_parseHeaders',
		value: function _parseHeaders(headerString) {
			//todo: move this to another file, it doesnt belong here
			var headers = {};
			headerString.split('\r\n').forEach(function (x) {
				if (!x || x.indexOf(':') === -1) return;
				var colon = x.indexOf(':');
				headers[x.substring(0, colon).toLowerCase()] = x.substring(colon + 1).trim();
			});
			return headers;
		}
	}, {
		key: '_toString',
		value: function _toString(arrayBuffer) {
			var results = [];
			var uint8Array = new Uint8Array(arrayBuffer);

			for (var i = 0, _length = uint8Array.length; i < _length; i += 200000) {
				//todo: figure out what this 200000 means, then move to constants
				results.push(String.fromCharCode.apply(String, _toConsumableArray(uint8Array.subarray(i, i + 200000))));
			}return results.join('');
		}
	}]);

	return SSDPClient;
})(Eventable);

/**
 * Simple Service Discovery Protocol
 * DLNA, and DIAL are built on top of this
 */
module.exports = SSDPClient;