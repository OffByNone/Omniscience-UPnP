"use strict";
/* global Promise */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Constants = require('../Constants');

var SubscriptionService = (function () {
	function SubscriptionService(fetch) {
		_classCallCheck(this, SubscriptionService);

		this._fetch = fetch;
	}

	_createClass(SubscriptionService, [{
		key: "subscribe",
		value: function subscribe(directResponsesTo, subscriptionUrl, timeoutInSeconds, subscriptionId) {
			var _this = this;

			if (!directResponsesTo) return Promise.reject("Argument 'directResponsesTo' cannot be null.");
			if (!subscriptionUrl) return Promise.reject("Argument 'subscriptionUrl' cannot be null.");
			if (!timeoutInSeconds) return Promise.reject("Argument 'timeoutInSeconds' cannot be null.");

			var headers = undefined;
			if (subscriptionId) {
				headers = {
					TIMEOUT: "Second-" + timeoutInSeconds,
					SID: subscriptionId
				};
			} else {
				headers = {
					CALLBACK: "<" + directResponsesTo + ">",
					TIMEOUT: "Second-" + timeoutInSeconds,
					NT: "upnp:event"
				};
			}
			return this._fetch(subscriptionUrl, {
				method: 'SUBSCRIBE',
				headers: headers
			}).then(function (response) {
				subscriptionId = (response.headers.get('sid') || "").replace("uuid:", "");
				if (!response.ok) {
					//handle 405 method not allowed
					if (response.status == Constants.PreconditionFailed) {
						//we didn't respond within the timeout so we need to send again
						//todo: add a max number of retries
						subscriptionId = null;
						console.log("subscription timed out, trying again.");
						return _this.subscribe(directResponsesTo, subscriptionUrl, timeoutInSeconds, subscriptionId);
					} else return Promise.reject("Subscription at address: " + subscriptionUrl + " failed. Status code " + response.status);
				}
				return subscriptionId;
			}, function (err) {
				console.log("error the output was not parsable");
				console.log(err);
			});
		}
	}, {
		key: "unsubscribe",
		value: function unsubscribe(subscriptionUrl, subscriptionId) {
			if (!subscriptionUrl) return Promise.reject("Argument 'subscriptionUrl' cannot be null.");
			if (!subscriptionId) return Promise.reject("Argument 'subscriptionId' cannot be null.");

			return this._fetch(subscriptionUrl, { method: 'UNSUBSCRIBE', headers: { SID: subscriptionId } });
		}
	}]);

	return SubscriptionService;
})();

module.exports = SubscriptionService;