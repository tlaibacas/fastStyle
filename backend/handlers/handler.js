// handler.js
const {
  parsePhoneNumberFromString,
  isValidPhoneNumber,
} = require("libphonenumber-js");
const Language = require("../models/languagesModel"); // Import the Language model

// Phone validation utility
const validatePhoneNumber = (phonePrefix, phoneNumber) => {
  try {
    const phone = parsePhoneNumberFromString(`${phonePrefix}${phoneNumber}`);
    return phone && phone.isValid();
  } catch (e) {
    return false;
  }
};

// Get the final phone number by combining the prefix and the number
const getPhoneFinal = (phonePrefix, phoneNumber) => {
  if (phonePrefix && phoneNumber) {
    return `${phonePrefix}${phoneNumber}`;
  }
  return null;
};

// Get the country prefix (country name and calling code)
const getCountryPrefix = (phonePrefix, phoneNumber) => {
  const phone = parsePhoneNumberFromString(`${phonePrefix}${phoneNumber}`);
  return phone ? `${phone.country} (${phone.countryCallingCode})` : null;
};

// Language validation utility
const validateLanguages = async (languages) => {
  const validLanguages = await Language.find({
    _id: { $in: languages.map((lang) => lang.language) },
  });
  return validLanguages.length === languages.length;
};

module.exports = {
  validatePhoneNumber,
  getPhoneFinal,
  getCountryPrefix,
  validateLanguages,
};
