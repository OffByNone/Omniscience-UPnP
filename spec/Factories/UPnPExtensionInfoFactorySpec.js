///<reference path="../support/jasmine.d.ts" />
require("babel/register");
const UPnPExtensionInfoFactory = require('../../lib/Factories/UPnPExtensionInfoFactory');
const Constants = require('../../lib/Constants');

describe("UPnPExtensionInfoFactory", function () {
	var _sut;
	beforeEach(function () {
		_sut = new UPnPExtensionInfoFactory();
	});

	describe("create", function () {

	});
});