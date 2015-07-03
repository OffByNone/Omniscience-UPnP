///<reference path="../support/jasmine.d.ts" />
require("babel/register");
const DeviceFactory = require('../../lib/Factories/DeviceFactory');
const Constants = require('../../lib/Constants');

describe("DeviceFactory", function () {
	var _sut;
	var _mockXmlParser;
	var _mockUrlProvider;
	var _mockMD5;
	var _mockServiceInfoFactory;
	beforeEach(function () {
		_mockXmlParser = {};
		_mockUrlProvider = {};
		_mockMD5 = {};
		_mockServiceInfoFactory = {};
		_sut = new DeviceFactory(_mockXmlParser, _mockUrlProvider, _mockMD5, _mockServiceInfoFactory);
	});

	describe("create", function () {

	});
});