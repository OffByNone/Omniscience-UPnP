'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var Constants = require('../Constants');

var _require = require('omniscience-utilities');

var Eventable = _require.Eventable;

var ActiveSearcher = (function (_Eventable) {
	function ActiveSearcher(ssdpClients) {
		_classCallCheck(this, ActiveSearcher);

		_get(Object.getPrototypeOf(ActiveSearcher.prototype), 'constructor', this).call(this);
		this._ssdpClients = ssdpClients;
		this._isInitialized = false;
	}

	_inherits(ActiveSearcher, _Eventable);

	_createClass(ActiveSearcher, [{
		key: 'search',
		value: function search() {
			if (!this._isInitialized) this._initializeSSDPClients();

			this._ssdpClients.forEach(function (ssdpClient) {
				return ssdpClient.search(Constants.SSDPServiceType);
			});
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
					if (headers['st'] === Constants.PeerNameResolutionProtocolST) return; //this is a Microsoft thing to resolve names on ipv6 networks and in this case just causes problems

					_this.emit('found', headers);
				});
			});
			this._isInitialized = true;
		}
	}, {
		key: '_error',
		value: function _error(error) {
			console.error(error);
		}
	}]);

	return ActiveSearcher;
})(Eventable);

module.exports = ActiveSearcher;

//todo: I think there is a way to merge the active and passive searchers. Have them simply take in a list of active ssdpclients and passive ssdpclients
//the messageReceived function is different - don't forget
//I could then move the bulk of the initializessdpclients somewhere else, the bigger problem is that if I move it back to ssdpclient it will be harder to test