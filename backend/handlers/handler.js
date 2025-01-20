const axios = require("axios");
const cron = require("node-cron");
const argon2 = require("argon2");
const crypto = require("crypto");
require("dotenv").config();
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const Language = require("../models/languagesModel");

// # Cron Job # //

// Executes a GET request to a specified API URL at scheduled intervals
const startCronJob = async () => {
  const currentTime = new Date();
  console.log(`Cron job executed at ${currentTime.toLocaleTimeString()}`);

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

// Schedule the job to run every 10 minutes
cron.schedule("0,10,20,30,40,50 * * * *", startCronJob);

// # Phone Handlers # //

// Validates if a phone number is correctly formatted and valid
const validatePhoneNumber = (phonePrefix, phoneNumber) => {
  try {
    const phone = parsePhoneNumberFromString(`${phonePrefix}${phoneNumber}`);
    return phone && phone.isValid();
  } catch {
    return false;
  }
};

// Combines the phone prefix and number into a single string
const getPhoneFinal = (phonePrefix, phoneNumber) => {
  return phonePrefix && phoneNumber ? `${phonePrefix}${phoneNumber}` : null;
};

// Retrieves the country and calling code from a phone number
const getCountryPrefix = (phonePrefix, phoneNumber) => {
  const phone = parsePhoneNumberFromString(`${phonePrefix}${phoneNumber}`);
  return phone ? `${phone.country} (${phone.countryCallingCode})` : null;
};

// # Language Validation # //

// Ensures all provided language IDs exist in the database
const validateLanguages = async (languages) => {
  const validLanguages = await Language.find({
    _id: { $in: languages.map((lang) => lang.language) },
  });
  return validLanguages.length === languages.length;
};

// # Age Calculation # //

// Calculates a user's age based on their birthdate
const calculateAge = (birthDate) => {
  const currentDate = new Date();
  let age = currentDate.getFullYear() - birthDate.year;
  const monthDiff = currentDate.getMonth() + 1 - birthDate.month;
  const dayDiff = currentDate.getDate() - birthDate.day;

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
};

// # Password Hashing # //

// Generates a secure hash for a password using Argon2
async function hashPassword(password) {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  } catch (err) {
    console.error("Error generating hash:", err);
    throw err;
  }
}

// Verifies if a password matches a given hash
async function verifyPassword(hash, password) {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    console.error("Error verifying password:", err);
    throw err;
  }
}

// # Encryption and Decryption # //

// Encryption configuration
const ALGORITHM = "aes-256-cbc";
const KEY = Buffer.from(process.env.CRYPTO_KEY, "hex"); // Ensure this is set in .env
const IV = Buffer.from(process.env.CRYPTO_IV, "hex");

// Encrypts data using AES-256-CBC
function encryptData(data) {
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    iv: IV.toString("hex"),
    encryptedData: encrypted,
  };
}

// Decrypts data using AES-256-CBC
function decryptData(encryptedObject) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(encryptedObject.iv, "hex")
  );
  let decrypted = decipher.update(encryptedObject.encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// # Module Exports # //

module.exports = {
  validatePhoneNumber,
  getPhoneFinal,
  getCountryPrefix,
  validateLanguages,
  calculateAge,
  hashPassword,
  verifyPassword,
  encryptData,
  decryptData,
};
