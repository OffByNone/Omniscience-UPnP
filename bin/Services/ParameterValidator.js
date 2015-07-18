"use strict";
module.exports = {
	validate: function validate(validationInfo, parameter) {
		//todo: validate datatype as well
		//todo: make a test that checks for false and 0 should work
		if (parameter == null) throw new Error("Missing required argument: " + validationInfo.name);

		if (validationInfo.allowedValues.length > 0 && validationInfo.allowedValues.every(function (allowedValue) {
			return allowedValue != parameter;
		})) throw new Error("Value '" + parameter + "' for argument '" + validationInfo.name + "' is not an allowed value");
		if (validationInfo.allowedValueRange.maximum != null && validationInfo.allowedValueRange.minimum != null && validationInfo.allowedValueRange.step != null) {
			var paramNum = Number(parameter);
			if (isNaN(paramNum)) throw new Error("Argument '" + validationInfo.name + "' is required to be a type of number but was instead a type of " + typeof parameter);
			if (paramNum < Number(validationInfo.allowedValueRange.minimum)) throw new Error("Argument '" + validationInfo.name + "' is '" + parameter + "', which is less than the minimum allowed value of '" + validationInfo.allowedValueRange.minimum + "'");
			if (paramNum > Number(validationInfo.allowedValueRange.maximum)) throw new Error("Argument '" + validationInfo.name + "' is '" + parameter + "', which is greater than the maximum allowed value of '" + validationInfo.allowedValueRange.maximum + "'");
			if ((paramNum - Number(validationInfo.allowedValueRange.minimum)) % Number(validationInfo.allowedValueRange.step) !== 0) throw new Error("Argument '" + validationInfo.name + "' is '" + parameter + "', but must be a multiple of '" + validationInfo.allowedValueRange.step + "' starting at " + validationInfo.allowedValueRange.minimum);
		}
	}
};