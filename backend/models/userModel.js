const mongoose = require("mongoose");
const authService = require("../services/authService");
const validator = require("validator");
const cryptoHelper = require("../utils/cryptoHelper");

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
        return validator.isEmail(cryptoHelper.decrypt(v));
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
    validate: {
      validator: function (v) {
        const decrypted = cryptoHelper.decrypt(v);
        return ["client", "worker", "admin"].includes(decrypted);
      },
      message: "Invalid role",
    },
    default: cryptoHelper.encrypt("client"),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt sensitive data before saving to database
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    this.password = await authService.hashPassword(this.password);
  }

  if (this.isModified("username") || this.isNew) {
    this.username = cryptoHelper.encrypt(this.username);
  }

  if (this.isModified("email") || this.isNew) {
    this.email = cryptoHelper.encrypt(this.email);
  }

  if (this.isModified("role") || this.isNew) {
    if (!["client", "worker", "admin"].includes(this.role)) {
      return next(new Error("Invalid role"));
    }
    this.role = cryptoHelper.encrypt(this.role);
  }

  next();
});
// Hide sensitive data from response
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  delete user.email;
  delete user.username;
  return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
