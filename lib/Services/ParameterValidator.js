class ParameterValidator {
	constructor() { 
		
	}
	validate(validationInfo, parameter) {
        //todo: validate datatype as well
        if (!parameter) throw new Error(`Missing required argument: ${validationInfo.name}`);

		if (validationInfo.allowedValues.length > 0 && validationInfo.allowedValues.every(allowedValue => allowedValue != parameter))
			throw new Error(`value for argument ${validationInfo.name} is not allowed`);
		if (validationInfo.allowedValueRange.maximum != null && validationInfo.allowedValueRange.minimum != null && validationInfo.allowedValueRange.step != null) {
			var paramNum = Number(parameter);
			if (isNaN(paramNum)
				|| paramNum < Number(validationInfo.allowedValueRange.minimum) || paramNum > Number(validationInfo.allowedValueRange.maximum)
				|| paramNum - Number(validationInfo.allowedValueRange.maximum) % Number(validationInfo.allowedValueRange.step) !== 0)
				throw new Error(`argument ${validationInfo.name} is invalid.  It must be a number between ${validationInfo.allowedValueRange.minimum} and ${validationInfo.allowedValueRange.maximum}, and incremented by ${validationInfo.allowedValueRange.step}.`);
		}
	}
}

module.exports = ParameterValidator;