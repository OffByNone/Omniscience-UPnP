///<reference path="../support/jasmine.d.ts" />
require("babel/register");
const DeviceService = require('../../lib/Services/DeviceService');
const Constants = require('../../lib/Constants');

describe("DeviceService", function () {
	var _sut;
	var _mockFetch;
	var _mockNotifications;
	var _mockStorageService;
	var _mockDeviceLocator;
	var _mockDeviceFactory;
	var _mockMD5;
	beforeEach(function () {
		_mockMD5 = jasmine.createSpy("mockMD5");
		_mockDeviceFactory = {};
		_mockDeviceLocator = {};
		_mockStorageService = {};
		_mockNotifications = {};
		_mockFetch = jasmine.createSpy("mockFetch");
		_sut = new DeviceService(_mockDeviceFactory, _mockDeviceLocator, _mockStorageService, _mockNotifications, _mockFetch, _mockMD5);
	});

	describe("loadDevices", function () {
		it("should emit deviceFound for each device currently in the list of devices.", function () { 
			//arrange
			var device1 = "dev1";
			var device2 = "dev2";
			_sut.devices.push(device1);
			_sut.devices.push(device2);

			var deviceFoundCount = 0;

			_sut.on("deviceFound", function (device) {
				if (device === device1 || device === device2)
					deviceFoundCount++;
			});
			
			//act
			_sut.loadDevices();
			
			//assert
			expect(deviceFoundCount).toBe(2);
		});
	});
	describe("search", function () {
		it("should set up deviceFound and deviceLost event listeners on the deviceLocator, then issue a search, when the listeners are not already set up", function () {
			//arrange
			
			_mockDeviceLocator.on = jasmine.createSpy("on");
			_mockDeviceLocator.search = jasmine.createSpy("search");
			
			//act
			_sut.search();
			
			//assert
			expect(_mockDeviceLocator.on).toHaveBeenCalledWith("deviceFound", jasmine.any(Function));
			expect(_mockDeviceLocator.on).toHaveBeenCalledWith("deviceLost", jasmine.any(Function));
			expect(_mockDeviceLocator.search).toHaveBeenCalledWith(_sut.devices);
			expect(_sut._isInitialized).toBe(true);
		});
		it("should issue a search and nothing else when the listeners are already set up", function () { 
			//arrange
			_sut._isInitialized = true;
			_mockDeviceLocator.search = jasmine.createSpy("search");
			
			//act
			_sut.search();
			
			//assert
			expect(_mockDeviceLocator.search).toHaveBeenCalledWith(_sut.devices);
		});
		describe("deviceLost callback", function () {
			it("should call _removeDevice when the deviceLocator broadcasts a deviceLost event", function () { 
				//arrange
			
				_mockDeviceLocator.on = jasmine.createSpy("on");
				_mockDeviceLocator.search = jasmine.createSpy("search");

				spyOn(_sut, "_removeDevice");
				var lostDeviceId = "uuid for lost device";
			
				//act
				_sut.search();

				//assert
				expect(typeof _mockDeviceLocator.on.calls.argsFor(1)[1]).toBe("function");
				_mockDeviceLocator.on.calls.argsFor(1)[1](lostDeviceId);
				expect(_sut._removeDevice).toHaveBeenCalledWith(lostDeviceId);
			});
		});
		describe("deviceFound callback", function () {
			var _callback;
			beforeEach(function () {
				_mockDeviceLocator.on = jasmine.createSpy("on");
				_mockDeviceLocator.search = jasmine.createSpy("search");
				_sut.search();
				_callback = _mockDeviceLocator.on.calls.argsFor(0)[1];
				expect(typeof _callback).toBe("function");
			});
			it("should fetch the deviceXml from the location passed in and when the device is not known create it", function () { 
				//arrange
				var id = "uuid";
				var location = "http://starts with http";
				var fromAddress = "ip address";
				var serverIP = "my ip";
				var deviceXml = "comes back from fetch";

				var responseHash = "md5 hash";
				_mockMD5.and.returnValue(responseHash);
				var fetchResult = jasmine.createSpyObj("fetchresult", ["then"]);
				_mockFetch.and.returnValue(fetchResult);

				_mockDeviceFactory.create = jasmine.createSpy("create");
				spyOn(_sut, "_addDevice");
				
				//act
				_callback(id, location, fromAddress, serverIP);

				//assert
				expect(_mockFetch.calls.argsFor(0)[0]).toBe(location);
				expect(fetchResult.then).toHaveBeenCalledWith(jasmine.any(Function));

				fetchResult.then.calls.argsFor(0)[0](deviceXml);
				expect(_mockMD5).toHaveBeenCalledWith(deviceXml);
				expect(_mockDeviceFactory.create).toHaveBeenCalledWith(jasmine.any(Object), deviceXml, location, fromAddress, serverIP);
				expect(_sut._addDevice).toHaveBeenCalledWith(jasmine.any(Object));
			});
			it("should rebuild the device when the responseHash is not the same and the fromAddress is", function () { 
				//arrange
				var id = "uuid";
				var location = "http://starts with http";
				var fromAddress = "ip address";
				var serverIP = "my ip";
				var deviceXml = "comes back from fetch";
				var device = { fromAddress, id };

				_sut.devices.push(device);

				var responseHash = "md5 hash";
				_mockMD5.and.returnValue(responseHash);
				var fetchResult = jasmine.createSpyObj("fetchresult", ["then"]);
				_mockFetch.and.returnValue(fetchResult);

				_mockDeviceFactory.create = jasmine.createSpy("create");
				spyOn(_sut, "_addDevice");
				
				//act
				_callback(id, location, fromAddress, serverIP);

				//assert
				expect(_mockFetch.calls.argsFor(0)[0]).toBe(location);
				expect(fetchResult.then).toHaveBeenCalledWith(jasmine.any(Function));

				fetchResult.then.calls.argsFor(0)[0](deviceXml);
				expect(_mockMD5).toHaveBeenCalledWith(deviceXml);
				expect(_mockDeviceFactory.create).toHaveBeenCalledWith(device, deviceXml, location, fromAddress, serverIP);
				expect(_sut._addDevice).toHaveBeenCalledWith(device);
			});
			it("should not rebuild the device when the same device is found on a different network interface", function () { 
				//arrange
				var id = "uuid";
				var location = "http://starts with http";
				var fromAddress = "ip address";
				var serverIP = "my ip";
				var deviceXml = "comes back from fetch";
				var device = { fromAddress: "a different network interface will yield a different from address", id };

				_sut.devices.push(device);

				var responseHash = "md5 hash";
				_mockMD5.and.returnValue(responseHash);
				var fetchResult = jasmine.createSpyObj("fetchresult", ["then"]);
				_mockFetch.and.returnValue(fetchResult);

				spyOn(_sut, "_addDevice").and.callFake(function () {
					fail("this should not have been called");
				});
				
				//act
				_callback(id, location, fromAddress, serverIP);

				//assert
				expect(_mockFetch.calls.argsFor(0)[0]).toBe(location);
				expect(fetchResult.then).toHaveBeenCalledWith(jasmine.any(Function));

				fetchResult.then.calls.argsFor(0)[0](deviceXml);
			});
			it("should catch error when device factory throws", function () { 
				//arrange
				var id = "uuid";
				var location = "http://starts with http";
				var fromAddress = "ip address";
				var serverIP = "my ip";
				var deviceXml = "comes back from fetch";

				var responseHash = "md5 hash";
				_mockMD5.and.returnValue(responseHash);
				var fetchResult = jasmine.createSpyObj("fetchresult", ["then"]);
				_mockFetch.and.returnValue(fetchResult);

				_mockDeviceFactory.create = jasmine.createSpy("create");
				_mockDeviceFactory.create.and.callFake(function () {
					throw new Error("the device service should catch this error");
				});
				spyOn(_sut, "_addDevice").and.callFake(function () {
					fail("should not be caled when device factory throws");
				});
				
				//act
				_callback(id, location, fromAddress, serverIP);

				//assert
				expect(_mockFetch.calls.argsFor(0)[0]).toBe(location);
				expect(fetchResult.then).toHaveBeenCalledWith(jasmine.any(Function));

				fetchResult.then.calls.argsFor(0)[0](deviceXml);
			});
			it("should add http:// to the front of the location if it doesnt not start with http", function () { 
				//arrange
				var id = "uuid";
				var location = "doesnt start with http";
				var fromAddress = "ip address";
				var serverIP = "my ip";

				var fetchResult = jasmine.createSpyObj("fetchresult", ["then"]);
				_mockFetch.and.returnValue(fetchResult);
				
				//act
				_callback(id, location, fromAddress, serverIP);

				//assert
				expect(_mockFetch.calls.argsFor(0)[0]).toBe("http://" + location);
			});

		});
	});

	describe("_removeDevice", function () {
		it("should remove the device from the list, emit a device lost event and save the list", function () { 
			//arrange
			var deviceId = "uuid of device";
			var deviceToRemove = { id: deviceId };
			_sut.devices.push(deviceToRemove);

			spyOn(_sut, "emit");
			
			//act
			_sut._removeDevice(deviceId);
			
			//assert
			expect(_sut.emit).toHaveBeenCalledWith("deviceLost", deviceToRemove);
			expect(_sut.devices.length).toBe(0);
			expect(_mockStorageService.devices).toBe(_sut.devices);
		});
	});
	describe("_addDevice", function () {
		it("should add the device to the list, emit a device found event and save the list", function () {
			//arrange
			var device = { id: "" };
			_sut.devices.push(device);

			spyOn(_sut, "emit");
			
			//act
			_sut._addDevice(device);
			
			//assert
			expect(_sut.emit).toHaveBeenCalledWith("deviceFound", device);
			expect(_mockStorageService.devices).toBe(_sut.devices);
		});
		it("should add device to list and create a notification when the device was not in the list", function () { 
			//arrange
			var iconHref = "blahblahblah";
			var device = {
				id: "",
				name: "device name",
				model: { name: "model name" },
				manufacturer: { name: "manuf name" },
				icons: [{ url: { href: iconHref } }]
			};

			_mockNotifications.notify = jasmine.createSpy("notify");
			spyOn(_sut, "emit");
			
			//act
			_sut._addDevice(device);
			
			//assert
			expect(_sut.devices.length).toBe(1);
			expect(_sut.devices[0]).toBe(device);
			expect(_mockNotifications.notify).toHaveBeenCalledWith(jasmine.any(Object));
			var notifyArgs = _mockNotifications.notify.calls.argsFor(0)[0];
			expect(notifyArgs.title).toBe('Found ' + device.name);
			expect(notifyArgs.text).toBe("a " + device.model.name + " by " + device.manufacturer.name);
			expect(notifyArgs.iconURL).toBe(iconHref);
		});
	});
});