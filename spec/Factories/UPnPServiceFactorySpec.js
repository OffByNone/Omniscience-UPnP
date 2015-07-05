///<reference path="../support/jasmine.d.ts" />
require("babel/register");
const UPnPServiceFactory = require('../../lib/Factories/UPnPServiceFactory');
const Constants = require('../../lib/Constants');

describe("UPnPServiceFactory", function () {
	var _sut;
	var _mockFetch;
	var _mockXmlParser;
	var _mockUrlProvider;
	var _mockUPnPExtensionInfoFactory;
	var _mockServiceProperyFactory;
	var _mockServiceMethodFactory;
	var _mockServiceExecutor;
	var _mockExecutableServiceMethodFactory;
	beforeEach(function () {
		_mockFetch = jasmine.createSpy("_mockFetch");
		_mockXmlParser = {};
		_mockUrlProvider = {};
		_mockUPnPExtensionInfoFactory = {};
		_mockServiceProperyFactory = {};
		_mockServiceMethodFactory = {};
		_mockServiceExecutor = {};
		_mockExecutableServiceMethodFactory = {};
		_sut = new UPnPServiceFactory(_mockFetch, _mockXmlParser, _mockUrlProvider, _mockUPnPExtensionInfoFactory, _mockServiceProperyFactory, _mockServiceMethodFactory, _mockServiceExecutor, _mockExecutableServiceMethodFactory);
	});

	describe("create", function () {
		it("should set up properties correctly and not try to fetch more information when the scpdurl is not a valid uri", function () { 
			//arrange
			var serviceXml = "xml for the service";
			var location = "location of the device";
			var base = "base for the location if one exists";
			var serverIP = "ip address of the server which found the device";
			var controlUrl = "controlUrl";
			var eventSubUrl = "eventSubUrl";
			var scpdUrl = "scpdUrl";
			var serviceId = "ser:vi:ce:Id";
			var serviceType = "serviceType";
			var serviceIdUPnP = "serviceIdUPnP";
			var serviceTypeUPnP = "serviceTypeUPnP";
			var controlUrlUrl = "controlUrlUrl";
			var eventSubUrlUrl = "eventSubUrlUrl";
			var scpdUrlUrl = "cpdUrlUrl";

			_mockXmlParser.getText = jasmine.createSpy("getText").and.callFake(function (xml, elName) {
				expect(xml).toBe(serviceXml);
				if (elName === "controlURL") return controlUrl;
				if (elName === "eventSubURL") return eventSubUrl;
				if (elName === "SCPDURL") return scpdUrl;
				if (elName === "serviceId") return serviceId;
				if (elName === "serviceType") return serviceType;
				else fail("unexpected element name " + elName + " was passed in");
			});

			_mockUrlProvider.toUrl = jasmine.createSpy("toUrl").and.callFake(function (url, locationParam, baseParam) {
				expect(locationParam).toBe(location);
				expect(baseParam).toBe(base);

				if (url === controlUrl) return controlUrlUrl;
				if (url === eventSubUrl) return eventSubUrlUrl;
				if (url === scpdUrl) return scpdUrlUrl;
				else fail("unexpected url " + url + " was passed in");

			});
			_mockUPnPExtensionInfoFactory.createFromString = jasmine.createSpy("createFromString").and.callFake(function (thingToCreate) {
				if (thingToCreate == serviceId) return serviceIdUPnP;
				if (thingToCreate == serviceType) return serviceTypeUPnP;
				else fail("unexpected parameter was passed in");
			});

			_mockUrlProvider.isValidUri = jasmine.createSpy("isValidUri").and.returnValue(false);

			
			//act
			var actual = _sut.create(serviceXml, location, base, serverIP);
			
			//assert
			expect(actual.controlUrl).toBe(controlUrlUrl);
			expect(actual.eventSubUrl).toBe(eventSubUrlUrl);
			expect(actual.scpdUrl).toBe(scpdUrlUrl);
			expect(actual.uuid).toBe("Id");
			expect(actual.id).toBe(serviceIdUPnP);
			expect(actual.type).toBe(serviceTypeUPnP);
			expect(actual.serverIP).toBe(serverIP);

			expect(_mockXmlParser.getText).toHaveBeenCalledWith(serviceXml, "controlURL");
			expect(_mockXmlParser.getText).toHaveBeenCalledWith(serviceXml, "eventSubURL");
			expect(_mockXmlParser.getText).toHaveBeenCalledWith(serviceXml, "SCPDURL");
			expect(_mockXmlParser.getText).toHaveBeenCalledWith(serviceXml, "serviceId");
			expect(_mockXmlParser.getText).toHaveBeenCalledWith(serviceXml, "serviceType");
			expect(_mockUrlProvider.toUrl).toHaveBeenCalledWith(controlUrl, location, base);
			expect(_mockUrlProvider.toUrl).toHaveBeenCalledWith(eventSubUrl, location, base);
			expect(_mockUrlProvider.toUrl).toHaveBeenCalledWith(scpdUrl, location, base);
			expect(_mockUPnPExtensionInfoFactory.createFromString).toHaveBeenCalledWith(serviceId);
			expect(_mockUPnPExtensionInfoFactory.createFromString).toHaveBeenCalledWith(serviceType);
			expect(_mockUrlProvider.isValidUri).toHaveBeenCalledWith(scpdUrlUrl);
		});
		it("should Fetch more information when the scpdurl is a valid uri", function () { 
			//arrange
			var serviceXml = "xml for the service";
			var location = "location of the device";
			var base = "base for the location if one exists";
			var controlUrl = "controlUrl";
			var eventSubUrl = "eventSubUrl";
			var scpdUrl = "scpdUrl";
			var serviceId = "ser:vi:ce:Id";
			var serviceType = "serviceType";
			var serviceIdUPnP = "serviceIdUPnP";
			var serviceTypeUPnP = {raw:"rawr"};
			var controlUrlUrl = "controlUrlUrl";
			var eventSubUrlUrl = "eventSubUrlUrl";
			var scpdUrlUrl = "cpdUrlUrl";

			var specVerMin = "spec version minor";
			var specVerMaj = "spec version major";

			_mockXmlParser.getText = jasmine.createSpy("getText").and.callFake(function (xml, elName) {
				if (xml !== responseXml && xml !== serviceXml)
					fail("unexpected xml passed in");
				if (elName === "controlURL") return controlUrl;
				if (elName === "eventSubURL") return eventSubUrl;
				if (elName === "SCPDURL") return scpdUrl;
				if (elName === "serviceId") return serviceId;
				if (elName === "serviceType") return serviceType;
				if (elName === "specVersion major") return specVerMaj;
				if (elName === "specVersion minor") return specVerMin;
				else fail("unexpected element name " + elName + " was passed in");
			});

			_mockUrlProvider.toUrl = jasmine.createSpy("toUrl").and.callFake(function (url, locationParam, baseParam) {
				expect(locationParam).toBe(location);
				expect(baseParam).toBe(base);

				if (url === controlUrl) return controlUrlUrl;
				if (url === eventSubUrl) return eventSubUrlUrl;
				if (url === scpdUrl) return scpdUrlUrl;
				else fail("unexpected url " + url + " was passed in");

			});
			_mockUPnPExtensionInfoFactory.createFromString = jasmine.createSpy("createFromString").and.callFake(function (thingToCreate) {
				if (thingToCreate == serviceId) return serviceIdUPnP;
				if (thingToCreate == serviceType) return serviceTypeUPnP;
				else fail("unexpected parameter was passed in");
			});


			var responseXml = "responseXml";
			var stateVariable = ["state", "Variable"];
			var action = ["action1", "action2"];
			var method1 = { name: "methodaction1" };
			var method2 = { name: "methodaction2" };
			_mockXmlParser.parseFromString = jasmine.createSpy("parseFromString").and.returnValue(responseXml);
			_mockXmlParser.getElements = jasmine.createSpy("getElements").and.callFake(function (xml, selector) {
				expect(xml).toBe(responseXml);
				if (selector === "stateVariable") return stateVariable;
				if (selector === "action") return action;
				else fail("unexpected selector '" + selector + "' was passed in");
			});
			_mockServiceProperyFactory.create = jasmine.createSpy("create").and.callFake(function (propertyXml) {
				if (propertyXml === "state") return "stateXmlProp";
				if (propertyXml === "Variable") return "variableXmlProp";
				else fail("unexpected propertyXml '" + propertyXml + "' passed in");
			});
			_mockServiceMethodFactory.create = jasmine.createSpy("create").and.callFake(function (methodXml, properties) {
				expect(properties.length).toBe(2);
				expect(properties[0]).toBe("stateXmlProp");
				expect(properties[1]).toBe("variableXmlProp");
				if (methodXml === "action1") return method1;
				if (methodXml === "action2") return method2;
				else fail("unexpected methodXml '" + methodXml + "' passed in");
			});

			var executableMethod1 = "executableMethod1";
			var executableMethod2 = "executableMethod2s";
			_mockExecutableServiceMethodFactory.create = jasmine.createSpy("create").and.callFake(function (method, rawType) {
				expect(rawType).toBe("rawr");
				if (method === method1) return executableMethod1;
				if (method === method2) return executableMethod2;
				else fail("unexpected method '" + JSON.stringify(method) + "' passed in");
			});

			_mockUrlProvider.isValidUri = jasmine.createSpy("isValidUri").and.returnValue(true);

			var fetchResponse = { _bodyText: "_bodyText" };
			var fetchResult = jasmine.createSpyObj("fetchResult", ["then"]);
			_mockFetch.and.returnValue(fetchResult);
			
			_mockServiceExecutor.executableServices = {};
			
			//act
			var actual = _sut.create(serviceXml, location, base, "ip address of the server which found the device");
			
			//assert
			expect(_mockFetch).toHaveBeenCalledWith(scpdUrlUrl);
			expect(fetchResult.then).toHaveBeenCalledWith(jasmine.any(Function));
			fetchResult.then.calls.argsFor(0)[0](fetchResponse);
			expect(_mockXmlParser.parseFromString).toHaveBeenCalledWith("_bodyText");
			expect(actual.upnpVersion.major).toBe(specVerMaj);
			expect(actual.upnpVersion.minor).toBe(specVerMin);
			expect(actual.properties.length).toBe(2);
			expect(actual.properties[0]).toBe("stateXmlProp");
			expect(actual.properties[1]).toBe("variableXmlProp");
			expect(actual.methods.length).toBe(2);
			expect(actual.methods[0]).toBe(method1);
			expect(actual.methods[1]).toBe(method2);
			expect(typeof _mockServiceExecutor.executableServices["Id"]).toBe("object");
			expect(_mockServiceExecutor.executableServices["Id"][method1.name]).toBe(executableMethod1);
			expect(_mockServiceExecutor.executableServices["Id"][method2.name]).toBe(executableMethod2);

		});
	});
});