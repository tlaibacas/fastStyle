const mongoose = require("mongoose");
const validator = require("validator");
const {
  validatePhoneNumber,
  getPhoneFinal,
  getCountryPrefix,
  validateLanguages,
  calculateAge,
} = require("../handlers/handler");

const Schema = mongoose.Schema;
const sexEnum = ["male", "female", "other"];
const roleEnum = ["client", "worker", "admin"];
const servicesEnum = [];

// Language proficiency schema
const languageProficiencySchema = new Schema({
  language: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Language", // Reference to Language model
    required: true,
  },
  proficiency: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "native"],
    default: "beginner",
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
  age: {
    type: Number, // Age field to store calculated age
    required: false, // This will be set in pre-save hook
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

// Pre-save hook to calculate age
userSchema.pre("save", function (next) {
  if (this.isModified("birthDate") || this.isNew) {
    const age = calculateAge(this.birthDate);
    this.age = age;
  }
  next();
});

// Include virtuals in JSON output
userSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    return {
      username: ret.username,
      email: ret.email,
      birthDate: ret.birthDate,
      age: ret.age,
      phonePrefix: ret.phonePrefix,
      phoneNumber: ret.phoneNumber,
      countryPrefix: ret.countryPrefix,
      role: ret.role,
      serviceRate: ret.serviceRate,
      rank: ret.rank,
      sex: ret.sex,
      createdAt: ret.createdAt,
      languages: ret.languages,
    };
  },
  virtuals: true,
});

// Validate languages
userSchema
  .path("languages")
  .validate(validateLanguages, "One or more languages are invalid");

const User = mongoose.model("User", userSchema);

module.exports = User;
