///<reference path="../support/jasmine.d.ts" />
require("babel/register");
const SubscriptionService = require('../../lib/Services/SubscriptionService');
const Constants = require('../../lib/Constants');

describe("SubscriptionService", function () {
	var _sut;
	var _mockFetch;
	beforeEach(function () {
		_mockFetch = {};
		_sut = new SubscriptionService(_mockFetch);
	});

	describe("subscribe", function () {
		
	});
	describe("unsubscribe", function () {
		
	});
});