const mongoose = require("mongoose");
const authService = require("../services/authService");
const validator = require("validator");
const cryptoHelper = require("../utils/cryptoHelper");

const roleEnum = ["client", "worker", "admin"];

const userSchema = new mongoose.Schema({
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
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return validator.isStrongPassword(v, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        });
      },
      message: (props) =>
        `${props.value} is not a valid password! Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.`,
    },
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

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    try {
      this.password = await authService.hashPassword(this.password);
      console.log("Password hashed:", this.password);
    } catch (err) {
      return next(err);
    }
  }

  if (this.isModified("username") || this.isNew) {
    try {
      const encryptedUsername = await cryptoHelper.encrypt(this.username);
      this.username = encryptedUsername.content;
      console.log("Username encrypted and saved:", this.username);
    } catch (err) {
      return next(err);
    }
  }

  if (this.isModified("email") || this.isNew) {
    try {
      const encryptedEmail = await cryptoHelper.encrypt(this.email);
      this.email = encryptedEmail.content;
      console.log("Email encrypted and saved:", this.email);
    } catch (err) {
      return next(err);
    }
  }

  if (this.isModified("role") || this.isNew) {
    try {
      const encryptedRole = await cryptoHelper.encrypt(this.role);
      this.role = encryptedRole.content;
      console.log("Role encrypted and saved:", this.role);
    } catch (err) {
      return next(err);
    }
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
