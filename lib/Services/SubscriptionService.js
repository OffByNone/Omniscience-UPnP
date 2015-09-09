"use strict";
/* global Promise */
const Constants = require('../Constants');

class SubscriptionService {
	constructor(fetch) {
		this._fetch = fetch;
	}
	subscribe(directResponsesTo, subscriptionUrl, timeoutInSeconds, subscriptionId, retry) {
		if (!directResponsesTo) return Promise.reject("Argument 'directResponsesTo' cannot be null.");
		if (!subscriptionUrl) return Promise.reject("Argument 'subscriptionUrl' cannot be null.");
		if (!timeoutInSeconds) return Promise.reject("Argument 'timeoutInSeconds' cannot be null.");

		retry = retry || 0;

		let headers;
		if (subscriptionId) {
			headers = {
				TIMEOUT: `Second-${timeoutInSeconds}`,
				SID: subscriptionId
			};
		}
		else {
			headers = {
				CALLBACK: `<${directResponsesTo}>`,
				TIMEOUT: `Second-${timeoutInSeconds}`,
				NT: "upnp:event"
			};
		}
		return this._fetch(subscriptionUrl, {
			method: 'SUBSCRIBE',
			headers: headers
		}).then(response => {
			subscriptionId = response.headers.get('sid');
			if (!response.ok) {
				if (response.status == Constants.PreconditionFailed && retry < 4) {
					//we didn't respond within the timeout so we need to send again
					console.log("subscription timed out, trying again.");
					return this.subscribe(directResponsesTo, subscriptionUrl, timeoutInSeconds, subscriptionId, retry++);
				}
				else if (retry > Constants.retryLimit)
					return Promise.reject(`Subscription for service at address: ${subscriptionUrl} failed. Retry limit (${Constants.retryLimit}) exceeded.`);
				else
					return Promise.reject(`Subscription for service at address: ${subscriptionUrl} failed. Received a ${response.status}, ${response.statusText}`);
			}
			return subscriptionId;
		}, (err) => {
			console.log("error the output was not parsable");
			console.log(err);
		});
    }
	unsubscribe(subscriptionUrl, subscriptionId) {
		if (!subscriptionUrl) return Promise.reject("Argument 'subscriptionUrl' cannot be null.");
		if (!subscriptionId) return Promise.reject("Argument 'subscriptionId' cannot be null.");

		return this._fetch(subscriptionUrl, { method: 'UNSUBSCRIBE', headers: { SID: subscriptionId } });
    }
}

module.exports = SubscriptionService;