"use strict";
class UPnPService {
    constructor() {
        this.controlUrl = null; //typeof URL
        this.eventSubUrl = null; //typeof URL
        this.scpdUrl = null; //typeof URL
        this.type = null; //typeof UPnPExtensionInfo
        this.upnpVersion = null; //typeof UPnPVersion
        this.id = null;
        this.properties = [];
        this.methods = [];
		this.hash = null;
		this.fontIcons = []; //media renderer, and some dial devices have more than one
    }
}

module.exports = UPnPService;