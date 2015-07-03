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
	beforeEach(function () {
		_mockDeviceFactory = {};
		_mockDeviceLocator = {};
		_mockStorageService = {};
		_mockNotifications = {};
		_mockFetch = {};
		_sut = new DeviceService(_mockDeviceFactory, _mockDeviceLocator, _mockStorageService, _mockNotifications, _mockFetch);
	});

	describe("loadDevices", function () {

	});
	describe("search", function () {

	});
	describe("_removeDevice", function () {

	});
	describe("_addDevice", function () {

	});	
});