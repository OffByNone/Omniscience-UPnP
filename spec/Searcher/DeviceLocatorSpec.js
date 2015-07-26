require("babel/register");
const DeviceLocator = require('../../lib/Searcher/DeviceLocator');
const Constants = require('../../lib/Constants');

describe("DeviceLocator", function () {
	var _sut;
	var _mockTimer,
		_mockFetch,
		_mockActiveSearcher,
		_mockPassiveSearcher,
		_mockXmlParser;

	beforeEach(function () {
		_mockTimer = {};
		_mockXmlParser = {};
		_mockFetch = jasmine.createSpy("mock fetch");
		_mockActiveSearcher = jasmine.createSpyObj("_mockActiveSearcher", ["on", "search"]);
		_mockPassiveSearcher = jasmine.createSpyObj("_mockPassiveSearcher", ["on", "listen"]);
		_sut = new DeviceLocator(_mockTimer, _mockFetch, _mockActiveSearcher, _mockPassiveSearcher, _mockXmlParser);
	});
	describe("stop", function () {
		it("should stop both the passive and active searchers", function () {
			//arrange
			_mockActiveSearcher.stop = jasmine.createSpy("stop");
			_mockPassiveSearcher.stop = jasmine.createSpy("stop");

			//act
			_sut.stop();

			//assert
			expect(_mockActiveSearcher.stop).toHaveBeenCalledWith();
			expect(_mockPassiveSearcher.stop).toHaveBeenCalledWith();
		});
	});
	describe("search", function () {
		it("should initialize then trigger a search on both searchers, when they are not initialized", function () {
			//act/arrange
			_sut.search([]);

			//assert
			expect(_mockActiveSearcher.on).toHaveBeenCalledWith("found", jasmine.any(Function));
			expect(_mockActiveSearcher.search).toHaveBeenCalledWith();

			expect(_mockPassiveSearcher.on).toHaveBeenCalledWith("found", jasmine.any(Function));
			expect(_mockPassiveSearcher.on).toHaveBeenCalledWith("lost", jasmine.any(Function));
			expect(_mockPassiveSearcher.listen).toHaveBeenCalledWith();
		});
		it("should not initialize the searchers when they are already initialized", function () {
			//act/arange
			_sut.search([]);

			//reset call counts
			_mockActiveSearcher.on.calls.reset();
			_mockPassiveSearcher.on.calls.reset();

			_sut.search([]);

			//assert
			expect(_mockActiveSearcher.on).not.toHaveBeenCalled();
			expect(_mockActiveSearcher.search.calls.count()).toBe(2);
			expect(_mockPassiveSearcher.on).not.toHaveBeenCalled();
			expect(_mockPassiveSearcher.listen.calls.count()).toBe(1);
		});
		it("should emit device lost event when device passed in responded with an error", function () {
			//arrange
			var device = {ssdpDescription: "deviceSSDPDesc", id:"device"};
			var devices = [device];

			var lostFunc = jasmine.createSpy("onDeviceLost");
			
			_sut.on("deviceLost", lostFunc);
			
			var fetchResponse = { _bodyText: "device" };
			var fetchResult = jasmine.createSpyObj("fetchResult", ["then"]);
			var thenResult = jasmine.createSpyObj("first level then result", ["then"]);
			
			fetchResult.then.and.returnValue(thenResult);
			_mockFetch.and.returnValue(fetchResult);
			
			//act
			_sut.search(devices);
			
			//assert
			expect(_mockFetch).toHaveBeenCalledWith(device.ssdpDescription);
			expect(fetchResult.then).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
			expect(typeof fetchResult.then.calls.argsFor(0)[0]).toBe("function");
			var fetchResultResult = fetchResult.then.calls.argsFor(0)[0]({ok: false});
			expect(fetchResultResult).toBeFalsy();
			
			expect(thenResult.then).toHaveBeenCalledWith(jasmine.any(Function));
			thenResult.then.calls.argsFor(0)[0](false);
			
			expect(lostFunc).toHaveBeenCalledWith(device.id);
		});
		it("should emit device lost event when device passed in did not respond", function () {
			//arrange
			var device = {ssdpDescription: "deviceSSDPDesc", id:"device"};
			var devices = [device];

			var lostFunc = jasmine.createSpy("onDeviceLost");
			
			_sut.on("deviceLost", lostFunc);
			
			var fetchResponse = { _bodyText: "device" };
			var fetchResult = jasmine.createSpyObj("fetchResult", ["then"]);
			var thenResult = jasmine.createSpyObj("first level then result", ["then"]);
			
			fetchResult.then.and.returnValue(thenResult);
			_mockFetch.and.returnValue(fetchResult);
			
			//act
			_sut.search(devices);
			
			//assert
			expect(_mockFetch).toHaveBeenCalledWith(device.ssdpDescription);
			expect(fetchResult.then).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
			expect(typeof fetchResult.then.calls.argsFor(0)[1]).toBe("function");
			var fetchResultResult = fetchResult.then.calls.argsFor(0)[1]();
			expect(fetchResultResult).toBeFalsy();
			
			expect(thenResult.then).toHaveBeenCalledWith(jasmine.any(Function));
			thenResult.then.calls.argsFor(0)[0](false);
			
			expect(lostFunc).toHaveBeenCalledWith(device.id);
		});
		it("should emit device lost event when device passed in responds to fetch with xml that does not contain the correct device id", function () {
			//arrange
			var device = {ssdpDescription: "deviceSSDPDesc", id:"device"};
			var devices = [device];

			var lostFunc = jasmine.createSpy("onDeviceLost");
			
			_sut.on("deviceLost", lostFunc);
			
			var fetchResponse = { _bodyText: "device" };
			var fetchResult = jasmine.createSpyObj("fetchResult", ["then"]);
			var thenResult = jasmine.createSpyObj("first level then result", ["then"]);
			
			fetchResult.then.and.returnValue(thenResult);
			_mockFetch.and.returnValue(fetchResult);
			
			var responseXml = "responseXml";
			var elementsResult = [{innerHTML: "notdevice"},{innerHTML: "notthedevice"}];
			_mockXmlParser.parseFromString = jasmine.createSpy("parseFromString").and.returnValue(responseXml);
			_mockXmlParser.getElements = jasmine.createSpy("getElements").and.returnValue(elementsResult);
			
			//act
			_sut.search(devices);
			
			//assert
			expect(_mockFetch).toHaveBeenCalledWith(device.ssdpDescription);
			expect(fetchResult.then).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
			expect(typeof fetchResult.then.calls.argsFor(0)[1]).toBe("function");
			var fetchResultResult = fetchResult.then.calls.argsFor(0)[0]({ok: true, _bodyText:"_bodyText"});
			
			expect(_mockXmlParser.parseFromString).toHaveBeenCalledWith("_bodyText");
			expect(_mockXmlParser.getElements).toHaveBeenCalledWith(responseXml, "UDN");

			expect(fetchResultResult).toBeFalsy();
			
			expect(thenResult.then).toHaveBeenCalledWith(jasmine.any(Function));
			thenResult.then.calls.argsFor(0)[0](false);
		
			expect(lostFunc).toHaveBeenCalledWith(device.id);
		});
		it("should not emit device lost event when device passed in responds to fetch with xml that contains the correct device id", function () {
			//arrange
			var device = {ssdpDescription: "deviceSSDPDesc", id:"device"};
			var devices = [device];

			var lostFunc = jasmine.createSpy("onDeviceLost");
			
			_sut.on("deviceLost", lostFunc);
			
			var fetchResponse = { _bodyText: "device" };
			var fetchResult = jasmine.createSpyObj("fetchResult", ["then"]);
			var thenResult = jasmine.createSpyObj("first level then result", ["then"]);
			
			fetchResult.then.and.returnValue(thenResult);
			_mockFetch.and.returnValue(fetchResult);
			
			var responseXml = "responseXml";
			var elementsResult = [{innerHTML: "notdevice"},{innerHTML: "uuid:device"}];
			_mockXmlParser.parseFromString = jasmine.createSpy("parseFromString").and.returnValue(responseXml);
			_mockXmlParser.getElements = jasmine.createSpy("getElements").and.returnValue(elementsResult);
			
			//act
			_sut.search(devices);
			
			//assert
			expect(_mockFetch).toHaveBeenCalledWith(device.ssdpDescription);
			expect(fetchResult.then).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
			expect(typeof fetchResult.then.calls.argsFor(0)[1]).toBe("function");
			var fetchResultResult = fetchResult.then.calls.argsFor(0)[0]({ok: true, _bodyText:"_bodyText"});
			
			expect(_mockXmlParser.parseFromString).toHaveBeenCalledWith("_bodyText");
			expect(_mockXmlParser.getElements).toHaveBeenCalledWith(responseXml, "UDN");

			expect(fetchResultResult).toBeTruthy();
			
			expect(thenResult.then).toHaveBeenCalledWith(jasmine.any(Function));
			thenResult.then.calls.argsFor(0)[0](true);
		
			expect(lostFunc).not.toHaveBeenCalled();
		});
		describe("when device lost", function () {
			it("should emit deviceLost event with deviceId when passiveSearcher emits lost", function () {
				//arrange
				var lostFunction = jasmine.createSpy("lostCallback");
				var deviceId = "mydeviceid";
				var headers = { st: "valid", usn: deviceId + "::" };

				_sut.on("deviceLost", lostFunction);
				_sut.search([]);

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
				_sut.search([]);

				//assert
				var activeSearcherFoundArgs = _mockActiveSearcher.on.calls.argsFor(0);
				var passiveSearcherFoundArgs = _mockPassiveSearcher.on.calls.argsFor(0);

				expect(activeSearcherFoundArgs[1].toString()).toBe(passiveSearcherFoundArgs[1].toString());
			});
			it("should emit deviceFound event when device has not been seen before", function () {
				//arrange
				_mockTimer.clearTimeout = jasmine.createSpy("clearTimeout");
				_mockTimer.setTimeout = jasmine.createSpy("setTimeout");

				var foundFunction = jasmine.createSpy("foundCallback");
				var id = "avaliduuid";
				var headers = { usn: "uuid:" + id, location: "the location", fromAddress: "fromAddress", serverIP: "serverIP" };

				_sut.on("deviceFound", foundFunction);
				_sut.search([]);

				var foundDeviceArgs = _mockPassiveSearcher.on.calls.argsFor(0);

				//act
				foundDeviceArgs[1](headers, false);

				//assert
				expect(foundFunction).toHaveBeenCalledWith(id, headers.location, headers.fromAddress, headers.serverIP);
			});
			it("should emit deviceFound event when ignoreDebounce is true", function () {
				//arrange
				_mockTimer.clearTimeout = jasmine.createSpy("clearTimeout");
				_mockTimer.setTimeout = jasmine.createSpy("setTimeout");

				var foundFunction = jasmine.createSpy("foundCallback");
				var id = "avaliduuid";
				var headers = { usn: "uuid:" + id, location: "the location", fromAddress: "fromAddress", serverIP: "serverIP" };

				_sut.on("deviceFound", foundFunction);
				_sut.search([]);

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
				_mockTimer.setTimeout = jasmine.createSpy("setTimeout");

				var foundFunction = jasmine.createSpy("foundCallback");
				var id = "avaliduuid";
				var headers = { usn: "uuid:" + id, location: "the location", fromAddress: "fromAddress", serverIP: "serverIP" };

				_sut.debounceTimeout = -1;
				_sut.on("deviceFound", foundFunction);
				_sut.search([]);

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
				_mockTimer.setTimeout = jasmine.createSpy("setTimeout");

				var foundFunction = jasmine.createSpy("foundCallback");
				var headers = { usn: "uuid:avaliduuid:" };

				_sut.on("deviceFound", foundFunction);
				_sut.search([]);

				var foundDeviceArgs = _mockPassiveSearcher.on.calls.argsFor(0);

				//act
				foundDeviceArgs[1](headers, false); //estabilish a lastResponse

				foundFunction.calls.reset();

				foundDeviceArgs[1](headers, false);	//call again once it has a last response

				//assert
				expect(foundFunction).not.toHaveBeenCalled();
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
				_sut.search([]);

				var foundDeviceArgs = _mockPassiveSearcher.on.calls.argsFor(0);

				//act
				foundDeviceArgs[1](headers, false); //estabilish a timeout to clear
				_mockTimer.clearTimeout.calls.reset();
				foundDeviceArgs[1](headers, false);

				//assert
				expect(_mockTimer.clearTimeout).toHaveBeenCalledWith(expected);
			});
			it("should emit deviceFound event when cache-control timeout expires and pinging device is successful", function () {
				//arrange
				_mockTimer.clearTimeout = jasmine.createSpy("clearTimeout");
				_mockTimer.setTimeout = jasmine.createSpy("setTimeout");

				var thenableResult = jasmine.createSpy("thenableResult");

				spyOn(_sut,"_checkForLostDevice");
				_sut._checkForLostDevice.and.returnValue({ then: thenableResult });
				
				var lostFunction = jasmine.createSpy("onDeviceLost");
				var location = "the location";
				var deviceId = "avaliduuid";
				var headers = { usn: "uuid:" + deviceId + ":", location: location };
				var timeout = 13;
				headers["cache-control"] = "something=" + timeout;

				_sut.on("deviceLost", lostFunction);
				_sut.search([]);

				var foundDeviceArgs = _mockPassiveSearcher.on.calls.argsFor(0);

				//act
				foundDeviceArgs[1](headers, false);

				//assert
				expect(_mockTimer.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), timeout * 1000);

				var callback = _mockTimer.setTimeout.calls.mostRecent().args[0];
				expect(typeof callback).toBe("function");

				callback();
				
				expect(_sut._checkForLostDevice).toHaveBeenCalledWith(location, deviceId);
				expect(thenableResult).toHaveBeenCalledWith(jasmine.any(Function));
				thenableResult.calls.argsFor(0)[0](true);

				expect(lostFunction).not.toHaveBeenCalled();
			});
			it("should emit deviceLost event when cache-control timeout expires and pinging device is not successful", function () {
				//arrange
				_mockTimer.clearTimeout = jasmine.createSpy("clearTimeout");
				_mockTimer.setTimeout = jasmine.createSpy("setTimeout");

				var thenableResult = jasmine.createSpy("thenableResult");

				spyOn(_sut,"_checkForLostDevice");
				_sut._checkForLostDevice.and.returnValue({ then: thenableResult });
				
				var lostFunction = jasmine.createSpy("onDeviceLost");
				var location = "the location";
				var deviceId = "avaliduuid";
				var headers = { usn: "uuid:" + deviceId + ":", location: location };
				var timeout = 13;
				headers["cache-control"] = "something=" + timeout;

				_sut.on("deviceLost", lostFunction);
				_sut.search([]);

				var foundDeviceArgs = _mockPassiveSearcher.on.calls.argsFor(0);

				//act
				foundDeviceArgs[1](headers, false);

				//assert
				expect(_mockTimer.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), timeout * 1000);

				var callback = _mockTimer.setTimeout.calls.mostRecent().args[0];
				expect(typeof callback).toBe("function");

				callback();
				
				expect(_sut._checkForLostDevice).toHaveBeenCalledWith(location, deviceId);
				expect(thenableResult).toHaveBeenCalledWith(jasmine.any(Function));
				thenableResult.calls.argsFor(0)[0](false);

				expect(lostFunction).toHaveBeenCalledWith(deviceId);
			});
			it("should not update debounce wait time when timeout has not expired", function () {
				//todo: write this test

			});
		});

	});
});


/*
	
*/