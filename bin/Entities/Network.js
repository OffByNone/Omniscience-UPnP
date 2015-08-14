"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Network = (function () {
    function Network() {
        _classCallCheck(this, Network);

        this.security = null;
        this.name = null;
    }

    _createClass(Network, [{
        key: "isSecure",
        value: function isSecure() {
            return this.security !== null;
        }
    }]);

    return Network;
})();

/**
 * WiFi network
 */
module.exports = Network;