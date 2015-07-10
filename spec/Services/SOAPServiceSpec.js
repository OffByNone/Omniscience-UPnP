require("babel/register");
const SOAPService = require('../../lib/Services/SOAPService');
const Constants = require('../../lib/Constants');

describe("SOAPService", function () {
	var _sut;
	var _mockFetch;
	var _mockXmlParser;
	var _mockStringUtilities;
	beforeEach(function () {
		_mockFetch = jasmine.createSpy("mockFetch");
		_mockXmlParser = {};
		_mockStringUtilities = {};
		_sut = new SOAPService(_mockFetch, _mockXmlParser, _mockStringUtilities);
	});

	describe("post", function () {
		it("should ", function () {
			//arrange
			var url = "a real live url!";
			var serviceName = "name of the service";
			var methodName = "name of method to execute";
			var parameters = { key: "value" };
			var postResultValue = "what post actually returns";


			var fetchResult = jasmine.createSpyObj("fetchResult", ["then"]);
			fetchResult.then.and.returnValue(postResultValue);
			_mockFetch.and.returnValue(fetchResult);
			var body = "the body";
			_mockStringUtilities.format = jasmine.createSpy("mockformat").and.returnValue(body);

			var response = { _bodyText: "the body as text of the response" };
			var responseXml = "some legit xml";
			_mockXmlParser.parseFromString = jasmine.createSpy("parseFromString").and.returnValue(responseXml);

			//act
			var actual = _sut.post(url, serviceName, methodName, parameters);

			//assert
			expect(_mockFetch).toHaveBeenCalledWith(url, jasmine.any(Object));

			var fetchConfig = _mockFetch.calls.argsFor(0)[1];
			expect(fetchConfig.method).toBe("post");
			expect(fetchConfig.body).toBe(body);
			expect(typeof fetchConfig.headers).toBe("object");
			expect(fetchConfig.headers.SOAPAction).toBe(`"${serviceName}#${methodName}"`);
			expect(fetchConfig.headers['content-Type']).toBe(Constants.SOAP.ContentType);

			expect(_mockStringUtilities.format).toHaveBeenCalledWith(Constants.SOAP.Body, serviceName, methodName, "<key>value</key>");

			expect(actual).toBe(postResultValue);

			expect(fetchResult.then).toHaveBeenCalledWith(jasmine.any(Function));
			var secondActual = fetchResult.then.calls.argsFor(0)[0](response);

			expect(_mockXmlParser.parseFromString).toHaveBeenCalledWith(response._bodyText);
			expect(typeof secondActual).toBe("object");
			expect(secondActual.xml).toBe(responseXml);
			expect(secondActual.text).toBe(response._bodyText);

		});
	});
	describe("parametersToXml", function () {
		it("should take the key/value parameters passed in and turn them into a string of <key>value</key>", function () {
			//arrange
			var parameters = {
				key1: "val1",
				key2: "val2"
			};
			var expected = "<key1>val1</key1><key2>val2</key2>";

			//act
			var actual = _sut.parametersToXml(parameters);

			//assert
			expect(actual).toBe(expected);
		});
	});
});