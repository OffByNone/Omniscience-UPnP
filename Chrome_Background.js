/* global chrome */

chrome.app.runtime.onLaunched.addListener(function () {
	chrome.app.window.create('Chrome_Main.html', {
		'outerBounds': {
			'width': 400,
			'height': 500
		}
	}, function (myWindow) {
		myWindow.contentWindow.addEventListener('load', function (e) {

		});
	});
});


window.setTimeout(function () {
	var CompositionRoot = require("./bin/index");
	var compositionRoot = new CompositionRoot();

	compositionRoot.createDeviceService().then(function (deviceService) {
		deviceService.on("deviceFound", function (device) {
			chrome.runtime.sendMessage({ device: device }, function () { });
		});
		deviceService.search();
	});

}, 5000);