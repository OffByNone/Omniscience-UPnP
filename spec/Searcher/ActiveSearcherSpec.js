require("babel/register");
const ActiveSearcher = require('../../lib/Searcher/ActiveSearcher');
const Constants = require('../../lib/Constants');

describe("ActiveSearcher", function () {
	var _sut;
	var _mockSSDPClients;
	beforeEach(function () {
		_mockSSDPClients = [];
		_sut = new ActiveSearcher(_mockSSDPClients);
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
	describe("search", function () { });
});