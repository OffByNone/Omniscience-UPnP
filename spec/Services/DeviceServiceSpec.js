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
		it("should issue a search and nothing else when the listeners are already set up", function () {
			//arrange
			_sut._isInitialized = true;
			_mockDeviceLocator.search = jasmine.createSpy("search");

			//act
			_sut.search();

			//assert
			expect(_mockDeviceLocator.search).toHaveBeenCalledWith(_sut.devices);
		});
		describe("deviceLost callback", function () { });
		describe("deviceFound callback", function () {
			var _callback;
			beforeEach(function () {
				_mockDeviceLocator.on = jasmine.createSpy("on");
				_mockDeviceLocator.search = jasmine.createSpy("search");
				_sut.search();
				_callback = _mockDeviceLocator.on.calls.argsFor(0)[1];
				expect(typeof _callback).toBe("function");
			});
		});
	});

	describe("_removeDevice", function () { });
	describe("_addDevice", function () { });
});