require("babel/register");
const PassiveSearcher = require('../../lib/Searcher/PassiveSearcher');
const Constants = require('../../lib/Constants');

describe("PassiveSearcher", function () {
	var _sut;
	var _mockSSDPClients;
	beforeEach(function () {
		_mockSSDPClients = [];
		_sut = new PassiveSearcher(_mockSSDPClients);
	});
	describe("stop", function () {
		it("should stop ssdpClients", function () {
			//arrange
			var mockSSDPClient1 = jasmine.createSpyObj("mockSSDPClient1", ["stop"]);
			var mockSSDPClient2 = jasmine.createSpyObj("mockSSDPClient2", ["stop"]);

			_mockSSDPClients.push(mockSSDPClient1);
			_mockSSDPClients.push(mockSSDPClient2);

			//act
			_sut.stop();

			//assert
			expect(mockSSDPClient1.stop).toHaveBeenCalledWith();
			expect(mockSSDPClient2.stop).toHaveBeenCalledWith();
		});
	});
	describe("search", function () {
		it("should initialize each ssdpClient when they are not initialized", function () {
			//arrange
			var mockSSDPClient1 = jasmine.createSpyObj("mockSSDPClient1", ["joinMulticast", "startListening", "on"]);
			var mockSSDPClient2 = jasmine.createSpyObj("mockSSDPClient2", ["joinMulticast", "startListening", "on"]);

			_mockSSDPClients.push(mockSSDPClient1);
			_mockSSDPClients.push(mockSSDPClient2);

			//act
			_sut.listen();

			//assert
			expect(mockSSDPClient1.joinMulticast).toHaveBeenCalledWith();
			expect(mockSSDPClient1.startListening).toHaveBeenCalledWith();
			expect(mockSSDPClient1.on).toHaveBeenCalledWith("error", jasmine.any(Function));
			expect(mockSSDPClient1.on).toHaveBeenCalledWith("messageReceived", jasmine.any(Function));

			expect(mockSSDPClient2.joinMulticast).toHaveBeenCalledWith();
			expect(mockSSDPClient2.startListening).toHaveBeenCalledWith();
			expect(mockSSDPClient2.on).toHaveBeenCalledWith("error", jasmine.any(Function));
			expect(mockSSDPClient2.on).toHaveBeenCalledWith("messageReceived", jasmine.any(Function));

		});
		it("should not initialize ssdpClients when they are already initialized.", function () {
			//arange
			var mockSSDPClient1 = jasmine.createSpyObj("mockSSDPClient1", ["joinMulticast", "startListening", "on"]);

			_mockSSDPClients.push(mockSSDPClient1);

			//act
			_sut.listen();

			//reset call counts
			mockSSDPClient1.joinMulticast.calls.reset();
			mockSSDPClient1.startListening.calls.reset();
			mockSSDPClient1.on.calls.reset();

			_sut.listen();

			//assert
			expect(mockSSDPClient1.joinMulticast).not.toHaveBeenCalled();
			expect(mockSSDPClient1.startListening).not.toHaveBeenCalled();
			expect(mockSSDPClient1.on).not.toHaveBeenCalled();
		});
		describe("messageReceived", function () {
			it("should emit found event with headers and ignoreDebounce set to true when service type is not PeerNameResolutionProtocolST and message type is update", function () {
				//arrange
				var mockSSDPClient1 = jasmine.createSpyObj("mockSSDPClient1", ["joinMulticast", "startListening", "on"]);
				var foundFunction = jasmine.createSpy("found function");
				var headers = { st: "valid", nts: Constants.ssdp.update };

				_mockSSDPClients.push(mockSSDPClient1);
				_sut.on("found", foundFunction);
				_sut.listen();

				var messageReceivedArgs = mockSSDPClient1.on.calls.allArgs().filter(function (args) { return args[0] === "messageReceived"; })[0];

				//act
				messageReceivedArgs[1](headers);
				//assert
				expect(foundFunction).toHaveBeenCalledWith(headers, true);
			});
			it("should emit found event with headers and ignoreDebounce set to false when service type is not PeerNameResolutionProtocolST and message type is new", function () {
				//arrange
				var mockSSDPClient1 = jasmine.createSpyObj("mockSSDPClient1", ["joinMulticast", "startListening", "on"]);
				var foundFunction = jasmine.createSpy("found function");
				var headers = { st: "valid", nts: Constants.ssdp.new };

				_mockSSDPClients.push(mockSSDPClient1);
				_sut.on("found", foundFunction);
				_sut.listen();

				var messageReceivedArgs = mockSSDPClient1.on.calls.allArgs().filter(function (args) { return args[0] === "messageReceived"; })[0];

				//act
				messageReceivedArgs[1](headers);
				//assert
				expect(foundFunction).toHaveBeenCalledWith(headers, false);
			});
			it("should emit lost event with headers when service type is not PeerNameResolutionProtocolST and message type is gone", function () {
				//arrange
				var mockSSDPClient1 = jasmine.createSpyObj("mockSSDPClient1", ["joinMulticast", "startListening", "on"]);
				var foundFunction = jasmine.createSpy("found function");
				var headers = { st: "valid", nts: Constants.ssdp.gone };

				_mockSSDPClients.push(mockSSDPClient1);
				_sut.on("lost", foundFunction);
				_sut.listen();

				var messageReceivedArgs = mockSSDPClient1.on.calls.allArgs().filter(function (args) { return args[0] === "messageReceived"; })[0];

				//act
				messageReceivedArgs[1](headers);
				//assert
				expect(foundFunction).toHaveBeenCalledWith(headers);
			});
			it("should not emit found event when service type is PeerNameResolutionProtocolST", function () {
				//arrange
				var mockSSDPClient1 = jasmine.createSpyObj("mockSSDPClient1", ["joinMulticast", "startListening", "on"]);
				var foundFunction = jasmine.createSpy("found function");
				var headers = { st: Constants.PeerNameResolutionProtocolST };

				_mockSSDPClients.push(mockSSDPClient1);
				_sut.on("found", foundFunction);
				_sut.listen();

				var messageReceivedArgs = mockSSDPClient1.on.calls.allArgs().filter(function (args) { return args[0] === "messageReceived"; })[0];

				//act
				messageReceivedArgs[1](headers);
				//assert
				expect(foundFunction).not.toHaveBeenCalled();

			});
		});

	});
});