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
		describe("when device lost", function () { });
		describe("when device found", function () {
			it("should set active and passive searcher found events to the same function", function () {
				//act/arrange
				_sut.search([]);

				//assert
				var activeSearcherFoundArgs = _mockActiveSearcher.on.calls.argsFor(0);
				var passiveSearcherFoundArgs = _mockPassiveSearcher.on.calls.argsFor(0);

				expect(activeSearcherFoundArgs[1].toString()).toBe(passiveSearcherFoundArgs[1].toString());
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
		});
	});
});