const {
  parsePhoneNumberFromString,
  isValidPhoneNumber,
} = require("libphonenumber-js");
const Language = require("../models/languagesModel");
const cron = require("node-cron");

// Function to run at specific times
const startCronJob = () => {
  const currentTime = new Date();
  console.log(
    `The function was executed at ${currentTime.toLocaleTimeString()}`
  );
};

// Schedule cron job to run every 10 minutes (on 0, 10, 20, etc.)
cron.schedule("0,10,20,30,40,50 * * * *", startCronJob);

// # Phone handlers # //

// Validates phone number using prefix and number
const validatePhoneNumber = (phonePrefix, phoneNumber) => {
  try {
    const phone = parsePhoneNumberFromString(`${phonePrefix}${phoneNumber}`);
    return phone && phone.isValid();
  } catch (e) {
    return false;
  }
};

// Combines phone prefix and number to get final phone number
const getPhoneFinal = (phonePrefix, phoneNumber) => {
  if (phonePrefix && phoneNumber) {
    return `${phonePrefix}${phoneNumber}`;
  }
  return null;
};

// Returns country and calling code from phone number
const getCountryPrefix = (phonePrefix, phoneNumber) => {
  const phone = parsePhoneNumberFromString(`${phonePrefix}${phoneNumber}`);
  return phone ? `${phone.country} (${phone.countryCallingCode})` : null;
};

// Validates that the languages are correct by checking the Language model
const validateLanguages = async (languages) => {
  const validLanguages = await Language.find({
    _id: { $in: languages.map((lang) => lang.languageId) },
  });
  return validLanguages.length === languages.length;
};

module.exports = {
  validatePhoneNumber,
  getPhoneFinal,
  getCountryPrefix,
  validateLanguages,
};
