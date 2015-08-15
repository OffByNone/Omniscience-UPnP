"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var UPnPVersion = require('../Entities/UPnPVersion');
var UPnPService = require('../Entities/UPnPService');

var UPnPServiceFactory = (function () {
				function UPnPServiceFactory(fetch, xmlParser, urlProvider, upnpExtensionInfoFactory, serviceProperyFactory, serviceMethodFactory, serviceExecutor, executableServiceMethodFactory) {
								_classCallCheck(this, UPnPServiceFactory);

								this._fetch = fetch;
								this._xmlParser = xmlParser;
								this._urlProvider = urlProvider;
								this._upnpExtensionInfoFactory = upnpExtensionInfoFactory;
								this._serviceProperyFactory = serviceProperyFactory;
								this._serviceMethodFactory = serviceMethodFactory;
								this._serviceExecutor = serviceExecutor;
								this._executableServiceMethodFactory = executableServiceMethodFactory;
				}

				_createClass(UPnPServiceFactory, [{
								key: 'create',
								value: function create(serviceXml, location, base, serverIP) {
												var _this = this;

												var upnpService = new UPnPService();
												upnpService.controlUrl = this._urlProvider.toUrl(this._xmlParser.getText(serviceXml, "controlURL"), location, base);
												upnpService.eventSubUrl = this._urlProvider.toUrl(this._xmlParser.getText(serviceXml, "eventSubURL"), location, base);
												upnpService.scpdUrl = this._urlProvider.toUrl(this._xmlParser.getText(serviceXml, "SCPDURL"), location, base);
												upnpService.uuid = this._xmlParser.getText(serviceXml, "serviceId").split(":")[3];
												upnpService.id = this._upnpExtensionInfoFactory.create(this._xmlParser.getText(serviceXml, "serviceId"));
												upnpService.type = this._upnpExtensionInfoFactory.create(this._xmlParser.getText(serviceXml, "serviceType"));
												upnpService.serverIP = serverIP;

												if (this._urlProvider.isValidUri(upnpService.scpdUrl)) this._fetch(upnpService.scpdUrl).then(function (response) {
																//todo: take in the current upnpService object as a parameter, and add a hash of the response to said object so I can lazy rebuild it like I do the device
																var responseXml = _this._xmlParser.parseFromString(response._bodyText);
																upnpService.upnpVersion = new UPnPVersion();
																upnpService.upnpVersion.major = _this._xmlParser.getText(responseXml, "specVersion major");
																upnpService.upnpVersion.minor = _this._xmlParser.getText(responseXml, "specVersion minor");

																var propertiesXml = _this._xmlParser.getElements(responseXml, "stateVariable");
																propertiesXml.forEach(function (propertyXml) {
																				return upnpService.properties.push(_this._serviceProperyFactory.create(propertyXml));
																});

																var methodsXml = _this._xmlParser.getElements(responseXml, "action");
																methodsXml.forEach(function (methodXml) {
																				return upnpService.methods.push(_this._serviceMethodFactory.create(methodXml, upnpService.properties));
																});

																var executableService = {};
																upnpService.methods.forEach(function (method) {
																				return executableService[method.name] = _this._executableServiceMethodFactory.create(method, upnpService.type.raw);
																});
																_this._serviceExecutor.executableServices[upnpService.uuid] = executableService;

																return upnpService;
												});

												return upnpService;
								}
				}]);

				return UPnPServiceFactory;
})();

module.exports = UPnPServiceFactory;