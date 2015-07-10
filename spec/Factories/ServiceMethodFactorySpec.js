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
		it("should setup the service method adding out arguments to the return values", function () {
			//arrange
			var methodXml = "xml for the method";
			var dataType = "dataType";
			var allowedValues = "allowedValues";
			var allowedValueRange = "allowedValueRange";
			var backingProperties = [{
				name: "argumentRelatedStateVariable",
				datatype: dataType,
				allowedValues: allowedValues,
				allowedValueRange: allowedValueRange
			}];
			var methodName = "name of method";
			var argumentName = "name of argument";
			var argumentDirection = "out";
			var argumentRelatedStateVariable = "argumentRelatedStateVariable";
			var argumentsXml = ["argumentXml1"];

			_mockXmlParser.getText = jasmine.createSpy("getText").and.callFake(function (xml, elName) {
				if (xml !== methodXml && xml !== argumentsXml[0])
					fail("unexpected xml passed in '" + xml +  "'");

				if (elName === "name" && xml === methodXml) return methodName;
				if (elName === "name" && xml === argumentsXml[0]) return argumentName;
				if (elName === "direction") return argumentDirection;
				if (elName === "relatedStateVariable") return argumentRelatedStateVariable;
				else fail("unexpected element name '" + elName + "' passed in");

			});

			_mockXmlParser.getElements = jasmine.createSpy("getElements").and.callFake(function (xml, elName) {
				expect(xml).toBe(methodXml);

				if (elName === "argument") return argumentsXml;
				else fail("unexpected element name '" + elName + "' passed in");
			});

			//act
			var actual = _sut.create(methodXml, backingProperties);

			//assert
			expect(actual.name).toBe(methodName);
			expect(actual.returnValues.length).toBe(1);
			expect(actual.returnValues[0].name).toBe(argumentName);
			expect(actual.returnValues[0].backingProperty).toBe(backingProperties[0]);
			expect(actual.returnValues[0].datatype).toBe(backingProperties[0].datatype);
			expect(actual.returnValues[0].allowedValues).toBe(backingProperties[0].allowedValues);
			expect(actual.returnValues[0].allowedValueRange).toBe(backingProperties[0].allowedValueRange);
		});
		it("should setup the service method adding in arguments to the parameters", function () {
			//arrange
			var methodXml = "xml for the method";
			var dataType = "dataType";
			var allowedValues = "allowedValues";
			var allowedValueRange = "allowedValueRange";
			var backingProperties = [{
				name: "argumentRelatedStateVariable",
				datatype: dataType,
				allowedValues: allowedValues,
				allowedValueRange: allowedValueRange
			}];
			var methodName = "name of method";
			var argumentName = "name of argument";
			var argumentDirection = "in";
			var argumentRelatedStateVariable = "argumentRelatedStateVariable";
			var argumentsXml = ["argumentXml1"];

			_mockXmlParser.getText = jasmine.createSpy("getText").and.callFake(function (xml, elName) {
				if (xml !== methodXml && xml !== argumentsXml[0])
					fail("unexpected xml passed in '" + xml +  "'");

				if (elName === "name" && xml === methodXml) return methodName;
				if (elName === "name" && xml === argumentsXml[0]) return argumentName;
				if (elName === "direction") return argumentDirection;
				if (elName === "relatedStateVariable") return argumentRelatedStateVariable;
				else fail("unexpected element name '" + elName + "' passed in");

			});

			_mockXmlParser.getElements = jasmine.createSpy("getElements").and.callFake(function (xml, elName) {
				expect(xml).toBe(methodXml);

				if (elName === "argument") return argumentsXml;
				else fail("unexpected element name '" + elName + "' passed in");
			});

			//act
			var actual = _sut.create(methodXml, backingProperties);

			//assert
			expect(actual.name).toBe(methodName);
			expect(actual.parameters.length).toBe(1);
			expect(actual.parameters[0].name).toBe(argumentName);
			expect(actual.parameters[0].backingProperty).toBe(backingProperties[0]);
			expect(actual.parameters[0].datatype).toBe(backingProperties[0].datatype);
			expect(actual.parameters[0].allowedValues).toBe(backingProperties[0].allowedValues);
			expect(actual.parameters[0].allowedValueRange).toBe(backingProperties[0].allowedValueRange);
		});
	});
});