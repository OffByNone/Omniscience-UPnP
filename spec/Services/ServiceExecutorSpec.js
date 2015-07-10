require("babel/register");
const ServiceExecutor = require('../../lib/Services/ServiceExecutor');

describe("ServiceExecutor", function () {
	var _sut;
	beforeEach(function () {
		_sut = ServiceExecutor;
	});

	describe("callService", function () {
		it("should throw an error when serviceControlUrl is null", function () {
			//arrange/act
			try {
				_sut.callService();
				fail("expected error to be thrown.");
			}
			catch (err) {
				//assert
				expect(err.message).toBe("Argument 'serviceControlUrl' cannot be null.");
			}
		});
		it("should throw an error when serviceUUID is null", function () {
			//arrange
			var serviceControlUrl = "scpd url";

			//act
			try {
				_sut.callService(serviceControlUrl);
				fail("expected error to be thrown.");
			}
			catch (err) {
				//assert
				expect(err.message).toBe("Argument 'serviceUUID' cannot be null.");
			}
		});
		it("should throw an error when serviceMethod is null", function () {
			//arrange
			var serviceControlUrl = "scpd url";
			var serviceUUID = "guid knockoff";

			//act
			try {
				_sut.callService(serviceControlUrl, serviceUUID);
				fail("expected error to be thrown.");
			}
			catch (err) {
				//assert
				expect(err.message).toBe("Argument 'serviceMethod' cannot be null.");
			}
		});
		it("should throw an error when the service class does not exist", function () {
			//arrange
			var serviceControlUrl = "scpd url";
			var serviceUUID = "guid knockoff";
			var serviceMethod = "name of method on service to be called";

			//act
			try {
				_sut.callService(serviceControlUrl, serviceUUID, serviceMethod);
				fail("expected error to be thrown.");
			}
			catch (err) {
				//assert
				expect(err.message).toBe("Executable Service has not yet been created.");
			}
		});
		it("should throw an error when the service class exists but the service method does not", function () {
			//arrange
			var serviceControlUrl = "scpd url";
			var serviceUUID = "guid knockoff";
			var serviceMethod = "name of method on service to be called";

			_sut.executableServices[serviceUUID] = {};
			//act
			try {
				_sut.callService(serviceControlUrl, serviceUUID, serviceMethod);
				fail("expected error to be thrown.");
			}
			catch (err) {
				//assert
				expect(err.message).toBe("Executable Service has been created, but method has not.");
			}
		});
		it("should return the result of the call to the service method", function () {
			//arrange
			var serviceControlUrl = "scpd url";
			var serviceUUID = "guid knockoff";
			var serviceMethod = "name of method on service to be called";
			var data = "the data";
			var result = "the result";

			_sut.executableServices[serviceUUID] = jasmine.createSpyObj("executableService", [serviceMethod]);
			_sut.executableServices[serviceUUID][serviceMethod].and.returnValue(result);

			//act
			var actual = _sut.callService(serviceControlUrl, serviceUUID, serviceMethod, data);

			//assert
			expect(_sut.executableServices[serviceUUID][serviceMethod]).toHaveBeenCalledWith(serviceControlUrl, data);
			expect(actual).toBe(result);
		});
	});
});