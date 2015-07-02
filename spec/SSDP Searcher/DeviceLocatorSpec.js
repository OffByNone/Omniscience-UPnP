///<reference path="./support/jasmine.d.ts" />
require("babel/register");
const DeviceLocator = require("../lib/DeviceLocator");
const Constants = require('../lib/Constants');

describe("DeviceLocator", function () {
	var _sut;
	var _mockTimer,
		_mockFetch,
		_mockActiveSearcher,
		_mockPassiveSearcher;

	beforeEach(function () {
		_mockTimer = {};
		_mockFetch = jasmine.createSpy("mock fetch");
		_mockActiveSearcher = jasmine.createSpyObj("_mockActiveSearcher", ["on", "search"]);
		_mockPassiveSearcher = jasmine.createSpyObj("_mockPassiveSearcher", ["on", "search"]);
		_sut = new DeviceLocator(_mockTimer, _mockFetch, _mockActiveSearcher, _mockPassiveSearcher);
	});

	describe("search", function () {
		it("should initialize then trigger a search on both searchers, when they are not initialized", function () {
			//act/arrange
			_sut.search();
			
			//assert
			expect(_mockActiveSearcher.on).toHaveBeenCalledWith("found", jasmine.any(Function));
			expect(_mockActiveSearcher.search).toHaveBeenCalledWith();

			expect(_mockPassiveSearcher.on).toHaveBeenCalledWith("found", jasmine.any(Function));
			expect(_mockPassiveSearcher.on).toHaveBeenCalledWith("lost", jasmine.any(Function));
			expect(_mockPassiveSearcher.search).toHaveBeenCalledWith();
		});
		it("should not initialize the searchers when they are already initialized", function () {
			//act/arange
			_sut.search();
			
			//reset call counts
			_mockActiveSearcher.on.calls.reset();
			_mockPassiveSearcher.on.calls.reset();

			_sut.search();
			
			//assert
			expect(_mockActiveSearcher.on).not.toHaveBeenCalled();
			expect(_mockActiveSearcher.search.calls.count()).toBe(2);
			expect(_mockPassiveSearcher.on).not.toHaveBeenCalled();
			expect(_mockPassiveSearcher.search.calls.count()).toBe(2);
		});
		describe("when device lost", function () {
			it("should emit deviceLost event with deviceId when passiveSearcher emits lost", function () {
				//arrange
				var lostFunction = jasmine.createSpy("lostCallback");
				var deviceId = "mydeviceid";
				var headers = { st: "valid", usn: deviceId + "::" };

				_sut.on("deviceLost", lostFunction);
				_sut.search();

				var lostDeviceArgs = _mockPassiveSearcher.on.calls.argsFor(1);
				
				//act
				lostDeviceArgs[1](headers);
				
				//assert
				expect(lostFunction).toHaveBeenCalledWith(deviceId);
			});
		});
		describe("when device found", function () {
			it("should set active and passive searcher found events to the same function", function () {
				//act/arrange
				_sut.search();
				
				//assert
				var activeSearcherFoundArgs = _mockActiveSearcher.on.calls.argsFor(0);
				var passiveSearcherFoundArgs = _mockPassiveSearcher.on.calls.argsFor(0);

				expect(activeSearcherFoundArgs[1].toString()).toBe(passiveSearcherFoundArgs[1].toString());
			});
			it("should emit deviceFound event when device has not been seen before", function () {
				//arrange
				_mockTimer.clearTimeout = jasmine.createSpy("clearTimeout");

				var foundFunction = jasmine.createSpy("foundCallback");
				var id = "avaliduuid";
				var headers = { usn: "uuid:" + id, location: "the location", fromAddress: "fromAddress", serverIP: "serverIP"};

				_sut.on("deviceFound", foundFunction);
				_sut.search();

				var foundDeviceArgs = _mockPassiveSearcher.on.calls.argsFor(0);
				
				//act
				foundDeviceArgs[1](headers, false);
				
				//assert
				expect(foundFunction).toHaveBeenCalledWith(id, headers.location, headers.fromAddress, headers.serverIP);
			});
			it("should emit deviceFound event when ignoreDebounce is true", function () { 
				//arrange
				_mockTimer.clearTimeout = jasmine.createSpy("clearTimeout");

				var foundFunction = jasmine.createSpy("foundCallback");
				var id = "avaliduuid";
				var headers = { usn: "uuid:" + id, location: "the location", fromAddress: "fromAddress", serverIP: "serverIP"};

				_sut.on("deviceFound", foundFunction);
				_sut.search();

				var foundDeviceArgs = _mockPassiveSearcher.on.calls.argsFor(0);
								
				//act
				foundDeviceArgs[1](headers, true); //estabilish a lastResponse
				
				foundFunction.calls.reset();

				foundDeviceArgs[1](headers, true);	//call again once it has a last response
						
				//assert
				expect(foundFunction).toHaveBeenCalledWith(id, headers.location, headers.fromAddress, headers.serverIP);
			});
			it("should emit deviceFound event when debounceTimeout for device has expired", function () { 
				//arrange
				_mockTimer.clearTimeout = jasmine.createSpy("clearTimeout");

				var foundFunction = jasmine.createSpy("foundCallback");
				var id = "avaliduuid";
				var headers = { usn: "uuid:" + id, location: "the location", fromAddress: "fromAddress", serverIP: "serverIP"};

				_sut.debounceTimeout = -1;
				_sut.on("deviceFound", foundFunction);
				_sut.search();

				var foundDeviceArgs = _mockPassiveSearcher.on.calls.argsFor(0);
								
				//act
				foundDeviceArgs[1](headers, false); //estabilish a lastResponse
				
				foundFunction.calls.reset();

				foundDeviceArgs[1](headers, false);	//call again once it has a last response
						
				//assert
				expect(foundFunction).toHaveBeenCalledWith(id, headers.location, headers.fromAddress, headers.serverIP);
			});
			it("should not emit deviceFound event when debounceTimeout for device has not expired, and ignoreDebounce is false", function () { 
				//arrange
				_mockTimer.clearTimeout = jasmine.createSpy("clearTimeout");

				var foundFunction = jasmine.createSpy("foundCallback");
				var headers = { usn: "uuid:avaliduuid:" };

				_sut.on("deviceFound", foundFunction);
				_sut.search();

				var foundDeviceArgs = _mockPassiveSearcher.on.calls.argsFor(0);
								
				//act
				foundDeviceArgs[1](headers, false); //estabilish a lastResponse
				
				foundFunction.calls.reset();

				foundDeviceArgs[1](headers, false);	//call again once it has a last response
						
				//assert
				expect(foundFunction).not.toHaveBeenCalled();
			});
			it("should emit deviceFound event when cache-control timeout expires and pinging device is successful", function () { 
				//arrange
				_mockTimer.clearTimeout = jasmine.createSpy("clearTimeout");
				_mockTimer.setTimeout = jasmine.createSpy("setTimeout");

				var mockFetchThen = jasmine.createSpy("fetch then");

				_mockFetch.and.returnValue({ then: mockFetchThen });

				var foundFunction = jasmine.createSpy("foundCallback");
				var id = "avaliduuid";
				var headers = { usn: "uuid:" + id, location: "the location", fromAddress: "fromAddress", serverIP: "serverIP"};
				var timeout = 13;
				headers["cache-control"] = "something=" + timeout;

				_sut.on("deviceFound", foundFunction);
				_sut.search();

				var foundDeviceArgs = _mockPassiveSearcher.on.calls.argsFor(0);

				//act
				foundDeviceArgs[1](headers, false);
						
				//assert
				expect(_mockTimer.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), timeout * 1000);

				var callback = _mockTimer.setTimeout.calls.mostRecent().args[0];
				expect(typeof callback).toBe("function");

				callback();
				expect(_mockFetch).toHaveBeenCalledWith(headers.location, { method: 'head' });
				var fetchCallback = mockFetchThen.calls.mostRecent().args[0];
				foundFunction.calls.reset();
				fetchCallback();

				expect(foundFunction).toHaveBeenCalledWith(id, headers.location, headers.fromAddress, headers.serverIP);
			});
			it("should clear previous cache-control timeout when it exists", function () {
				//arrange
				_mockTimer.clearTimeout = jasmine.createSpy("clearTimeout");
				var expected = "should be this";
				_mockTimer.setTimeout = jasmine.createSpy("setTimeout").and.returnValue(expected);

				var foundFunction = jasmine.createSpy("foundCallback");
				var headers = { usn: "uuid:avaliduuid:" };
				var timeout = 13;
				headers["cache-control"] = "something=" + timeout;

				_sut.on("deviceFound", foundFunction);
				_sut.search();

				var foundDeviceArgs = _mockPassiveSearcher.on.calls.argsFor(0);

				//act
				foundDeviceArgs[1](headers, false); //estabilish a timeout to clear
				_mockTimer.clearTimeout.calls.reset();
				foundDeviceArgs[1](headers, false);
						
				//assert
				expect(_mockTimer.clearTimeout).toHaveBeenCalledWith(expected);
			});
			it("should emit deviceLost event when cache-control timeout expires and pinging device is not successful", function () { 
				//arrange
				_mockTimer.clearTimeout = jasmine.createSpy("clearTimeout");
				_mockTimer.setTimeout = jasmine.createSpy("setTimeout");

				var mockFetchThen = jasmine.createSpy("fetch then");

				_mockFetch.and.returnValue({ then: mockFetchThen });

				var lostFunction = jasmine.createSpy("foundCallback");
				var location = "the location";
				var deviceId = "avaliduuid";
				var headers = { usn: "uuid:" + deviceId + ":", location: location };
				var timeout = 13;
				headers["cache-control"] = "something=" + timeout;

				_sut.on("deviceLost", lostFunction);
				_sut.search();

				var foundDeviceArgs = _mockPassiveSearcher.on.calls.argsFor(0);

				//act
				foundDeviceArgs[1](headers, false);
						
				//assert
				expect(_mockTimer.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), timeout * 1000);

				var callback = _mockTimer.setTimeout.calls.mostRecent().args[0];
				expect(typeof callback).toBe("function");

				callback();
				expect(_mockFetch).toHaveBeenCalledWith(location, { method: 'head' });
				var fetchCallback = mockFetchThen.calls.mostRecent().args[1];
				fetchCallback();

				expect(lostFunction).toHaveBeenCalledWith(deviceId);
			});
			it("should not update debounce wait time when timeout has not expired", function () { 
				//todo: write this test
				
			});
		});

	});
});