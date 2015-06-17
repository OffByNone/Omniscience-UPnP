'use strict';

module.exports = {
	SOAP: {
		ContentType: 'text/xml; charset=utf-8',
		Body: '<?xml version="1.0" encoding="utf-8"?>\n' + '<SOAP-ENV:Envelope SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">' + '<SOAP-ENV:Body>' + '<m:{1} xmlns:m="{0}">' + '{2}' + '</m:{1}>' + '</SOAP-ENV:Body>' + '</SOAP-ENV:Envelope>'
	},
	PreconditionFailed: 412
};