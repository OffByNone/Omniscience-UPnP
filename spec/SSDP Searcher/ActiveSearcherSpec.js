///<reference path="./support/jasmine.d.ts" />
require("babel/register");
const ActiveSearcher = require("../lib/ActiveSearcher");
const Constants = require('../lib/Constants');

describe("ActiveSearcher", function () {
	var _sut;
	var _mockSSDPClients;
	beforeEach(function () {
		_mockSSDPClients = [];
		_sut = new ActiveSearcher(_mockSSDPClients);
	});

	describe("search", function () {
		it("should initialize each ssdpClient, then trigger a search when they are not initialized", function () {
			//arrange
			var mockSSDPClient1 = jasmine.createSpyObj("mockSSDPClient1", ["joinMulticast", "startListening", "on", "search"]);
			var mockSSDPClient2 = jasmine.createSpyObj("mockSSDPClient2", ["joinMulticast", "startListening", "on", "search"]);

			_mockSSDPClients.push(mockSSDPClient1);
			_mockSSDPClients.push(mockSSDPClient2);
			
			//act
			_sut.search();
			
			//assert
			expect(mockSSDPClient1.joinMulticast).toHaveBeenCalledWith();
			expect(mockSSDPClient1.startListening).toHaveBeenCalledWith();
			expect(mockSSDPClient1.on).toHaveBeenCalledWith("error", jasmine.any(Function));
			expect(mockSSDPClient1.on).toHaveBeenCalledWith("messageReceived", jasmine.any(Function));
			expect(mockSSDPClient1.search).toHaveBeenCalledWith(Constants.SSDPServiceType);

			expect(mockSSDPClient2.joinMulticast).toHaveBeenCalledWith();
			expect(mockSSDPClient2.startListening).toHaveBeenCalledWith();
			expect(mockSSDPClient2.on).toHaveBeenCalledWith("error", jasmine.any(Function));
			expect(mockSSDPClient2.on).toHaveBeenCalledWith("messageReceived", jasmine.any(Function));
			expect(mockSSDPClient2.search).toHaveBeenCalledWith(Constants.SSDPServiceType);

		});
		it("should not initialize ssdpClients when they are already initialized.", function () {
			//arange
			var mockSSDPClient1 = jasmine.createSpyObj("mockSSDPClient1", ["joinMulticast", "startListening", "on", "search"]);

			_mockSSDPClients.push(mockSSDPClient1);
			
			//act
			_sut.search();
			
			//reset call counts
			mockSSDPClient1.joinMulticast.calls.reset();
			mockSSDPClient1.startListening.calls.reset();
			mockSSDPClient1.on.calls.reset();

			_sut.search();
			
			//assert
			expect(mockSSDPClient1.joinMulticast).not.toHaveBeenCalled();
			expect(mockSSDPClient1.startListening).not.toHaveBeenCalled();
			expect(mockSSDPClient1.on).not.toHaveBeenCalled();
			expect(mockSSDPClient1.search.calls.count()).toBe(2);
		});
		describe("messageReceived", function () {
			it("should emit found event when service type is not PeerNameResolutionProtocolST", function () {
				//arrange
				var mockSSDPClient1 = jasmine.createSpyObj("mockSSDPClient1", ["joinMulticast", "startListening", "on", "search"]);
				var foundFunction = jasmine.createSpy("found function");
				var headers = { st: "valid" };

				_mockSSDPClients.push(mockSSDPClient1);
				_sut.on("found", foundFunction);
				_sut.search();

				var messageReceivedArgs = mockSSDPClient1.on.calls.allArgs().filter(function (args) { return args[0] === "messageReceived"; })[0];
				
				//act
				messageReceivedArgs[1](headers);
				//assert
				expect(foundFunction).toHaveBeenCalledWith(headers);	

			});
			it("should not emit found event when service type is PeerNameResolutionProtocolST", function () {
				//arrange
				var mockSSDPClient1 = jasmine.createSpyObj("mockSSDPClient1", ["joinMulticast", "startListening", "on", "search"]);
				var foundFunction = jasmine.createSpy("found function");
				var headers = { st: Constants.PeerNameResolutionProtocolST };

				_mockSSDPClients.push(mockSSDPClient1);
				_sut.on("found", foundFunction);
				_sut.search();

				var messageReceivedArgs = mockSSDPClient1.on.calls.allArgs().filter(function (args) { return args[0] === "messageReceived"; })[0];
				
				//act
				messageReceivedArgs[1](headers);
				//assert
				expect(foundFunction).not.toHaveBeenCalled();	

			});
		});

	});
});