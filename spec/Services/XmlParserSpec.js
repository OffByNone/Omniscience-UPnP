///<reference path="../support/jasmine.d.ts" />
require("babel/register");
const XmlParser = require('../../lib/Services/XmlParser');
const Constants = require('../../lib/Constants');

describe("XmlParser", function () {
	var _sut;
	var _mockDomParser;
	beforeEach(function () {
		_mockDomParser = {};
		_sut = new XmlParser(_mockDomParser);
	});

	describe("parseFromString", function () {
		it("should return string as xml doc when the argument passed in is a string", function () {
			//arrange
			var stringToBeConverted = "some valid xml";
			var xmlResult = "some xml";

			_mockDomParser.parseFromString = jasmine.createSpy("parseFromString").and.returnValue(xmlResult);
			
			//act
			var actual = _sut.parseFromString(stringToBeConverted);
			
			//assert
			expect(_mockDomParser.parseFromString).toHaveBeenCalledWith(stringToBeConverted, 'text/xml');
			expect(actual).toBe(xmlResult);
		});
		it("should return null when the argument passed in is not a string", function () {
			//arrange/act
			var actual = _sut.parseFromString(null);
			
			//assert
			expect(actual).toBeNull();
		});		
	});
	describe("getElements", function () {
		it("should return all matching elements as array of elements when xml is not null and contains a querySelectorAll function", function () {
			//arrange
			var xml = jasmine.createSpyObj("xml", ["querySelectorAll"]);
			var selector = "selector to match against";
			var result = ["t", "s"];

			xml.querySelectorAll.and.returnValue(result);
			
			//act
			var actual = _sut.getElements(xml, selector);
			
			//assert
			expect(xml.querySelectorAll).toHaveBeenCalledWith(selector);
			expect(Array.isArray(actual)).toBeTruthy();
			expect(actual.length).toBe(2);
			expect(actual[0]).toBe(result[0]);
			expect(actual[1]).toBe(result[1]);
		});
		it("should return an empty array when xml is null", function () {
			//arrange
			var selector = "selector to match against";
			//act
			var actual = _sut.getElements(null, selector);
			
			//assert
			expect(Array.isArray(actual)).toBeTruthy();
			expect(actual.length).toBe(0);
		});
		it("should return an empty array when xml is not null and does not contain a querySelectorAll function", function () {
			//arrange
			var xml = {};
			var selector = "selector to match against";
			//act
			var actual = _sut.getElements(xml, selector);
			
			//assert
			expect(Array.isArray(actual)).toBeTruthy();
			expect(actual.length).toBe(0);
		});
	});
	describe("getElement", function () {
		it("should return matching element when xml is not null and contains a querySelector function", function () {
			//arrange
			var xml = jasmine.createSpyObj("xml", ["querySelector"]);
			var selector = "selector to match against";
			var result = "tsd";

			xml.querySelector.and.returnValue(result);
			
			//act
			var actual = _sut.getElement(xml, selector);
			
			//assert
			expect(xml.querySelector).toHaveBeenCalledWith(selector);
			expect(actual).toBe(result);
		});
		it("should return null when xml is null", function () {
			//arrange
			var xml = null;
			var selector = "selector to match against";

			//act
			var actual = _sut.getElement(xml, selector);
			
			//assert
			expect(actual).toBeNull();
		});
		it("should return null when xml is not null and does not contain a querySelector function", function () {
			//arrange
			var xml = {};
			var selector = "selector to match against";

			//act
			var actual = _sut.getElement(xml, selector);
			
			//assert
			expect(actual).toBeNull();
		});
	});
	describe("hasNode", function () {
		it("should return true when xml is not null, contains a querySelector function, and node is in xml", function () {
			//arrange
			var xml = jasmine.createSpyObj("xml", ["querySelector"]);
			var selector = "selector to match against";
			var result = "tsd";

			xml.querySelector.and.returnValue(result);
			
			//act
			var actual = _sut.hasNode(xml, selector);
			
			//assert
			expect(xml.querySelector).toHaveBeenCalledWith(selector);
			expect(actual).toBeTruthy();
		});
		it("should return true when xml is not null, contains a querySelector function, and node is not in xml", function () {
			//arrange
			var xml = jasmine.createSpyObj("xml", ["querySelector"]);
			var selector = "selector to match against";

			xml.querySelector.and.returnValue(null);
			
			//act
			var actual = _sut.hasNode(xml, selector);
			
			//assert
			expect(xml.querySelector).toHaveBeenCalledWith(selector);
			expect(actual).toBeFalsy();
		});
		it("should return false when xml is null", function () {
			//arrange
			var xml = null;
			var selector = "selector to match against";

			//act
			var actual = _sut.hasNode(xml, selector);
			
			//assert
			expect(actual).toBeFalsy();
		});
		it("should return false when xml is not null and does not contain a querySelector function", function () {
			//arrange
			var xml = {};
			var selector = "selector to match against";

			//act
			var actual = _sut.hasNode(xml, selector);
			
			//assert
			expect(actual).toBeFalsy();
		});
	});
	describe("getText", function () {
		it("should return innerHTML of element when xml is not null, contains a querySelector function, and element is in xml", function () {
			//arrange
			var xml = jasmine.createSpyObj("xml", ["querySelector"]);
			var selector = "selector to match against";
			var result = { innerHTML: "some text" };

			xml.querySelector.and.returnValue(result);
			
			//act
			var actual = _sut.getText(xml, selector);
			
			//assert
			expect(xml.querySelector).toHaveBeenCalledWith(selector);
			expect(actual).toBe(result.innerHTML);
		});
		it("should return undefined when xml is not null, contains a querySelector function, and element is not in xml", function () {
			//arrange
			var xml = jasmine.createSpyObj("xml", ["querySelector"]);
			var selector = "selector to match against";

			xml.querySelector.and.returnValue(null);
			
			//act
			var actual = _sut.getText(xml, selector);
			
			//assert
			expect(xml.querySelector).toHaveBeenCalledWith(selector);
			expect(actual).toBeUndefined();
		});
		it("should return false when xml is null", function () {
			//arrange
			var xml = null;
			var selector = "selector to match against";

			//act
			var actual = _sut.getText(xml, selector);
			
			//assert
			expect(actual).toBeNull();
		});
		it("should return false when xml is not null and does not contain a querySelector function", function () {
			//arrange
			var xml = {};
			var selector = "selector to match against";

			//act
			var actual = _sut.getText(xml, selector);
			
			//assert
			expect(actual).toBeNull();
		});
	});
	describe("getAttribute", function () {
		it("should return attribute value when attribute exists on node", function () {
			//arrange
			var node = { attributes: jasmine.createSpyObj("attributes", ["getNamedItem"]) };
			var attributeName = "attributeName";
			var attributeValue = "attributeValue";
			var attribute = { value: attributeValue }; 

			node.attributes.getNamedItem.and.returnValue(attribute);

			//act
			var actual = _sut.getAttribute(node, attributeName);
			
			//assert
			expect(node.attributes.getNamedItem).toHaveBeenCalledWith(attributeName);
			expect(actual).toBe(attributeValue);
		});
		it("should return null when attribute does not exist on node", function () {
			//arrange
			var node = { attributes: jasmine.createSpyObj("attributes", ["getNamedItem"]) };
			var attributeName = "attributeName";
			var attributeValue = "attributeValue";

			node.attributes.getNamedItem.and.returnValue(null);

			//act
			var actual = _sut.getAttribute(node, attributeName);
			
			//assert
			expect(node.attributes.getNamedItem).toHaveBeenCalledWith(attributeName);
			expect(actual).toBeNull();
		});
	});
});