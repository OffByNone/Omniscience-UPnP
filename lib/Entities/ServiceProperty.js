"use strict";
class ServiceProperty {
    constructor() {
        this.soapType = null;
		this.jsType = null;
        this.name = null;
        this.defaultValue = null;
        this.evented = false;
        this.allowedValues = [];
        this.allowedValueRange = null;
    }
}

module.exports = ServiceProperty;