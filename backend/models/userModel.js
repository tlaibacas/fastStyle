const mongoose = require("mongoose");
const cryptoHelper = require("../utils/cryptoHelper");
const passwordHelper = require("../utils/passwordHelper");
const crypto = require("crypto");
const validator = require("validator");
const { generateLookupHash } = require("../utils/cryptoHelper");

// Schema for encrypted fields
const EncryptedFieldSchema = new mongoose.Schema(
  {
    iv: { type: String, required: true },
    content: { type: String, required: true },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: EncryptedFieldSchema,
      unique: true,
      set: function (value) {
        if (typeof value === "string") {
          this.usernameHash = generateLookupHash(value);

          return cryptoHelper.encrypt(value);
        }
        return value;
      },
    },
    email: {
      unique: true,
      set: function (value) {
        if (typeof value === "string") {
          if (!validator.isEmail(value)) {
            throw new Error("Invalid email format");
          }
          this.emailHash = generateLookupHash(value);
          return cryptoHelper.encrypt(value);
        }
        return value;
      },
      type: EncryptedFieldSchema,
    },
    usernameHash: {
      type: String,
      unique: true,
      required: true,
    },
    emailHash: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: validator.isStrongPassword,
        message:
          "PASSWORD_TOO_WEAK: Password must have at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol",
      },
    },
    role: {
      type: EncryptedFieldSchema,

      default: function () {
        return cryptoHelper.encrypt("client");
      },
      set: function (value) {
        if (typeof value === "string") {
          if (!["client", "worker", "admin"].includes(value)) {
            throw new Error("Invalid role");
          }
          return cryptoHelper.encrypt(value);
        }
        return value;
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        delete ret.usernameHash;
        delete ret.emailHash;
        return ret;
      },
    },
  }
);

// Virtuals to get decrypted values
UserSchema.virtual("decryptedUsername").get(function () {
  return cryptoHelper.decrypt(this.username);
});
UserSchema.virtual("decryptedEmail").get(function () {
  return cryptoHelper.decrypt(this.email);
});
UserSchema.virtual("decryptedRole").get(function () {
  return cryptoHelper.decrypt(this.role);
});

UserSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await passwordHelper.hashPassword(this.password);
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", UserSchema);
