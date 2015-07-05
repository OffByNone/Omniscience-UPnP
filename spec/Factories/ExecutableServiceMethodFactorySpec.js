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
		it("should throw error when method is null", function () {
			try {
				_sut.create();
				fail("expected error to be thrown");
			}
			catch (err) {
				expect(err.message).toBe("Argument 'method' cannot be null.");
			}
		});
		it("should throw error when urn is null", function () {
			var method = "the method to be called";
			try {
				_sut.create(method);
				fail("expected error to be thrown");
			}
			catch (err) {
				expect(err.message).toBe("Argument 'urn' cannot be null.");
			}
		});
		it("should ", function () {
			//arrange
			var parameter1 = { name: "param1" };
			var parameter2 = { name: "param2" };
			var returnValue1 = { name: "val1" };
			var returnValue2 = { name: "val2" };
			var method = {
				parameters: [parameter1, parameter2],
				name: "methodName",
				returnValues: [returnValue1, returnValue2]
			};
			var urn = "uuid i believe";
			var controlUrl = "controlUrl";
			var params = { param1: "param1Val", param2: "param2Val" };

			_mockParameterValidator.validate = jasmine.createSpy("validate");

			var thenResult = jasmine.createSpyObj("thenResult", ["then"]);
			_mockSOAPService.post = jasmine.createSpy("post").and.returnValue(thenResult);

			var thenResponse = { xml: "xmlefg", text: "textabc" };
			var returnVal1Result = "returnVal1Result";
			var returnVal2Result = "returnVal2Result";

			_mockXmlParser.getText = jasmine.createSpy("getText").and.callFake(function (xml, name) {
				expect(xml).toBe(thenResponse.xml);

				if (name === returnValue1.name) return returnVal1Result;
				if (name === returnValue2.name) return returnVal2Result;
				else fail("unexpected name '" + name + "' passed in");
			});
			
			//act
			var actual = _sut.create(method, urn);

			//assert
			expect(typeof actual).toBe("function");
			actual(controlUrl, params);
			expect(_mockParameterValidator.validate).toHaveBeenCalledWith(parameter1, params.param1);
			expect(_mockParameterValidator.validate).toHaveBeenCalledWith(parameter2, params.param2);
			expect(_mockSOAPService.post).toHaveBeenCalledWith(controlUrl, urn, method.name, params);
			expect(thenResult.then).toHaveBeenCalledWith(jasmine.any(Function));

			var secondActual = thenResult.then.calls.argsFor(0)[0](thenResponse);
			expect(secondActual._raw).toBe(thenResponse.text);
			expect(secondActual[returnValue1.name]).toBe(returnVal1Result);
			expect(secondActual[returnValue2.name]).toBe(returnVal2Result);
		});
	});
});