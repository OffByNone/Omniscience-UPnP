"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ServiceProperty = function ServiceProperty() {
    _classCallCheck(this, ServiceProperty);

    this.datatype = null;
    this.name = null;
    this.defaultValue = null;
    this.evented = false;
    this.allowedValues = [];
    this.allowedValueRange = null;
};

module.exports = ServiceProperty;