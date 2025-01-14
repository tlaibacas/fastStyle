const mongoose = require("mongoose");
const validator = require("validator");
const {
  validatePhoneNumber,
  getPhoneFinal,
  getCountryPrefix,
  validateLanguages,
} = require("../handlers/handler"); // Import the handler

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
        return validatePhoneNumber(v, this.phoneNumber);
      },
      message: "Invalid phone prefix",
    },
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return validatePhoneNumber(this.phonePrefix, v);
      },
      message: "Invalid phone number",
    },
  },
  phoneFinal: {
    type: String,
    get: function () {
      return getPhoneFinal(this.phonePrefix, this.phoneNumber);
    },
  },
  countryPrefix: {
    type: String,
    required: function () {
      return this.phonePrefix && this.phoneNumber;
    },
    default: function () {
      return getCountryPrefix(this.phonePrefix, this.phoneNumber);
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
  languages: [languageProficiencySchema],
});

// Custom validation to ensure the language is part of the predefined list
userSchema
  .path("languages")
  .validate(validateLanguages, "One or more languages are invalid");

const User = mongoose.model("User", userSchema);

module.exports = User;
