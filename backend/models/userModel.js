const mongoose = require("mongoose");
const validator = require("validator");
const {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} = require("libphonenumber-js");

const Schema = mongoose.Schema;
const sexEnum = ["male", "female", "other"];
const roleEnum = ["client", "worker", "admin"];
const servicesEnum = [];

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
      validator: validator.isEmail,
      message: "Invalid email format",
    },
  },
  password: {
    type: String,
    required: true,
    validate: [
      {
        validator: function (v) {
          return v.length >= 8;
        },
        message: "Password must be at least 8 characters long",
      },
      {
        validator: function (v) {
          return /[A-Z]/.test(v);
        },
        message: "Password must contain at least one uppercase letter",
      },
      {
        validator: function (v) {
          return /[!@#$%^&*(),.?":{}|<>]/.test(v);
        },
        message: "Password must contain at least one special character",
      },
    ],
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
});

const User = mongoose.model("User", userSchema);

module.exports = User;
