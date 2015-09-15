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
});