require("babel/register");
const DeviceFactory = require('../../lib/Factories/DeviceFactory');
const Constants = require('../../lib/Constants');

describe("DeviceFactory", function () {
	var _sut;
	var _mockXmlParser;
	var _mockUrlProvider;
	var _mockMD5;
	var _mockServiceInfoFactory;
	var _mockUPnPExtensionInfoFactory;
	beforeEach(function () {
		_mockXmlParser = {};
		_mockUrlProvider = {};
		_mockMD5 = jasmine.createSpy("mockMD5");
		_mockServiceInfoFactory = {};
		_mockUPnPExtensionInfoFactory = {};
		_sut = new DeviceFactory(_mockXmlParser, _mockUrlProvider, _mockMD5, _mockServiceInfoFactory, _mockUPnPExtensionInfoFactory);
	});

	describe("create", function () {
		it("should throw an error when root element is not found", function () {
			var device = {};
			var responseText = "xml from device as text";
			var responseXml = "xml from device";
			var location = "address of device";
			var fromAddress = "address of device";
			var serverIP = "ip of me";

			_mockXmlParser.getElement = jasmine.createSpy("getElement").and.returnValue(null);
			_mockXmlParser.parseFromString = jasmine.createSpy("parseFromString").and.returnValue(responseXml);

			//act
			try {
				_sut.create(device, responseText, location, fromAddress, serverIP);
				fail("expected error to be thrown");
			}
			catch (err) {
				//assert
				expect(err.message).toBe("Required element 'root' was not found in responseXml");
			}
		});
		it("should throw an error when device node is not found inside of root node", function () {
			var device = {};
			var responseText = "xml from device as text";
			var responseXml = "xml from device";
			var location = "address of device";
			var fromAddress = "address of device";
			var serverIP = "ip of me";
			var root = "root";
			var baseUrl = "baseUrl";

			_mockXmlParser.parseFromString = jasmine.createSpy("parseFromString").and.returnValue(responseXml);
			_mockXmlParser.getElement = jasmine.createSpy("getElement").and.callFake(function (xml, elName) {
				if (xml !== responseXml && xml !== root) fail("unexpected xml '" + xml + "'");

				if (elName === "root") return root;
				if (elName === "device") return null;
				else fail("unexpected element name '" + elName + "'");
			});

			_mockXmlParser.getText = jasmine.createSpy("getText").and.callFake(function (xml, elName) {
				expect(xml).toBe(root);

				if (elName === "baseUrl") return baseUrl;
				else fail("unexpected element name '" + elName + "'");
			});

			//act
			try {
				_sut.create(device, responseText, location, fromAddress, serverIP);
				fail("expected error to be thrown");
			}
			catch (err) {
				//assert
				expect(err.message).toBe("Required element 'device' was not found inside 'root' node");
			}
		});
		it("should properly setup device object from xml passed in", function () {
			var device = { services: [] };
			var responseText = "xml from device as text";
			var responseXml = "xml from device";
			var location = "address of device";
			var fromAddress = "address of device";
			var serverIP = "ip of me";
			var root = "root";
			var deviceElement = "deviceElement";
			var baseUrl = "baseUrl";
			var deviceAddress = "deviceAddress";
			var service1 = "service1";
			var service2 = "service2";
			var listOfServices = [service1, service2];
			var specVerMaj = "spec version major";
			var specVerMin = "spec verion minor";
			var ssdpDescriptionLocation = "ssdpDescriptionLocation";
			var deviceResponseHash = "deviceResponseHash";

			_mockXmlParser.parseFromString = jasmine.createSpy("parseFromString").and.returnValue(responseXml);
			_mockXmlParser.getElement = jasmine.createSpy("getElement").and.callFake(function (xml, elName) {
				if (xml !== responseXml && xml !== root) fail("unexpected xml '" + xml + "'");

				if (elName === "root") return root;
				if (elName === "device") return deviceElement;
				else fail("unexpected element name '" + elName + "'");
			});

			_mockXmlParser.getText = jasmine.createSpy("getText").and.callFake(function (xml, elName) {
				expect(xml).toBe(root);

				if (elName === "baseUrl") return baseUrl;
				if (elName === "specVersion major") return specVerMaj;
				if (elName === "specVersion minor") return specVerMin;
				else fail("unexpected element name '" + elName + "'");
			});

			_mockXmlParser.getElements = jasmine.createSpy("getElements").and.callFake(function (xml, elName) {
				expect(xml).toBe(deviceElement);

				if (elName === "serviceList service") return listOfServices;
				else fail("unexpected element name '" + elName + "'");
			});

			var i = 0;
			_mockServiceInfoFactory.create = jasmine.createSpy("create").and.callFake(function () {
				i++;
				return i;
			});

			_mockUrlProvider.createUrl = jasmine.createSpy("createUrl").and.callFake(function (theArgument) {
				if (theArgument === location) return ssdpDescriptionLocation;
				if (theArgument === baseUrl) return deviceAddress;

			});

			_mockMD5.and.returnValue(deviceResponseHash);
			spyOn(_sut, "_parseDeviceAttributes");
			spyOn(_sut, "_parseDeviceIcons");


			//act
			_sut.create(device, responseText, location, fromAddress, serverIP);

			//assert
			expect(_sut._parseDeviceAttributes).toHaveBeenCalledWith(device, deviceElement, baseUrl, location, serverIP);
			expect(_sut._parseDeviceIcons).toHaveBeenCalledWith(device, deviceElement, baseUrl, location, serverIP);
			expect(_mockServiceInfoFactory.create).toHaveBeenCalledWith(service1, location, baseUrl, serverIP);
			expect(_mockServiceInfoFactory.create).toHaveBeenCalledWith(service2, location, baseUrl, serverIP);
			expect(device.services.length).toBe(2);
			expect(device.services[0]).toBe(1);
			expect(device.services[1]).toBe(2);
			expect(device.upnpVersion.major).toBe(specVerMaj);
			expect(device.upnpVersion.minor).toBe(specVerMin);
			expect(_mockUrlProvider.createUrl).toHaveBeenCalledWith(location);
			expect(_mockUrlProvider.createUrl).toHaveBeenCalledWith(baseUrl);
			expect(device.address).toBe(deviceAddress);
			expect(device.ssdpDescription).toBe(ssdpDescriptionLocation);
			expect(device.responseHash).toBe(deviceResponseHash);
			expect(device.fromAddress).toBe(fromAddress);
			expect(device.serverIP).toBe(serverIP);
		});
		it("should use the location.origin when base is null for the device address", function () {
			var device = { services: [] };
			var responseText = "xml from device as text";
			var responseXml = "xml from device";
			var location = "address of device";
			var fromAddress = "address of device";
			var serverIP = "ip of me";
			var deviceAddress = "deviceAddressorigin";
			var locationOrigin = "origin of the location";

			_mockXmlParser.getElement = jasmine.createSpy("getElement").and.returnValue(" ");
			_mockXmlParser.parseFromString = jasmine.createSpy("parseFromString").and.returnValue(responseXml);
			_mockXmlParser.getText = jasmine.createSpy("getText").and.returnValue("");
			_mockXmlParser.getElements = jasmine.createSpy("getElements").and.returnValue([]);
			_mockServiceInfoFactory.create = jasmine.createSpy("create").and.returnValue(" ");

			_mockUrlProvider.createUrl = jasmine.createSpy("createUrl").and.callFake(function (theArgument) {
				if (theArgument === location) return { origin: locationOrigin };
				if (theArgument === locationOrigin) return deviceAddress;
			});

			spyOn(_sut, "_parseDeviceAttributes");
			spyOn(_sut, "_parseDeviceIcons");

			//act
			_sut.create(device, responseText, location, fromAddress, serverIP);

			//assert
			expect(_mockUrlProvider.createUrl).toHaveBeenCalledWith(location);
			expect(_mockUrlProvider.createUrl).toHaveBeenCalledWith(locationOrigin);
			expect(device.address).toBe(deviceAddress);
		});
	});
	describe("_parseDeviceAttributes", function () {
		it("should add each icon in the xml to the list of device icons", function () {
			//arrange
			var device = { icons: [] };
			var deviceXml = "devXml";
			var location = "location";
			var base = "baseurl";
			var serialNumber = "serialNumber";
			var presentationUrl = "presentationUrl";
			var friendlyName = "friendlyName";
			var udn = "uuid:udn";
			var manufacturerName = "manufacturerName";
			var manufacturerUrl = "manufacturerUrl";
			var modelNumber = "modelNumber";
			var modelDescription = "modelDescription";
			var modelName = "modelName";
			var modelUrl = "modelUrl";
			var upc = "upc";
			var deviceType = "deviceType";
			var deviceTypeExtensionInfo = "deviceTypeExtensionInfo";

			_mockUPnPExtensionInfoFactory.create = jasmine.createSpy("create").and.returnValue(deviceTypeExtensionInfo);

			_mockXmlParser.getText = jasmine.createSpy("getText").and.callFake(function (deviceXml, elName) {
				if (elName === "serialNumber") return serialNumber;
				if (elName === "presentationURL") return presentationUrl;
				if (elName === "friendlyName") return friendlyName;
				if (elName === "UDN") return udn;
				if (elName === "manufacturer") return manufacturerName;
				if (elName === "manufacturerURL") return manufacturerUrl;
				if (elName === "modelNumber") return modelNumber;
				if (elName === "modelDescription") return modelDescription;
				if (elName === "modelName") return modelName;
				if (elName === "modelUrl") return modelUrl;
				if (elName === "UPC") return upc;
				if (elName === "deviceType") return deviceType;
				else fail("unexpected element name '" + elName + "'");
			});

			//act
			_sut._parseDeviceAttributes(device, deviceXml, location, base);

			//assert
			expect(_mockUPnPExtensionInfoFactory.create).toHaveBeenCalledWith(deviceType);
			expect(device.serialNumber).toBe(serialNumber);
			expect(device.webPage).toBe(presentationUrl);
			expect(device.name).toBe(friendlyName);
			expect(device.id).toBe("udn");
			expect(device.type).toBe(deviceTypeExtensionInfo);
			expect(device.manufacturer.name).toBe(manufacturerName);
			expect(device.manufacturer.url).toBe(manufacturerUrl);
			expect(device.model.number).toBe(modelNumber);
			expect(device.model.description).toBe(modelDescription);
			expect(device.model.name).toBe(modelName);
			expect(device.model.url).toBe(modelUrl);
			expect(device.upc).toBe(upc);
		});
	});
	describe("_parseDeviceIcons", function () {
		it("should add each icon in the xml to the list of device icons", function () {
			//arrange
			var device = { icons: [] };
			var deviceXml = "devXml";
			var location = "location";
			var base = "baseurl";
			var icon1Xml = "icon1XML";
			var icon2Xml = "icon2XML";
			var icon1Url = "icon1Url";
			var icon2Url = "icon2Url";
			var icon1CompiledUrl = "icon1CompiledUrl";
			var icon2CompiledUrl = "icon2CompiledUrl";
			var isIcon2 = false;
			var iconsXml = [icon1Xml, icon2Xml];
			var icon1Mimetype = "icon1Mimetype";
			var icon2Mimetype = "icon2Mimetype";
			var icon1Width = "icon1Width";
			var icon2Width = "icon2Width";
			var icon1Height = "icon1Height";
			var icon2Height = "icon2Height";
			var icon1Depth = "icon1Depth";
			var icon2Depth = "icon2Depth";


			_mockUrlProvider.toUrl = jasmine.createSpy("toUrl").and.callFake(function (iconText, iconLocation, iconBase) {
				if (iconText !== icon1Url && iconText !== icon2Url) fail("unexpected iconText of '" + iconText + "'");
				if (location !== location) fail("unexpected iconLocation of '" + iconLocation + "'");
				if (iconBase !== base) fail("unexpected iconBase of '" + iconBase + "'");

				if (!isIcon2) {
					isIcon2 = true;
					return icon1CompiledUrl;
				}
				else return icon2CompiledUrl;
			});

			_mockXmlParser.getElements = jasmine.createSpy("getElements").and.returnValue(iconsXml);

			_mockXmlParser.getText = jasmine.createSpy("getText").and.callFake(function (iconXml, elName) {
				if (iconXml !== icon1Xml && iconXml !== icon2Xml) fail("unexpected iconXml of '" + iconXml + "'");

				if (!isIcon2) {
					if (elName === "mimetype") return icon1Mimetype;
					if (elName === "width") return icon1Width;
					if (elName === "height") return icon1Height;
					if (elName === "depth") return icon1Depth;
					if (elName === "url") return icon1Url;
				}
				else {
					if (elName === "mimetype") return icon2Mimetype;
					if (elName === "width") return icon2Width;
					if (elName === "height") return icon2Height;
					if (elName === "depth") return icon2Depth;
					if (elName === "url") return icon2Url;
				}
			});

			//act
			_sut._parseDeviceIcons(device, deviceXml, location, base);

			//assert
			expect(_mockXmlParser.getElements).toHaveBeenCalledWith(deviceXml, "iconList icon");
			expect(device.icons.length).toBe(2);
			expect(device.icons[0].mimeType).toBe(icon1Mimetype);
			expect(device.icons[0].width).toBe(icon1Width);
			expect(device.icons[0].height).toBe(icon1Height);
			expect(device.icons[0].depth).toBe(icon1Depth);
			expect(device.icons[0].url).toBe(icon1CompiledUrl);
			expect(device.icons[1].mimeType).toBe(icon2Mimetype);
			expect(device.icons[1].width).toBe(icon2Width);
			expect(device.icons[1].height).toBe(icon2Height);
			expect(device.icons[1].depth).toBe(icon2Depth);
			expect(device.icons[1].url).toBe(icon2CompiledUrl);
		});
	});
});