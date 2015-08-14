"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var XmlParser = (function () {
	function XmlParser(domParser) {
		_classCallCheck(this, XmlParser);

		this._domParser = domParser;
	}

	//todo: make this into a singleton

	_createClass(XmlParser, [{
		key: "parseFromString",
		value: function parseFromString(stringOfXml) {
			return typeof stringOfXml === "string" ? this._domParser.parseFromString(stringOfXml, 'text/xml') : null;
		}
	}, {
		key: "getElements",
		value: function getElements(xml, selector) {
			return xml && typeof xml.querySelectorAll === "function" ? Array.prototype.slice.call(xml.querySelectorAll(selector)) : [];
		}
	}, {
		key: "getElement",
		value: function getElement(xml, selector) {
			return xml && typeof xml.querySelector === "function" ? xml.querySelector(selector) : null;
		}
	}, {
		key: "hasNode",
		value: function hasNode(xml, selector) {
			return xml && typeof xml.querySelector === "function" ? xml.querySelector(selector) != null : false;
		}
	}, {
		key: "getText",
		value: function getText(xml, selector) {
			return xml && typeof xml.querySelector === "function" ? (xml.querySelector(selector) || { innerHTML: null }).innerHTML : null;
		}
	}, {
		key: "getAttribute",
		value: function getAttribute(node, attributeName) {
			var attribute = node.attributes.getNamedItem(attributeName);
			return attribute ? attribute.value : null;
		}
	}]);

	return XmlParser;
})();

module.exports = XmlParser;