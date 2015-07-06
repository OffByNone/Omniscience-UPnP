'use strict';

var UPnPExtensionInfo = require('../Entities/UPnPExtensionInfo');
var Constants = require('../Constants');

module.exports = {
        create: function create(typeString) {
                /*
                Type of Extension	Standard												Non-Standard
                device type			urn:schemas-upnp-org:device:[deviceType]:[version]		urn:[domain-name]:device:[deviceType]:[version]
                service type 		urn:schemas-upnp-org:service:[serviceType]:[version]	urn:[domain-name]:service:[serviceType]:[version]
                service id 			urn:upnp-org:serviceId:[serviceID]						urn:[domain-name]:serviceId:[serviceID]
                */
                if (!typeString) throw new Error('Argument \'typeString\' cannot be null.');

                var parts = typeString.split(':');
                if (parts.length !== 5 && parts.length !== 4) throw new Error('Invalid number of parts.  Must contain either 4 or 5, but had ' + parts.length);

                var info = new UPnPExtensionInfo();
                info.parts = parts;
                info.raw = typeString;
                info.domainName = info.parts[1];
                info.type = info.parts[2];
                info.name = info.parts[3];

                if (info.parts.length === 5) {
                        //device type and service type have 5 parts
                        info.isStandard = info.domainName === Constants.standardDomainName.type;
                        info.version = info.parts[4];
                } else if (info.parts.length === 4) {
                        //service id has 4 parts
                        info.isStandard = info.domainName === Constants.standardDomainName.id;
                }

                return info;
        }
};