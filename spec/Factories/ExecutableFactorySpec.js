///<reference path="../support/jasmine.d.ts" />
require("babel/register");
const ExecutableServiceMethodFactory = require('../../lib/Factories/ExecutableServiceMethodFactory');
const Constants = require('../../lib/Constants');

describe("ExecutableServiceMethodFactory", function () {
	var _sut;
	var _mockXmlParser;
	var _mockSOAPService;
	var _mockParameterValidator;
	beforeEach(function () {
		_mockXmlParser = {};
		_mockSOAPService = {};
		_mockParameterValidator = {};
		_sut = new ExecutableServiceMethodFactory(_mockXmlParser, _mockSOAPService, _mockParameterValidator);
	});

	describe("create", function () {

	});
});