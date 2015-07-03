///<reference path="../support/jasmine.d.ts" />
require("babel/register");
const SOAPService = require('../../lib/Services/SOAPService');
const Constants = require('../../lib/Constants');

describe("SOAPService", function () {
	var _sut;
	var _mockFetch;
	var _mockDomParser;
	var _mockStringUtilities;
	beforeEach(function () {
		_mockFetch = {};
		_mockDomParser = {};
		_mockStringUtilities = {};
		_sut = new SOAPService(_mockFetch, _mockDomParser, _mockStringUtilities);
	});

	describe("post", function () {

	});
	describe("parametersToXml", function () {

	});
});