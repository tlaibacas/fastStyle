const axios = require("axios");
const cron = require("node-cron");
const argon2 = require("argon2");
const crypto = require("crypto");
require("dotenv").config();
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const Language = require("../models/languagesModel");

// Function to hash a password
async function hashPassword(password) {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // Memory cost factor
      timeCost: 3,
      parallelism: 1,
    });
  } catch (err) {
    console.error("Error generating hash:", err);
    throw err;
  }
}

// Function to verify a password against its hash
async function verifyPassword(hash, password) {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    console.error("Error verifying password:", err);
    throw err;
  }
}

// Encryption configuration
const ALGORITHM = "aes-256-cbc";
const KEY = Buffer.from(process.env.CRYPTO_KEY, "hex");
const IV = Buffer.from(process.env.CRYPTO_IV, "hex");

// Function to encrypt data using AES-256-CBC
function encryptData(data) {
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    iv: IV.toString("hex"),
    encryptedData: encrypted,
  };
}

// Encrypt data using AES-256-CBC
const encryptField = (fieldName, fieldValue) => {
  if (fieldValue) {
    if (fieldName === "serviceSpecialist" && Array.isArray(fieldValue)) {
      const stringifiedValue = JSON.stringify(fieldValue);
      return encryptData(stringifiedValue).encryptedData;
    }

    if (Array.isArray(fieldValue)) {
      fieldValue = fieldValue.map((item) => {
        if (item.proficiency) {
          item.encryptedProficiency = encryptData(
            item.proficiency
          ).encryptedData;
          item.proficiency = item.encryptedProficiency;
        }
        return item;
      });
    }

    if (typeof fieldValue === "object" && !Array.isArray(fieldValue)) {
      Object.keys(fieldValue).forEach((key) => {
        fieldValue[key] = encryptField(`${fieldName}.${key}`, fieldValue[key]);
      });
    } else {
      const stringifiedValue = JSON.stringify(fieldValue);
      return encryptData(stringifiedValue).encryptedData;
    }

    return fieldValue;
  }
  return null;
};

const encryptMultipleFields = (fields) => {
  const encryptedFields = {};
  fields.forEach(({ name, value }) => {
    encryptedFields[name] = encryptField(name, value);
  });
  return encryptedFields;
};

// Function to decrypt encrypted data using AES-256-CBC
const decryptData = (encryptedObject) => {
  if (!encryptedObject) return null;

  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      KEY,
      Buffer.from(encryptedObject.iv, "hex")
    );
    let decrypted = decipher.update(
      encryptedObject.encryptedData,
      "hex",
      "utf8"
    );
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Error decrypting data:", error.message);
    return encryptedObject; // Retorna o valor original em caso de erro
  }
};

// Função para descriptografar um campo
const decryptField = (fieldName, fieldValue) => {
  if (fieldValue) {
    if (fieldName === "serviceSpecialist" && Array.isArray(fieldValue)) {
      const decryptedData = decryptData({
        iv: process.env.CRYPTO_IV,
        encryptedData: fieldValue,
      });
      return JSON.parse(decryptedData); // Retorna o objeto original depois de parseado
    }

    if (Array.isArray(fieldValue)) {
      fieldValue = fieldValue.map((item) => {
        if (item.encryptedProficiency) {
          item.proficiency = decryptData({
            iv: process.env.CRYPTO_IV,
            encryptedData: item.encryptedProficiency,
          });
        }
        return item;
      });
    }

    if (typeof fieldValue === "object" && !Array.isArray(fieldValue)) {
      Object.keys(fieldValue).forEach((key) => {
        fieldValue[key] = decryptField(`${fieldName}.${key}`, fieldValue[key]);
      });
    } else {
      const decryptedData = decryptData({
        iv: process.env.CRYPTO_IV,
        encryptedData: fieldValue,
      });
      return decryptedData; // Retorna o valor descriptografado
    }

    return fieldValue;
  }
  return null;
};

// Função para descriptografar múltiplos campos
const decryptMultipleFields = (fields) => {
  const decryptedFields = {};
  fields.forEach(({ name, value }) => {
    decryptedFields[name] = decryptField(name, value);
  });
  return decryptedFields;
};

// Validates a phone number using its prefix and number
const validatePhoneNumber = (phonePrefix, phoneNumber) => {
  try {
    const phone = parsePhoneNumberFromString(`${phonePrefix}${phoneNumber}`); // Parse phone number
    return phone && phone.isValid();
  } catch {
    return false;
  }
};

// Combine phone prefix and number into a single string
const getPhoneFinal = (phonePrefix, phoneNumber) => {
  return phonePrefix && phoneNumber ? `${phonePrefix}${phoneNumber}` : null;
};

// Retrieves the country and calling code from a phone number
const getCountryPrefix = (phonePrefix, phoneNumber) => {
  const phone = parsePhoneNumberFromString(`${phonePrefix}${phoneNumber}`);
  return phone ? `${phone.country} (${phone.countryCallingCode})` : null;
};

// Validates the provided languages by checking if they exist in the database
const validateLanguages = async (languages) => {
  const validLanguages = await Language.find({
    _id: { $in: languages.map((lang) => lang.language) },
  });
  return validLanguages.length === languages.length;
};

// Calculates the age based on birth date

const calculateAge = (birthDate) => {
  const currentDate = new Date(); // Get current date
  let age = currentDate.getFullYear() - birthDate.year;
  const monthDiff = currentDate.getMonth() + 1 - birthDate.month;
  const dayDiff = currentDate.getDate() - birthDate.day;
  // If birth month/day has not passed yet, subtract one year from age
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
};

// Export the functions from the handler for use in other files
module.exports = {
  hashPassword,
  verifyPassword,
  encryptData,
  decryptData,
  validatePhoneNumber,
  getPhoneFinal,
  getCountryPrefix,
  validateLanguages,
  calculateAge,
  encryptField,
  encryptMultipleFields,
  decryptMultipleFields,
  decryptField,
};
