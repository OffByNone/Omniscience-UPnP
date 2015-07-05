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
		it("should create a new serviceproperty from the xml passed in", function () { 
			//arrange
			var xml = "valid xml goes here";
			var name = "that's not my name";
			var dataType = "int64";
			var defaultValue = "default";
			var allowedValues = [{ innerHTML: "use this one" }];

			_mockXmlParser.getText = jasmine.createSpy("getText").and.callFake(function (xml, elName) {
				expect(xml).toBe(xml);
				if (elName === "name") return name;
				if (elName === "dataType") return dataType;
				if (elName === "defaultValue") return defaultValue;
				else fail("unexpected element name was passed to get text");
			});
			_mockXmlParser.getAttribute = jasmine.createSpy("getAttribute").and.returnValue("yes");
			_mockXmlParser.getElements = jasmine.createSpy("getElements").and.returnValue(allowedValues);
			_mockXmlParser.hasNode = jasmine.createSpy("hasNode").and.returnValue(false);
			
			
			//act
			var actual = _sut.create(xml);
			
			//assert
			expect(actual.name).toBe(name);
			expect(actual.datatype).toBe(dataType);
			expect(actual.defaultValue).toBe(defaultValue);
			expect(actual.evented).toBeTruthy();
			expect(Array.isArray(actual.allowedValues)).toBeTruthy();
			expect(actual.allowedValues.length).toBe(1);
			expect(actual.allowedValues[0]).toBe("use this one");

			expect(_mockXmlParser.getAttribute).toHaveBeenCalledWith(xml, "sendEvents");
			expect(_mockXmlParser.getElements).toHaveBeenCalledWith(xml, "allowedValue");
			expect(_mockXmlParser.hasNode).toHaveBeenCalledWith(xml, "allowedValueRange");
		});
		it("should add allowed value range if present in xml", function () {
			//arrange
			var xml = "valid xml goes here";
			var name = "that's not my name";
			var dataType = "int64";
			var defaultValue = "default";
			var allowedValues = [{ innerHTML: "use this one" }];
			var minimum = "not less than this";
			var maximum = "not more than this";
			var step = "increment by this";

			_mockXmlParser.getText = jasmine.createSpy("getText").and.callFake(function (xml, elName) {
				expect(xml).toBe(xml);
				if (elName === "name") return name;
				if (elName === "dataType") return dataType;
				if (elName === "defaultValue") return defaultValue;
				if (elName === "allowedValueRange minimum") return minimum;
				if (elName === "allowedValueRange maximum") return maximum;
				if (elName === "allowedValueRange step") return step;
				else fail("unexpected element name was passed to get text");
			});
			_mockXmlParser.getAttribute = jasmine.createSpy("getAttribute").and.returnValue("yes");
			_mockXmlParser.getElements = jasmine.createSpy("getElements").and.returnValue(allowedValues);
			_mockXmlParser.hasNode = jasmine.createSpy("hasNode").and.returnValue(true);
			
			//act
			var actual = _sut.create(xml);
			
			//assert
			expect(actual.allowedValueRange.minimum).toBe(minimum);
			expect(actual.allowedValueRange.maximum).toBe(maximum);
			expect(actual.allowedValueRange.step).toBe(step);
		});
		it("should set evented to false when not evented", function () {
			//arrange
			var xml = "valid xml goes here";
			var name = "that's not my name";
			var dataType = "int64";
			var defaultValue = "default";
			var allowedValues = [{ innerHTML: "use this one" }];

			_mockXmlParser.getText = jasmine.createSpy("getText").and.callFake(function (xml, elName) {
				expect(xml).toBe(xml);
				if (elName === "name") return name;
				if (elName === "dataType") return dataType;
				if (elName === "defaultValue") return defaultValue;
				else fail("unexpected element name was passed to get text");
			});
			_mockXmlParser.getAttribute = jasmine.createSpy("getAttribute").and.returnValue("no");
			_mockXmlParser.getElements = jasmine.createSpy("getElements").and.returnValue(allowedValues);
			_mockXmlParser.hasNode = jasmine.createSpy("hasNode").and.returnValue(false);
			
			//act
			var actual = _sut.create(xml);
			
			//assert
			expect(actual.evented).toBeFalsy();
		});
	});
});