/* global Promise */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Constants = require('./Constants');

var SubscriptionService = (function () {
	function SubscriptionService(fetch) {
		_classCallCheck(this, SubscriptionService);

		this._fetch = fetch;
	}

	_createClass(SubscriptionService, [{
		key: 'subscribe',
		value: function subscribe(subscriptionUrl, directResponsesTo, eventSubscriptionId, timeout) {
			var _this = this;

			var headers;
			if (eventSubscriptionId) {
				headers = {
					TIMEOUT: 'Second-' + timeout,
					SID: eventSubscriptionId
				};
			} else {
				headers = {
					CALLBACK: '<' + directResponsesTo + '>',
					TIMEOUT: 'Second-' + timeout,
					NT: 'upnp:event'
				};
			}

			return this._fetch(subscriptionUrl, {
				method: 'SUBSCRIBE',
				headers: headers
			}).then(function (response) {
				//todo: this function probably doesn't belong in here
				eventSubscriptionId = response.headers.get('sid');
				if (!response.ok) {
					if (response.status == Constants.PreconditionFailed) {
						//we didn't respond within the timeout so we need to send again
						//todo: add a max number of retries
						eventSubscriptionId = null;
						console.log('subscription timed out, trying again.');
						return _this.subscribe(subscriptionUrl, eventSubscriptionId, timeout);
					} else throw new Error('Subscription at address: ' + subscriptionUrl + ' failed. Status code ' + response.status);
				}
				return eventSubscriptionId;
			});
		}
	}, {
		key: 'unsubscribe',
		value: function unsubscribe(subscriptionUrl, eventSubscriptionId) {
			if (!subscriptionUrl || !eventSubscriptionId) return Promise.reject('Either the subscriptionURL was null or the subscription id was, either way nothing to unsubscribe.'); //todo: better validation, also validate some fields on subscribe too.
			return this._fetch(subscriptionUrl, { method: 'UNSUBSCRIBE', headers: { SID: eventSubscriptionId } });
		}
	}]);

	return SubscriptionService;
})();

module.exports = SubscriptionService;