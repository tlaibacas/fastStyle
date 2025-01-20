const mongoose = require("mongoose");
const validator = require("validator");
const {
  hashPassword,
  encryptData,
  decryptData,
  validatePhoneNumber,
  getPhoneFinal,
  getCountryPrefix,
  validateLanguages,
  calculateAge,
} = require("../handlers/handler");

const Schema = mongoose.Schema;
const sexEnum = ["male", "female", "other"];
const roleEnum = ["client", "worker", "admin"];
const proficienciesEnum = ["beginner", "intermediate", "advanced", "native"];
const servicesEnum = []; // Services enumeration (to be defined)

// Language proficiency schema for languages field
const languageProficiencySchema = new Schema({
  language: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Language", // Reference to the Language model
    required: true,
  },
  proficiency: {
    type: String,
    enum: proficienciesEnum,
    default: "beginner", // Default value
  },
});

// Main user schema
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
        return validatePhoneNumber(v, this.phoneNumber); // Validate phone number prefix
      },
      message: "Invalid phone prefix",
    },
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return validatePhoneNumber(this.phonePrefix, v); // Validate phone number
      },
      message: "Invalid phone number",
    },
  },
  phoneFinal: {
    type: String,
    required: false, // This will now be stored in the database
  },
  countryPrefix: {
    type: String,
    required: function () {
      return this.phonePrefix && this.phoneNumber;
    },
    default: function () {
      return getCountryPrefix(this.phonePrefix, this.phoneNumber); // Get country prefix based on phone number
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
    day: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  age: { type: Number, required: false }, // Age will be calculated
  serviceSpecialist: {
    type: String,
    enum: servicesEnum, // Services that the user specializes in
  },
  role: {
    type: String,
    enum: roleEnum,
    default: "client", // Default role is 'client'
  },
  createdAt: { type: Date, default: Date.now },
  languages: [languageProficiencySchema], // Array of languages with proficiency levels
});

// Pre-save hook to calculate and store phoneFinal, hash password, encrypt phone number, and calculate age
userSchema.pre("save", async function (next) {
  // Calculate phoneFinal before saving
  if (this.phonePrefix && this.phoneNumber) {
    this.phoneFinal = getPhoneFinal(this.phonePrefix, this.phoneNumber); // Combine phone prefix and number
  }

  if (this.isModified("password") || this.isNew) {
    try {
      this.password = await hashPassword(this.password); // Hash the password before saving
    } catch (err) {
      return next(err); // Handle errors in password hashing
    }
  }

  if (this.isModified("phoneNumber") || this.isNew) {
    const encrypted = encryptData(this.phoneNumber); // Encrypt phone number before saving
    this.encryptedPhoneNumber = encrypted.encryptedData;
  }

  if (this.isModified("birthDate") || this.isNew) {
    this.age = calculateAge(this.birthDate); // Calculate age based on birth date
  }

  next(); // Proceed with saving the document
});

// Virtual JSON transformation for custom output (e.g., exclude password)
userSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    return {
      id: ret._id,
      username: ret.username,
      email: ret.email,
      password: ret.password,
      firstName: ret.firstName,
      lastName: ret.lastName,
      birthDate: ret.birthDate,
      age: ret.age,
      phonePrefix: ret.phonePrefix,
      phoneNumber: ret.phoneNumber,
      phoneFinal: ret.phoneFinal, // This will be saved now, not calculated
      countryPrefix: ret.countryPrefix,
      role: ret.role,
      serviceRate: ret.serviceRate,
      rank: ret.rank,
      sex: ret.sex,
      serviceSpecialist: ret.serviceSpecialist,
      createdAt: ret.createdAt,
      languages: ret.languages,
    };
  },
  virtuals: true, // Ensure virtual fields are included in the output
});

// Validate languages before saving
userSchema
  .path("languages")
  .validate(validateLanguages, "One or more languages are invalid");

const User = mongoose.model("User", userSchema);

module.exports = User;
