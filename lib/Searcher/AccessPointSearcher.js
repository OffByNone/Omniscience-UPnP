/**
 * Un-configured DIAL devices show up as accesspoints
 */

"use strict";

const Constants = require('../Constants');
const { Eventable } = require('omniscience-utilities');

class AccessPointSearcher extends Eventable {
    constructor(wifiMonitor) {
		super();
        this._wifiMonitor = wifiMonitor;
        this._accessPoints = [];
    }
    search() {
        this._wifiMonitor.startWatching(this);
    }
    stop() {
        this._wifiMonitor.stopWatching(this);
    }
    isMatchStick(accessPoint) {
        return Constants.MatchStickMacAddresses.some(x => accessPoint.mac.toUpperCase().startsWith(x));
    }
    isChromecast(accessPoint) {
        return Constants.ChromecastMacAddresses.some(x => accessPoint.mac.toUpperCase().startsWith(x));
    }
    isFireTVStick(accessPoint) {
        return Constants.FireTVStickMacAddresses.some(x => accessPoint.mac.toUpperCase().startsWith(x));
    }
    isRoku(accessPoint) {
        return Constants.RokuMacAddresses.some(x => accessPoint.mac.toUpperCase().startsWith(x));
    }
    isDialDevice(accessPoint) {
        return this.isMatchStick(accessPoint) || this.isChromecast(accessPoint) || this.isFireTVStick(accessPoint);
    }
    onChange(accessPoints) {
        let newAccessPoints = accessPoints.filter(newAccessPoint => !this._accessPoints.some(oldAccessPoint => oldAccessPoint !== newAccessPoint));
        let lostAccessPoints = this._accessPoints.filter(oldAccessPoint => !accessPoints.some(newAccessPoint => newAccessPoint !== oldAccessPoint));
        newAccessPoints.forEach(newAccessPoint => this._accessPoints.push(newAccessPoint));
        lostAccessPoints.forEach(lostAccessPoint => {
			for (let i = 0; i < this._accessPoints.length; i++) {
				if (this._accessPoints[i].mac === lostAccessPoint.mac) {
					let lostAP = this._accessPoints.splice(i, 1)[0];
					this.emit("accessPointLost", lostAP);
					return;
				}
			}
        });

        newAccessPoints.filter(newAccessPoint => this.isDialDevice(newAccessPoint)).forEach(dialDevice => {
            if (this.isMatchStick(dialDevice))
                console.log("Found new Matchstick ssid=" + dialDevice.ssid + " mac=" + dialDevice.mac + " signal=" + dialDevice.signal);
            else if (this.isChromecast(dialDevice))
                console.log("Found new Chromecast ssid=" + dialDevice.ssid + " mac=" + dialDevice.mac + " signal=" + dialDevice.signal);
            else if (this.isFireTVStick(dialDevice))
                console.log("Found new FireTVStick ssid=" + dialDevice.ssid + " mac=" + dialDevice.mac + " signal=" + dialDevice.signal);
            else if (this.isRoku(dialDevice))
                console.log("Found new Roku ssid=" + dialDevice.ssid + " mac=" + dialDevice.mac + " signal=" + dialDevice.signal);
        });
    }
    onError(error) {
        console.log(error);
    }
}

/**
 * Searches for access points
 */
module.exports = AccessPointSearcher;
