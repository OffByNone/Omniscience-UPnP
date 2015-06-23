/* global Promise */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ServiceExecutor = (function () {
    function ServiceExecutor(serviceInfoFactory, executableServiceFactory) {
        _classCallCheck(this, ServiceExecutor);

        this._executableServiceFactory = executableServiceFactory;
        this._serviceInfoFactory = serviceInfoFactory;
        this._executableServices = {};
    }

    _createClass(ServiceExecutor, [{
        key: "callService",
        value: function callService(serviceControlUrl, serviceHash, serviceMethod, data) {
            if (!serviceControlUrl || !serviceMethod) return Promise.reject("Either there was no control url passed in or no method.");

            var serviceClass = this._executableServices[serviceHash];
            if (!serviceClass) return Promise.reject("Executable Service has not yet been created.");

            var serviceFunc = serviceClass[serviceMethod];
            if (typeof serviceFunc !== "function") return Promise.reject("Executable Service has been created, but, service function has not.");

            return serviceFunc(serviceControlUrl, data);
        }
    }, {
        key: "addExecutableServices",
        value: function addExecutableServices(services) {
            var _this = this;

            if (!Array.isArray(services)) return;
            services.forEach(function (basicServiceInfo) {
                _this._serviceInfoFactory.getDetailedServiceInformation(basicServiceInfo).then(function (detailedServiceInfo) {
                    var executableService = _this._executableServiceFactory.create(detailedServiceInfo);
                    if (!executableService) return;
                    if (!_this._executableServices.hasOwnProperty(detailedServiceInfo.hash)) _this._executableServices[detailedServiceInfo.hash] = executableService;else for (var methodName in executableService) _this._executableServices[detailedServiceInfo.hash][methodName] = executableService[methodName];
                })["catch"](function () {});
            });
        }
    }]);

    return ServiceExecutor;
})();

module.exports = ServiceExecutor;