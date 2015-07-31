"use strict";

class XmlParser {
	constructor(domParser) {
		this._domParser = domParser;
	}
	parseFromString(stringOfXml) {
		return typeof stringOfXml === "string" ? this._domParser.parseFromString(stringOfXml, 'text/xml') : null;
	}
	getElements(xml, selector) {
		return (xml && typeof xml.querySelectorAll === "function") ? Array.prototype.slice.call(xml.querySelectorAll(selector)) : [];
	}
	getElement(xml, selector) {
		return (xml && typeof xml.querySelector === "function") ? xml.querySelector(selector) : null;
	}
	hasNode(xml, selector) {
		return (xml && typeof xml.querySelector === "function") ? xml.querySelector(selector) != null : false;
	}
	getText(xml, selector) {
		return (xml && typeof xml.querySelector === "function") ? (xml.querySelector(selector) || { innerHTML: null }).innerHTML : null;
	}
	getAttribute(node, attributeName) {
		let attribute = node.attributes.getNamedItem(attributeName);
		return attribute ? attribute.value : null;
	}
}
//todo: make this into a singleton
module.exports = XmlParser;