class UPnPService {
    constructor() {
        this.controlUrl = null; //URL
        this.eventSubUrl = null; //URL
        this.scpdUrl = null; //URL
        this.type = null; //UPnPExtensionInfo
        this.upnpVersion = null; //UPnPVersion
        this.responseHash = null; //md5 of the scpd response.text
        this.id = null;
        this.properties = [];
        this.methods = [];
        this.uuid = null;
        this.subscriptionId = null; //id used to unsubscribe and renew subscriptions.  Is returned from the subscribe call.
    }
}

module.exports = UPnPService;