"use strict";

module.exports.format = function format(stringToFormat) {
    //a string.format like function
    var args = Array.prototype.slice.call(arguments, 1);
    return stringToFormat.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] !== "undefined" ? args[number] : match;
    });
};