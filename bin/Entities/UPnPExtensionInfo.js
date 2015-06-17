"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UPnPExtensionInfo = (function () {
    function UPnPExtensionInfo() {
        _classCallCheck(this, UPnPExtensionInfo);

        this.raw = null;
        this.parts = null;
        this.domainName = null;
        this.isStandard = null;
        this.isVendorSpecific = null;
        this.name = null;
        this.type = null;
        this.version = null;
    }

    _createClass(UPnPExtensionInfo, [{
        key: "setFromString",
        value: function setFromString(typeString) {
            /*
            Type of Extension	Standard												Non-Standard
            device type			urn:schemas-upnp-org:device:[deviceType]:[version]		urn:[domain-name]:device:[deviceType]:[version]
            service type 		urn:schemas-upnp-org:service:[serviceType]:[version]	urn:[domain-name]:service:[serviceType]:[version]
            service ID 			urn:upnp-org:serviceId:[serviceID]						urn:[domain-name]:serviceId:[serviceID]
            */
            if (!typeString) throw new Error("Argument null exception.  Argument 'typeString' cannot be null.");

            this.raw = typeString;
            this.parts = typeString.split(":");
            if (this.parts.length !== 5 && this.parts.length !== 4) throw new Error("Invalid number of parts.  Must contain either 4 or 5 parts, but had " + this.parts.length);
            this.domainName = this.parts[1];
            this.type = this.parts[2];
            this.name = this.parts[3];

            if (this.parts.length === 5) {
                this.isStandard = this.domainName === "schemas-upnp-org";
                this.isVendorSpecific = this.domainName !== "schemas-upnp-org";
                this.version = this.parts[4];
            } else if (this.parts.length === 4) {
                this.isStandard = this.domainName === "upnp-org";
                this.isVendorSpecific = this.domainName !== "upnp-org";
            }
        }
    }]);

    return UPnPExtensionInfo;
})();

module.exports = UPnPExtensionInfo;