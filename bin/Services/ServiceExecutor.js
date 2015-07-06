"use strict";

var ServiceExecutor = {
        executableServices: {},
        callService: function callService(serviceControlUrl, serviceUUID, serviceMethod, data) {
                if (!serviceControlUrl) throw new Error("Argument 'serviceControlUrl' cannot be null.");
                if (!serviceUUID) throw new Error("Argument 'serviceUUID' cannot be null.");
                if (!serviceMethod) throw new Error("Argument 'serviceMethod' cannot be null.");

                var serviceClass = ServiceExecutor.executableServices[serviceUUID];
                if (!serviceClass) throw new Error("Executable Service has not yet been created.");

                var serviceFunc = serviceClass[serviceMethod];
                if (typeof serviceFunc !== "function") throw new Error("Executable Service has been created, but method has not.");

                return serviceFunc(serviceControlUrl, data);
        }
};

module.exports = ServiceExecutor;