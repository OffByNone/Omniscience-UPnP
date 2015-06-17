"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Capabilities = function Capabilities() {
    _classCallCheck(this, Capabilities);

    this.mirror = false;
    this.audio = false;
    this.video = false;
    this.image = false;
    this.router = false;
    this.server = false;
    this.supportedFormats = [];
};

module.exports = Capabilities;