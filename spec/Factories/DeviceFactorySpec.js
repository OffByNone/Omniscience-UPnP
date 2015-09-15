require("babel/register");
const DeviceFactory = require('../../lib/Factories/DeviceFactory');
const Constants = require('../../lib/Constants');

describe("DeviceFactory", function () {
	var _sut;
	var _mockXmlParser;
	var _mockUrlProvider;
	var _mockMD5;
	var _mockServiceInfoFactory;
	var _mockUPnPExtensionInfoFactory;
	beforeEach(function () {
		_mockXmlParser = {};
		_mockUrlProvider = {};
		_mockMD5 = jasmine.createSpy("mockMD5");
		_mockServiceInfoFactory = {};
		_mockUPnPExtensionInfoFactory = {};
		_sut = new DeviceFactory(_mockXmlParser, _mockUrlProvider, _mockMD5, _mockServiceInfoFactory, _mockUPnPExtensionInfoFactory);
	});

	describe("build", function () { });
	describe("_parseDeviceAttributes", function () { });
	describe("_parseDeviceIcons", function () { });
});