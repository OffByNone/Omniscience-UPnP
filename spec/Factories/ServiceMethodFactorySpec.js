///<reference path="../support/jasmine.d.ts" />
require("babel/register");
const ServiceMethodFactory = require('../../lib/Factories/ServiceMethodFactory');
const Constants = require('../../lib/Constants');

describe("ServiceMethodFactory", function () {
	var _sut;
	var _mockXmlParser;
	beforeEach(function () {
		_mockXmlParser = {};
		_sut = new ServiceMethodFactory(_mockXmlParser);
	});

	describe("create", function () {

	});
});