"use strict";
const ServiceExecutor = {
	executableServices: {},
	callService: (serviceControlUrl, serviceHash, serviceMethod, data) => {
        if (!serviceControlUrl) throw new Error("Argument 'serviceControlUrl' cannot be null.");
		if (!serviceHash) throw new Error("Argument 'serviceHash' cannot be null.");
		if (!serviceMethod) throw new Error("Argument 'serviceMethod' cannot be null.");

        let serviceClass = ServiceExecutor.executableServices[serviceHash];
        if (!serviceClass) throw new Error("Executable Service has not yet been created.");

        let serviceFunc = serviceClass[serviceMethod];
        if (typeof serviceFunc !== "function") throw new Error("Executable Service has been created, but method has not.");

        return serviceFunc(serviceControlUrl, data);
    }
};


module.exports = ServiceExecutor;