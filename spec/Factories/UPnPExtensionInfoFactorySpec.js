///<reference path="../support/jasmine.d.ts" />
require("babel/register");
const UPnPExtensionInfoFactory = require('../../lib/Factories/UPnPExtensionInfoFactory');
const Constants = require('../../lib/Constants');

describe("UPnPExtensionInfoFactory", function () {
	var _sut;
	beforeEach(function () {
		_sut = UPnPExtensionInfoFactory;
	});

	describe("create", function () {
		it("should throw error when typeString is null", function () { 
			//arrage/act

			try {
				_sut.create(null);
				fail("should have thrown error");
			}
			catch (err) {
				//assert
				expect(err.message).toBe("Argument 'typeString' cannot be null.");
			}
		});
		it("should throw error when typeString does not have either 3 or 4 semi colons", function () { 
			//arrage
			var typeString = "asldkjf";
			
			//act
			try {
				_sut.create(typeString);
				fail("should have thrown error");
			}
			catch (err) {
				//assert
				expect(err.message).toBe("Invalid number of parts.  Must contain either 4 or 5, but had 1");
			}
		});
		it("should return object with correct properties set and isStandard true when domainName is standard and there are 4 parts", function () { 
			//arrage
			var typeString = "a:" + Constants.standardDomainName.id + ":c:d";
			
			//act
			var actual = _sut.create(typeString);
			
			//assert
			expect(actual.parts.toString()).toBe(typeString.split(":").toString());
			expect(actual.raw).toBe(typeString);
			expect(actual.domainName).toBe(Constants.standardDomainName.id);
			expect(actual.type).toBe("c");
			expect(actual.name).toBe("d");
			expect(actual.isStandard).toBeTruthy();
		});
		it("should return object with isStandard false when domainName is not standard and there are 4 parts", function () { 
			//arrage
			var typeString = "a:notStandardDomainName:c:d";
			
			//act
			var actual = _sut.create(typeString);
			
			//assert
			expect(actual.domainName).toBe("notStandardDomainName");
			expect(actual.isStandard).toBeFalsy();
		});
		it("should return object with isStandard true when domainName is standard and there are 5 parts", function () { 
			//arrage
			var typeString = "a:" + Constants.standardDomainName.type + ":c:d:5thpart";
			
			//act
			var actual = _sut.create(typeString);
			
			//assert
			expect(actual.parts.toString()).toBe(typeString.split(":").toString());
			expect(actual.raw).toBe(typeString);
			expect(actual.domainName).toBe(Constants.standardDomainName.type);
			expect(actual.type).toBe("c");
			expect(actual.name).toBe("d");
			expect(actual.isStandard).toBeTruthy();
			expect(actual.version).toBe("5thpart");
		});
		it("should return object with isStandard false when domainName is not standard and there are 5 parts", function () { 
			//arrage
			var typeString = "a:notStandardDomainName:c:d:5thpart";
			
			//act
			var actual = _sut.create(typeString);
			
			//assert
			expect(actual.isStandard).toBeFalsy();
		});
	});
});