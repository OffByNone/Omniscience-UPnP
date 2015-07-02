class ServiceExecutor {
    constructor(executableServiceFactory) {
        this._executableServiceFactory = executableServiceFactory;
        this._executableServices = {};
    }
    callService(serviceControlUrl, serviceUUID, serviceMethod, data) {
        if (!serviceControlUrl || !serviceMethod)
            throw new Error("Either there was no control url passed in or no method.");

        var serviceClass = this._executableServices[serviceUUID];
        if (!serviceClass) throw new Error("Executable Service has not yet been created.");

        var serviceFunc = serviceClass[serviceMethod];
        if (typeof serviceFunc !== "function") throw new Error("Executable Service has been created, but, service function has not.");

        return serviceFunc(serviceControlUrl, data);
    }
    addExecutableService(serviceInfo) {
		var executableService = this._executableServiceFactory.create(serviceInfo);
		if (!executableService) return;
		if (!this._executableServices.hasOwnProperty(serviceInfo.uuid))
			this._executableServices[serviceInfo.uuid] = executableService;
		else
			for (var methodName in executableService)
				this._executableServices[serviceInfo.uuid][methodName] = executableService[methodName];
    }
}

module.exports = ServiceExecutor;