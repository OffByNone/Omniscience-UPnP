"use strict";
class UPnPService {
    constructor() {
        this.controlUrl = null; //URL
        this.eventSubUrl = null; //URL
        this.scpdUrl = null; //URL
        this.type = null; //UPnPExtensionInfo
        this.upnpVersion = null; //UPnPVersion
        this.id = null;
        this.properties = [];
        this.methods = [];
		this.hash = null; //the uuid is not as unique as I had hoped.
    }
}

module.exports = UPnPService;