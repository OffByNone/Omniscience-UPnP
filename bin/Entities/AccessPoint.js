"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AccessPoint = function AccessPoint() {
    _classCallCheck(this, AccessPoint);

    this.mac = null;
    this.ssid = null;
    this.signal = null;
}

/**
 * Un-configured DIAL devices show up as accesspoints
 */
;

module.exports = AccessPoint;