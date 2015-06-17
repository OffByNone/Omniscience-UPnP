"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProtocolInfo = function ProtocolInfo() {
    _classCallCheck(this, ProtocolInfo);

    this.additionalInfo = {};
    this.contentFormat = {};
    this.network = ""; //seems to always be "*"
    this.protocol = ""; //usually http-get
    this.type = ""; //either serve or render
};

module.exports = ProtocolInfo;