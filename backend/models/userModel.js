const mongoose = require("mongoose");
const validator = require("validator");
const {
  parsePhoneNumberFromString,
  isValidPhoneNumber,
} = require("libphonenumber-js");
const Language = require("./Language"); // Import the Language model

const Schema = mongoose.Schema;
const sexEnum = ["male", "female", "other"];
const roleEnum = ["client", "worker", "admin"];
const servicesEnum = [];

// Add language proficiency object schema
const languageProficiencySchema = new Schema({
  language: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Language", // Reference to Language model
    required: true,
  },
  proficiency: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "native"],
    default: "beginner", // Default proficiency level
  },
});

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        return validator.isEmail(v);
      },
      message: "Invalid email format",
    },
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phonePrefix: {
    type: String,
    required: function () {
      return this.phoneNumber != null;
    },
    validate: {
      validator: function (v) {
        try {
          const phoneNumber = parsePhoneNumberFromString(
            `${v}${this.phoneNumber}`
          );
          return phoneNumber && phoneNumber.isValid();
        } catch (e) {
          return false;
        }
      },
      message: "Invalid phone prefix",
    },
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return isValidPhoneNumber(`${this.phonePrefix}${v}`);
      },
      message: "Invalid phone number",
    },
  },
  phoneFinal: {
    type: String,
    required: function () {
      return this.phoneNumber != null && this.phonePrefix != null;
    },
    get: function () {
      return `${this.phonePrefix}${this.phoneNumber}`;
    },
  },
  country: {
    type: String,
    required: function () {
      return this.phonePrefix && this.phoneNumber;
    },
    default: function () {
      const phoneNumber = parsePhoneNumberFromString(
        `${this.phonePrefix}${this.phoneNumber}`
      );
      return phoneNumber ? phoneNumber.country : null;
    },
  },
  serviceRate: {
    type: Number,
    default: 0,
  },
  rank: {
    type: Number,
    default: 0,
  },
  sex: {
    type: String,
    enum: sexEnum,
    required: true,
  },
  birthDate: {
    day: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  serviceSpecialist: {
    type: String,
    enum: servicesEnum,
  },
  role: {
    type: String,
    enum: roleEnum,
    default: "client",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Adding languages field for spoken languages
  languages: [languageProficiencySchema], // Array of language objects with proficiency
});

// Custom validation to ensure the language is part of the predefined list
userSchema.path("languages").validate(async function (languages) {
  const validLanguages = await Language.find({
    _id: { $in: languages.map((lang) => lang.language) },
  });
  return validLanguages.length === languages.length;
}, "One or more languages are invalid");

const User = mongoose.model("User", userSchema);

module.exports = User;
