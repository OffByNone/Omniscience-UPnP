'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var Constants = require('../Constants');

var _require = require('omniscience-utilities');

var Eventable = _require.Eventable;

var PassiveSearcher = (function (_Eventable) {
	function PassiveSearcher(ssdpClients) {
		_classCallCheck(this, PassiveSearcher);

		_get(Object.getPrototypeOf(PassiveSearcher.prototype), 'constructor', this).call(this);
		this._ssdpClients = ssdpClients;
		this._isInitialized = false;
	}

	_inherits(PassiveSearcher, _Eventable);

	_createClass(PassiveSearcher, [{
		key: 'listen',
		value: function listen() {
			if (!this._isInitialized) this._initializeSSDPClients();
		}
	}, {
		key: 'stop',
		value: function stop() {
			this._ssdpClients.forEach(function (ssdpClient) {
				return ssdpClient.stop();
			});
		}
	}, {
		key: '_initializeSSDPClients',
		value: function _initializeSSDPClients() {
			var _this = this;

			this._ssdpClients.forEach(function (ssdpClient) {
				ssdpClient.joinMulticast();
				ssdpClient.startListening();
				ssdpClient.on('error', function (error) {
					return _this._error(error);
				});
				ssdpClient.on('messageReceived', function (headers) {
					if (headers.st === Constants.PeerNameResolutionProtocolST) return; //this is a Microsoft thing to resolve names on ipv6 networks and in this case just causes problems

					var nts = (headers.nts || '').toLowerCase();

					if (nts === Constants.ssdp.update || nts === Constants.ssdp['new']) _this.emit('found', headers, nts === Constants.ssdp.update);else if (nts === Constants.ssdp.gone) _this.emit('lost', headers);
				});
			});
			this._isInitialized = true;
		}
	}, {
		key: '_error',
		value: function _error(error) {
			console.log(error);
		}
	}]);

	return PassiveSearcher;
})(Eventable);

module.exports = PassiveSearcher;