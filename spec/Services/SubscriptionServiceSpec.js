///<reference path="../support/jasmine.d.ts" />
require("babel/register");
const SubscriptionService = require('../../lib/Services/SubscriptionService');
const Constants = require('../../lib/Constants');

describe("SubscriptionService", function () {
	var _sut;
	var _mockFetch;
	beforeEach(function () {
		_mockFetch = jasmine.createSpy("_mockFetch");
		_sut = new SubscriptionService(_mockFetch);
	});

	describe("subscribe", function () {
		it("should return a promise rejected with the specified message when directResponsesTo is null", function () { 
			//act/assert
			_sut.subscribe().then((message) => expect(message).toBe("Argument 'directResponsesTo' cannot be null."));			
		});
		it("should return a promise rejected with the specified message when subscriptionUrl is null", function () { 
			//arrange
			var directResponsesTo = "send them here.";
			
			//act/assert
			_sut.subscribe(directResponsesTo).then((message) => expect(message).toBe("Argument 'subscriptionUrl' cannot be null."));
			
		});
		it("should return a promise rejected with the specified message when timeoutInSeconds is null", function () { 
			//arrange
			var directResponsesTo = "send them here.";
			var subscriptionUrl = "subscribe here.";
			
			//act/assert
			_sut.subscribe(directResponsesTo, subscriptionUrl).then((message) => expect(message).toBe("Argument 'timeoutInSeconds' cannot be null."));
		});
		it("should return a promise which resolves with the subscription id, when the service is currently not subscribed to and everything worked.", function () { 
			//arrange
			var directResponsesTo = "send them here.";
			var subscriptionUrl = "subscribe here.";
			var timeoutInSeconds = 15;

			var fetchResponse = { ok: true, headers: {} };
			var newSubscriptionId = "a uuid here";
			fetchResponse.headers.get = jasmine.createSpy("fetchResponse.headers.get").and.returnValue(newSubscriptionId);
			var fetchResult = jasmine.createSpyObj("fetchResult",["then"]);
			_mockFetch.and.returnValue(fetchResult);			
			
			//act
			_sut.subscribe(directResponsesTo, subscriptionUrl, timeoutInSeconds);
			
			//assert
			expect(_mockFetch).toHaveBeenCalledWith(subscriptionUrl, jasmine.any(Object));
			var fetchConfig = _mockFetch.calls.argsFor(0)[1];
			expect(fetchConfig.method).toBe("SUBSCRIBE");
			var actualheaders = fetchConfig.headers;
			expect(actualheaders.CALLBACK).toBe(`<${directResponsesTo}>`);
			expect(actualheaders.TIMEOUT).toBe(`Second-${timeoutInSeconds}`);
			expect(actualheaders.NT).toBe("upnp:event");
			expect(fetchResult.then).toHaveBeenCalledWith(jasmine.any(Function));
			var actual = fetchResult.then.calls.argsFor(0)[0](fetchResponse);
			expect(fetchResponse.headers.get).toHaveBeenCalledWith("sid");
			expect(actual).toBe(newSubscriptionId);
		});
		it("should attempt to renew subscription when subscriptionId is not null.", function () { 
			//arrange
			var directResponsesTo = "send them here.";
			var subscriptionUrl = "subscribe here.";
			var timeoutInSeconds = 15;
			var subscriptionId = "a uuid here";

			var fetchResult = jasmine.createSpyObj("fetchResult", ["then"]);
			_mockFetch.and.returnValue(fetchResult);			

			//act
			_sut.subscribe(directResponsesTo, subscriptionUrl, timeoutInSeconds, subscriptionId);
			
			//assert
			expect(_mockFetch).toHaveBeenCalledWith(subscriptionUrl, jasmine.any(Object));
			var fetchConfig = _mockFetch.calls.argsFor(0)[1];
			expect(fetchConfig.method).toBe("SUBSCRIBE");
			var actualheaders = fetchConfig.headers;
			expect(actualheaders.SID).toBe(subscriptionId);
			expect(actualheaders.TIMEOUT).toBe(`Second-${timeoutInSeconds}`);
		});		
		it("should return a promise rejected with a message containing the subscription url and the response status when subscribing fails and the status is not preconditionfailed", function () { 
			//arrange
			var directResponsesTo = "send them here.";
			var subscriptionUrl = "subscribe here.";
			var timeoutInSeconds = 15;

			var fetchResponse = { ok: false, headers: { get: () => { }} };
			var fetchResult = jasmine.createSpyObj("fetchResult",["then"]);
			_mockFetch.and.returnValue(fetchResult);			
			
			//act
			_sut.subscribe(directResponsesTo, subscriptionUrl, timeoutInSeconds);
			
			//assert
			expect(fetchResult.then).toHaveBeenCalledWith(jasmine.any(Function));
			fetchResult.then.calls.argsFor(0)[0](fetchResponse)
				.then((message) => expect(message).toBe("Subscription at address: " + subscriptionUrl + " failed. Status code " + fetchResponse.status));
		});
		it("should attempt to subscribe again when precondition fails.", function () { 
			//arrange
			var directResponsesTo = "send them here.";
			var subscriptionUrl = "subscribe here.";
			var timeoutInSeconds = 15;

			var fetchResponse = { ok: false, headers: { get: () => { }}, status: Constants.PreconditionFailed };
			var fetchResult = jasmine.createSpyObj("fetchResult",["then"]);
			_mockFetch.and.returnValue(fetchResult);			
			
			//act
			_sut.subscribe(directResponsesTo, subscriptionUrl, timeoutInSeconds);
			
			//assert
			expect(fetchResult.then).toHaveBeenCalledWith(jasmine.any(Function));
			fetchResult.then.calls.argsFor(0)[0](fetchResponse);
			expect(_mockFetch.calls.count()).toBe(2);
		});
	});	
	describe("unsubscribe", function () {
		it("should return a promise rejected with the specified message when subscriptionUrl is null", function () { 
			//arrange/act/assert
			_sut.unsubscribe().then((message) => expect(message).toBe("Argument 'subscriptionUrl' cannot be null."));			
		});
		it("should return a promise rejected with the specified message when subscriptionId is null", function () { 
			//assert
			var subscriptionUrl = "a valid url";
			
			//act/assert
			_sut.unsubscribe(subscriptionUrl).then((message) => expect(message).toBe("Argument 'subscriptionId' cannot be null."));			
		});
		it("should call the specified url with the subscription id and return the result", function () { 
			//assert
			var subscriptionUrl = "a valid url";
			var subscriptionId = "a uuid here";
			
			var fetchResult = "the result";
			_mockFetch.and.returnValue(fetchResult);
			
			//act
			var actual = _sut.unsubscribe(subscriptionUrl, subscriptionId);			

			//assert
			expect(_mockFetch).toHaveBeenCalledWith(subscriptionUrl, jasmine.any(Object));
			var fetchConfig = _mockFetch.calls.argsFor(0)[1];
			expect(fetchConfig.method).toBe('UNSUBSCRIBE');
			expect(typeof fetchConfig.headers).toBe("object");
			expect(fetchConfig.headers.SID).toBe(subscriptionId);
			expect(actual).toBe(fetchResult);
		});		
	});
	
/**
 * 	unsubscribe(subscriptionUrl, subscriptionId) {
		
		return this._fetch(subscriptionUrl, { method: 'UNSUBSCRIBE', headers: { SID: subscriptionId } });
    }
 */	
});