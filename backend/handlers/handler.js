const axios = require("axios");
const cron = require("node-cron");
const argon2 = require("argon2");
require("dotenv").config();
const {
  parsePhoneNumberFromString,
  isValidPhoneNumber,
} = require("libphonenumber-js");
const Language = require("../models/languagesModel");

// Function to run at specific times

// Function to make GET request and log results
const startCronJob = async () => {
  const currentTime = new Date();
  console.log(`Cron job executed at ${currentTime.toLocaleTimeString()}`);

  // Obtém a URL da API do arquivo .env
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    console.error("API URL is not defined in the .env file.");
    return;
  }

  try {
    const response = await axios.get(apiUrl);
    console.log(`API response:`, response.data);
  } catch (error) {
    console.error(`Error during API request:`, error.message);
  }
};

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
    _id: { $in: languages.map((lang) => lang.language) },
  });
  return validLanguages.length === languages.length;
};

// # Birth calculation # //
const calculateAge = (birthDate) => {
  const currentDate = new Date();
  let age = currentDate.getFullYear() - birthDate.year;
  const monthDiff = currentDate.getMonth() + 1 - birthDate.month;
  const dayDiff = currentDate.getDate() - birthDate.day;

  // Adjust age if the birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
};

// Function to generate a hash for a password
async function hashPassword(password) {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id, // More secure variant (recommended)
      memoryCost: 2 ** 16, // Memory usage (64 MB)
      timeCost: 3, // Number of iterations (execution time)
      parallelism: 1, // Number of threads
    });
    return hash;
  } catch (err) {
    console.error("Error generating hash:", err);
    throw err;
  }
}

// Function to verify if a password matches the hash
async function verifyPassword(hash, password) {
  try {
    // Verify if the password corresponds to the hash
    return await argon2.verify(hash, password); // Returns true or false
  } catch (err) {
    console.error("Error verifying password:", err);
    throw err;
  }
}

module.exports = {
  validatePhoneNumber,
  getPhoneFinal,
  getCountryPrefix,
  validateLanguages,
  calculateAge,
  hashPassword,
  verifyPassword,
};
