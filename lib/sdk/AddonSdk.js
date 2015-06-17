const { Cc, Ci } = require('chrome'); // https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/tutorials/chrome.html

module.exports.createDOMParser = function createDOMParser() {
	// https://developer.mozilla.org/en-US/docs/nsIDOMParser
	// https://dxr.mozilla.org/mozilla-central/source/dom/base/nsIDOMParser.idl
    return Cc['@mozilla.org/xmlextras/domparser;1'].createInstance(Ci.nsIDOMParser);
};