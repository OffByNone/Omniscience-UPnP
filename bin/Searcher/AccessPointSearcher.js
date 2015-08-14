/**
 * Un-configured DIAL devices show up as accesspoints
 */

"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Constants = require('../Constants');

var _require = require('omniscience-utilities');

var Eventable = _require.Eventable;

var AccessPointSearcher = (function (_Eventable) {
    _inherits(AccessPointSearcher, _Eventable);

    function AccessPointSearcher(wifiMonitor) {
        _classCallCheck(this, AccessPointSearcher);

        _get(Object.getPrototypeOf(AccessPointSearcher.prototype), 'constructor', this).call(this);
        this._wifiMonitor = wifiMonitor;
        this._accessPoints = [];
    }

    /**
     * Searches for access points
     */

    _createClass(AccessPointSearcher, [{
        key: 'search',
        value: function search() {
            this._wifiMonitor.startWatching(this);
        }
    }, {
        key: 'stop',
        value: function stop() {
            this._wifiMonitor.stopWatching(this);
        }
    }, {
        key: 'isMatchStick',
        value: function isMatchStick(accessPoint) {
            return Constants.MatchStickMacAddresses.some(function (x) {
                return accessPoint.mac.toUpperCase().startsWith(x);
            });
        }
    }, {
        key: 'isChromecast',
        value: function isChromecast(accessPoint) {
            return Constants.ChromecastMacAddresses.some(function (x) {
                return accessPoint.mac.toUpperCase().startsWith(x);
            });
        }
    }, {
        key: 'isFireTVStick',
        value: function isFireTVStick(accessPoint) {
            return Constants.FireTVStickMacAddresses.some(function (x) {
                return accessPoint.mac.toUpperCase().startsWith(x);
            });
        }
    }, {
        key: 'isDialDevice',
        value: function isDialDevice(accessPoint) {
            return this.isMatchStick(accessPoint) || this.isChromecast(accessPoint) || this.isFireTVStick(accessPoint);
        }
    }, {
        key: 'onChange',
        value: function onChange(accessPoints) {
            var _this = this;

            var newAccessPoints = accessPoints.filter(function (newAccessPoint) {
                return !_this._accessPoints.some(function (oldAccessPoint) {
                    return oldAccessPoint !== newAccessPoint;
                });
            });
            var lostAccessPoints = this._accessPoints.filter(function (oldAccessPoint) {
                return !accessPoints.some(function (newAccessPoint) {
                    return newAccessPoint !== oldAccessPoint;
                });
            });
            newAccessPoints.forEach(function (newAccessPoint) {
                return _this._accessPoints.push(newAccessPoint);
            });
            lostAccessPoints.forEach(function (lostAccessPoint) {
                //todo: remove lost accesspoints from this._accessPoints
            });

            newAccessPoints.filter(function (newAccessPoint) {
                return _this.isDialDevice(newAccessPoint);
            }).forEach(function (dialDevice) {
                if (_this.isMatchStick(dialDevice)) console.log("Found new Matchstick ssid=" + dialDevice.ssid + " mac=" + dialDevice.mac + " signal=" + dialDevice.signal);else if (_this.isChromecast(dialDevice)) console.log("Found new Chromecast ssid=" + dialDevice.ssid + " mac=" + dialDevice.mac + " signal=" + dialDevice.signal);else if (_this.isFireTVStick(dialDevice)) console.log("Found new FireTVStick ssid=" + dialDevice.ssid + " mac=" + dialDevice.mac + " signal=" + dialDevice.signal);
            });
        }
    }, {
        key: 'onError',
        value: function onError(error) {
            console.log(error);
            this.emit('accessPointSerivce.error', error);
        }
    }]);

    return AccessPointSearcher;
})(Eventable);

module.exports = AccessPointSearcher;