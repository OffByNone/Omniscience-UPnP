require("babel/register");
const UPnPServiceFactory = require('../../lib/Factories/UPnPServiceFactory');
const Constants = require('../../lib/Constants');

describe("UPnPServiceFactory", function () {
	var _sut;
	var _mockFetch;
	var _mockXmlParser;
	var _mockUrlProvider;
	var _mockUPnPExtensionInfoFactory;
	var _mockServiceProperyFactory;
	var _mockServiceMethodFactory;
	var _mockServiceExecutor;
	var _mockExecutableServiceMethodFactory;
	beforeEach(function () {
		_mockFetch = jasmine.createSpy("_mockFetch");
		_mockXmlParser = {};
		_mockUrlProvider = {};
		_mockUPnPExtensionInfoFactory = {};
		_mockServiceProperyFactory = {};
		_mockServiceMethodFactory = {};
		_mockServiceExecutor = {};
		_mockExecutableServiceMethodFactory = {};
		_sut = new UPnPServiceFactory(_mockFetch, _mockXmlParser, _mockUrlProvider, _mockUPnPExtensionInfoFactory, _mockServiceProperyFactory, _mockServiceMethodFactory, _mockServiceExecutor, _mockExecutableServiceMethodFactory);
	});

	describe("create", function () { });
});