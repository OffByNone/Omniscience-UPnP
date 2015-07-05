///<reference path="../support/jasmine.d.ts" />
require("babel/register");
const ParameterValidator = require('../../lib/Services/ParameterValidator');

describe("ParameterValidator", function () {
	var _sut;
	beforeEach(function () {
		_sut = ParameterValidator;
	});

	describe("validate", function () {
		it("should throw an error when argument is null", function () { 
			//arrange
			var parameterName = "param name";
			var validationInfo = {
				name: parameterName
			};
			
			//act
			try {
				_sut.validate(validationInfo, null);
				fail("expected error to be thrown");
			}
			catch (err) { 
				//assert
				expect(err.message).toBe(`Missing required argument: ${validationInfo.name}`);
			}
		});
		it("should throw an error when there is a list of allowed values and parameter passed in is not in it", function () { 
			//arrange
			var validationInfo = {
				name: "param name",
				allowedValues: ["val1"]
			};
			var parameter = "not val1";
			
			//act
			try {
				_sut.validate(validationInfo, parameter);
				fail("expected error to be thrown");
			}
			catch (err) { 
				//assert
				expect(err.message).toBe(`Value '${parameter}' for argument '${validationInfo.name}' is not an allowed value`);
			}
		});
		it("should throw an error when allowed value range is present and parameter is NaN", function () { 
			//arrange
			var validationInfo = {
				name: "param name",
				allowedValues: [],
				allowedValueRange: {
					maximum: 10,
					minimum: 0,
					step:2
				}
			};
			var parameter = "val1";
			
			//act
			try {
				_sut.validate(validationInfo, parameter);
				fail("expected error to be thrown");
			}
			catch (err) { 
				//assert
				expect(err.message).toBe(`Argument '${validationInfo.name}' is required to be a type of number but was instead a type of ` + typeof parameter);
			}
		});
		it("should throw an error when parameter is less than the allowed minimum", function () { 
			//arrange
			var validationInfo = {
				name: "param name",
				allowedValues: [],
				allowedValueRange: {
					maximum: 10,
					minimum: 0,
					step:2
				}
			};
			var parameter = "-1";
			
			//act
			try {
				_sut.validate(validationInfo, parameter);
				fail("expected error to be thrown");
			}
			catch (err) { 
				//assert
				expect(err.message).toBe(`Argument '${validationInfo.name}' is '${parameter}', which is less than the minimum allowed value of '${validationInfo.allowedValueRange.minimum}'`);
			}
		});		
		it("should throw an error when parameter is greater than the allowed maximum", function () { 
			//arrange
			var validationInfo = {
				name: "param name",
				allowedValues: [],
				allowedValueRange: {
					maximum: 10,
					minimum: 0,
					step:2
				}
			};
			var parameter = "11";
			
			//act
			try {
				_sut.validate(validationInfo, parameter);
				fail("expected error to be thrown");
			}
			catch (err) { 
				//assert
				expect(err.message).toBe(`Argument '${validationInfo.name}' is '${parameter}', which is greater than the maximum allowed value of '${validationInfo.allowedValueRange.maximum}'`);
			}
		});
		it("should throw an error when parameter is not a multiple of the step plus the minimum allowed value", function () { 
			//arrange
			var validationInfo = {
				name: "param name",
				allowedValues: [],
				allowedValueRange: {
					maximum: 10,
					minimum: 0,
					step:2
				}
			};
			var parameter = "5";
			
			//act
			try {
				_sut.validate(validationInfo, parameter);
				fail("expected error to be thrown");
			}
			catch (err) { 
				//assert
				expect(err.message).toBe(`Argument '${validationInfo.name}' is '${parameter}', but must be a multiple of '${validationInfo.step}' starting at ${validationInfo.minimum}`);
			}
		});
	});
});