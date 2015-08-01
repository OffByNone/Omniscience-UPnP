	var CompositionRoot = require("./bin/index");
	var compositionRoot = new CompositionRoot();

	compositionRoot.createDeviceService().then((deviceService) => {
		console.log("deviceService created");
		deviceService.on("deviceFound", function (device) { console.log(device); });
		deviceService.search();
		window.setTimeout(function () {deviceService.search() }, 1000);
	});