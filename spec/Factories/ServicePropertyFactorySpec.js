///<reference path="../support/jasmine.d.ts" />
require("babel/register");
const ServicePropertyFactory = require('../../lib/Factories/ServicePropertyFactory');
const Constants = require('../../lib/Constants');

describe("ServicePropertyFactory", function () {
	var _sut;
	var _mockXmlParser;
	beforeEach(function () {
		_mockXmlParser = {};
		_sut = new ServicePropertyFactory(_mockXmlParser);
	});

	describe("create", function () {

	});
});