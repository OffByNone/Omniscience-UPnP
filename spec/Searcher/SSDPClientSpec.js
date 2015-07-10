require("babel/register");
const SSDPClient = require('../../lib/Searcher/SSDPClient');
const Constants = require('../../lib/Constants');

describe("SSDPClient", function () {
	var _sut;
	var _mockUdpSocket;
	var _mockStringUtils;
	beforeEach(function () {
		_mockUdpSocket = {};
		_mockStringUtils = {};
		_sut = new SSDPClient(_mockStringUtils, _mockUdpSocket);
	});

	describe("startListening", function () {
		it("should start listening on the socket", function () {
			//arrange
			_mockUdpSocket.asyncListen = jasmine.createSpy("asyncListen");

			//act
			_sut.startListening();

			//assert
			expect(_mockUdpSocket.asyncListen).toHaveBeenCalledWith(_sut);
		});
	});
	describe("search", function () {

	});
	describe("stop", function () {
		it("should close the socket", function () {
			//arrange
			_mockUdpSocket.close = jasmine.createSpy("close");

			//act
			_sut.stop();

			//assert
			expect(_mockUdpSocket.close).toHaveBeenCalledWith();
		});
	});
	describe("setMulticastInterface", function () {
		it("should set socket multicast interface to the ip passed in", function () {
			//arrange
			var ipAddress = "my ip address";

			//act
			_sut.setMulticastInterface(ipAddress);

			//assert
			expect(_mockUdpSocket.multicastInterface).toBe(ipAddress);
		});
	});
	describe("joinMulticast", function () {
		it("should join multicast", function () {
			//arrange
			_mockUdpSocket.joinMulticast = jasmine.createSpy();

			var ipAddress = "my ip address";
			_sut.setMulticastInterface(ipAddress);

			//act
			_sut.joinMulticast();

			//assert
			expect(_mockUdpSocket.joinMulticast).toHaveBeenCalledWith(Constants.MulticastIP, ipAddress);
		});
	});
	describe("leaveMulticast", function () {
		it("should leave multicast", function () {
			//arrange
			_mockUdpSocket.leaveMulticast = jasmine.createSpy();

			var ipAddress = "my ip address";
			_sut.setMulticastInterface(ipAddress);

			//act
			_sut.leaveMulticast();

			//assert
			expect(_mockUdpSocket.leaveMulticast).toHaveBeenCalledWith(Constants.MulticastIP, ipAddress);
		});
	});
	describe("onStopListening", function () {
		it("should emit a close event", function () {
			//arrange
			var status = "closed";
			var closeFunc = jasmine.createSpy("closeFunc");
			_sut.on("close", closeFunc);

			//act
			_sut.onStopListening(null, status);

			//assert
			expect(closeFunc).toHaveBeenCalledWith(status);
		});
	});
	describe("onPacketReceived", function () {

	});
});