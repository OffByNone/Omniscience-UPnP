/* global Promise */
const Constants = require('../Constants');

class SubscriptionService {
	constructor(fetch) {
		this._fetch = fetch;
	}
	subscribe(directResponsesTo, subscriptionUrl, subscriptionId, timeout) {
		if (!directResponsesTo) return Promise.reject("Argument 'directResponsesTo' cannot be null.");
		if (!subscriptionUrl) return Promise.reject("Argument 'subscriptionUrl' cannot be null.");
		if (!timeout) return Promise.reject("Argument 'timeout' cannot be null.");
		
		let headers;
		if (subscriptionId) {
			headers = {
				TIMEOUT: `Second-${timeout}`,
				SID: subscriptionId
			};
		}
		else {
			headers = {
				CALLBACK: `<${directResponsesTo}>`,
				TIMEOUT: `Second-${timeout}`,
				NT: "upnp:event"
			};
		}

		return this._fetch(subscriptionUrl, {
			method: 'SUBSCRIBE',
			headers: headers
		}).then(response => {
			subscriptionId = response.headers.get('sid');
			if (!response.ok) {
				if (response.status == Constants.PreconditionFailed) {
					//we didn't respond within the timeout so we need to send again
					//todo: add a max number of retries
					subscriptionId = null;
					console.log("subscription timed out, trying again.");
					return this.subscribe(directResponsesTo, subscriptionUrl, subscriptionId, timeout);
				}
				else
					return Promise.reject("Subscription at address: " + subscriptionUrl + " failed. Status code " + response.status);
			}
			return subscriptionId;
		});
    }
	unsubscribe(subscriptionUrl, subscriptionId) {
		if (!subscriptionUrl) return Promise.reject("Argument 'subscriptionUrl' cannot be null.");
		if (!subscriptionId) return Promise.reject("Argument 'subscriptionId' cannot be null.");
		
		return this._fetch(subscriptionUrl, { method: 'UNSUBSCRIBE', headers: { SID: subscriptionId } });
    }
}

module.exports = SubscriptionService;