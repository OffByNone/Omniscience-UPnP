module.exports.main = function main() {
	//extension startup
	
	const CompositionRoot = require("./bin/index");
	let compositionRoot = new CompositionRoot();
};

require("sdk/system/unload").when(function (reason) {
	//extension shutdown
});