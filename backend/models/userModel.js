const mongoose = require("mongoose");
const authService = require("../services/authService");
const validator = require("validator");

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    try {
      this.password = await authService.hashPassword(this.password);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
