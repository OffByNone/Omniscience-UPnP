const UPnPExtensionInfo = require('../Entities/UPnPExtensionInfo');
class UPnPExtensionInfoFactory {
	constructor() { 
		
	}
	create(typeString) { 
        /*
		Type of Extension	Standard												Non-Standard
		device type			urn:schemas-upnp-org:device:[deviceType]:[version]		urn:[domain-name]:device:[deviceType]:[version]
		service type 		urn:schemas-upnp-org:service:[serviceType]:[version]	urn:[domain-name]:service:[serviceType]:[version]
		service id 			urn:upnp-org:serviceId:[serviceID]						urn:[domain-name]:serviceId:[serviceID]
		*/
        if (!typeString) throw new Error("Argument null exception.  Argument 'typeString' cannot be null.");

		var info = new UPnPExtensionInfo();

        info.raw = typeString;
        info.parts = typeString.split(":");
        if (info.parts.length !== 5 && info.parts.length !== 4) throw new Error("Invalid number of parts.  Must contain either 4 or 5 parts, but had " + info.parts.length);
        info.domainName = info.parts[1];
        info.type = info.parts[2];
        info.name = info.parts[3];

        if (info.parts.length === 5) {
			//device type and service type have 5 parts
            info.isStandard = info.domainName === "schemas-upnp-org";
            info.version = info.parts[4];
        }
        else if (info.parts.length === 4) {
			//service id has 4 parts
            info.isStandard = info.domainName === "upnp-org";
        }

		return info;
	}
}

module.exports = UPnPExtensionInfoFactory;