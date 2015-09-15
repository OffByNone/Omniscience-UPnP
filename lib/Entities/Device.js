"use strict";
class Device {
    constructor() {
		this.address = null; //URL
		this.childDevices = [];
		this.icons = [];
		this.id = null; //USN = uuid + device type
		this.language = null; //{name:'', code: ''}
		this.macAddress = null;
		this.manufacturer = null; //DeviceManufacturer
        this.model = null; //DeviceModel
        this.name = "";
		//this.playlist = [];
        this.responseHash = null; //md5 of the response.text
        this.serialNumber = "";
        this.services = [];
        this.softwareVersion = null;
        this.ssdpDescription = ""; //URL to xml
        this.state = {};
        this.timezone = null;
        this.type = null; //UPnPExtensionInfo
        this.upc = "";
        this.upnpVersion = null; //UPnPVersion
		this.uuid = null; //device uuid -- on my router they are not unique.
        this.webPage = ""; //URL to presentationURL
		this.fontIcons = {};
    }
}

module.exports = Device;