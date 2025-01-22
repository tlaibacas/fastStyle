const mongoose = require("mongoose");
const validator = require("validator");
const {
  hashPassword,
  encryptData,
  decryptData, // Added for decryption if needed
  validatePhoneNumber,
  getPhoneFinal,
  getCountryPrefix,
  validateLanguages,
  calculateAge,
  encryptField,
  encryptMultipleFields,
} = require("../handlers/handler");

const Schema = mongoose.Schema;
const sexEnum = ["male", "female", "other"];
const roleEnum = ["client", "worker", "admin"];
const proficienciesEnum = ["beginner", "intermediate", "advanced", "native"];
const servicesEnum = [
  "client",
  "nospecial",
  "hair",
  "nails",
  "massages",
  "tattoos",
  "esthetician",
  "waxing",
  "facial_cleansing",
  "eyebrows",
  "eyelashes",
  "makeup",
  "podiatry",
  "tanning",
  "spa",
  "peeling",
  "lymphatic_drainage",
  "laser_hair_removal",
  "barber",
  "micropigmentation",
  "facial_harmonization",
  "hair_treatment",
  "skincare",
  "home_haircut",
  "home_manicure",
  "home_pedicure",
  "home_makeup",
  "home_massage",
  "home_facial_treatment",
  "home_waxing",
  "home_eyelash_extension",
  "home_hair_coloring",
];
// Services enumeration (to be defined)

// Language proficiency schema for languages field
const languageProficiencySchema = new Schema(
  {
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
      required: true,
    },
    proficiency: {
      type: String,
      enum: proficienciesEnum,
      default: "beginner",
    },
  },
  { _id: false }
);

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
    required: false, // This will now be stored in the database (combined phone)
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
    type: String,
    default: 0,
  },
  rank: {
    type: String,
    default: 0,
  },
  sex: {
    type: String,
    enum: sexEnum,
    required: true,
  },
  birthDate: {
    day: { type: String, required: true },
    month: { type: String, required: true },
    year: { type: String, required: true },
  },
  age: { type: String, required: false }, // Age will be calculated
  serviceSpecialist: {
    type: [String],
    enum: servicesEnum, // Services that the user specializes in
    default: ["client", "nospecial"],
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
  console.log("Pre-save hook triggered");

  // Calculate phoneFinal if phonePrefix and phoneNumber are present
  if (this.phonePrefix && this.phoneNumber) {
    this.phoneFinal = getPhoneFinal(this.phonePrefix, this.phoneNumber);
    console.log("phoneFinal calculated:", this.phoneFinal);
  }
  // Calculate age if birthDate is modified or new
  if (this.isModified("birthDate") || this.isNew) {
    this.age = calculateAge(this.birthDate);
    console.log("Age calculated:", this.age);
  }
  // Crypto operations
  const encryptedFields = encryptMultipleFields([
    { name: "phoneNumber", value: this.phoneNumber },
    { name: "phonePrefix", value: this.phonePrefix },
    { name: "phoneFinal", value: this.phoneFinal },
    { name: "email", value: this.email },
    { name: "firstName", value: this.firstName },
    { name: "lastName", value: this.lastName },
    { name: "sex", value: this.sex },
    { name: "role", value: this.role },
    { name: "serviceSpecialist", value: this.serviceSpecialist },
    { name: "birthDate", value: this.birthDate },
    { name: "age", value: this.age },
    { name: "serviceRate", value: this.serviceRate },
    { name: "rank", value: this.rank },
    { name: "languages", value: this.languages },
    { name: "username", value: this.username },
    { name: "countryPrefix", value: this.countryPrefix },
  ]);

  // Update fields with encrypted data
  Object.keys(encryptedFields).forEach((field) => {
    if (encryptedFields[field]) {
      this[field] = encryptedFields[field];
    }
  });
  // Hash password if modified or new
  if (this.isModified("password") || this.isNew) {
    console.log("Hashing password...");
    try {
      const hashedPassword = await hashPassword(this.password);
      this.password = hashedPassword;
      console.log("Hashed password:", this.password);
    } catch (err) {
      return next(err);
    }
  }

  next();
});

userSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    console.log(ret);
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
      phoneFinal: ret.phoneFinal,
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
  virtuals: true,
});

userSchema
  .path("languages")
  .validate(validateLanguages, "One or more languages are invalid");

const User = mongoose.model("User", userSchema);

module.exports = User;
