/* global Promise */
class ServiceExecutor {
    constructor (serviceInfoFactory, executableServiceFactory){
        this._executableServiceFactory = executableServiceFactory;
        this._serviceInfoFactory = serviceInfoFactory;
        this._executableServices = {};
    }
    callService(serviceControlUrl, serviceHash, serviceMethod, data){
        if(!serviceControlUrl || !serviceMethod)
            return Promise.reject("Either there was no control url passed in or no method.");

        var serviceClass = this._executableServices[serviceHash];
        if(!serviceClass) return Promise.reject("Executable Service has not yet been created.");

        var serviceFunc = serviceClass[serviceMethod];
        if(typeof serviceFunc !== "function") return Promise.reject("Executable Service has been created, but, service function has not.");

        return serviceFunc(serviceControlUrl, data);
    }
    addExecutableServices(services){
        if(!Array.isArray(services)) return;
        services.forEach((basicServiceInfo) => {
            this._serviceInfoFactory.getDetailedServiceInformation(basicServiceInfo).then((detailedServiceInfo) => {
                var executableService = this._executableServiceFactory.create(detailedServiceInfo);
                if(!executableService) return;
                if(!this._executableServices.hasOwnProperty(detailedServiceInfo.hash))
                    this._executableServices[detailedServiceInfo.hash] = executableService;
                else
                    for (var methodName in executableService)
                        this._executableServices[detailedServiceInfo.hash][methodName] = executableService[methodName];
            }).catch(()=>{});
        });
    }
}

module.exports = ServiceExecutor;