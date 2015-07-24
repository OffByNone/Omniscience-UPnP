module.exports.main = function main() {
	//extension startup
	
	const CompositionRoot = require("./bin/index");
	let compositionRoot = new CompositionRoot();

	compositionRoot.createDeviceService().then((deviceService) => {

		let button = require('sdk/ui/button/action').ActionButton({
			id: 'omniscience',
			label: 'Omniscience',
			icon: "./logo_64.png"
		});
		button.on('click', () => deviceService.search());
	});
};

require("sdk/system/unload").when(function (reason) {
	//extension shutdown
});