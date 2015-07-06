"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ServiceArgument = function ServiceArgument() {
    _classCallCheck(this, ServiceArgument);

    this.name = null;
    this.backingProperty = null;
    this.datatype = null;
    this.allowedValues = [];
    this.allowedValueRange = null;
};

module.exports = ServiceArgument;