"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Device = function Device() {
    _classCallCheck(this, Device);

    this.address = null; //URL
    this.childDevices = [];
    this.icons = [];
    this.id = null; //device uuid
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
    this.webPage = ""; //URL to presentationURL
};

module.exports = Device;