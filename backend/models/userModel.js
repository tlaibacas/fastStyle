const mongoose = require("mongoose");
const cryptoHelper = require("../utils/cryptoHelper");
const passwordHelper = require("../utils/passwordHelper");
const crypto = require("crypto");
const validator = require("validator");

// Function to generate a deterministic hash (used to ensure uniqueness)
function getDeterministicHash(text) {
  const secret = process.env.HASH_SECRET || "default-secret";
  return crypto.createHmac("sha256", secret).update(text).digest("hex");
}

const UserSchema = new mongoose.Schema(
  {
    // Username field
    username: {
      type: String,
      required: [true, "Username is required"],
      set: function (username) {
        if (!username) return username;
        this.usernameHash = getDeterministicHash(username);
        const encrypted = cryptoHelper.encrypt(username);
        return JSON.stringify(encrypted);
      },
      get: function (encryptedValue) {
        if (!encryptedValue) return encryptedValue;
        try {
          const parsed = JSON.parse(encryptedValue);
          return cryptoHelper.decrypt(parsed);
        } catch (error) {
          return encryptedValue;
        }
      },
    },
    usernameHash: {
      type: String,
      unique: true,
      required: true,
    },

    // Encrypted email field (this replaces `email`)
    encryptedEmail: {
      type: String,
      required: [true, "Encrypted email is required"],
    },

    // Hash for lookup
    emailHash: {
      type: String,
      unique: true,
      required: [true, "Email hash is required"],
    },

    // Password field
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (password) {
          return validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message: (props) => `${props.value} is not a valid password!`,
      },
    },

    // Role field
    role: {
      type: String,
      required: true,
      set: function (role) {
        if (!role) return role;
        const encrypted = cryptoHelper.encrypt(role);
        return JSON.stringify(encrypted);
      },
      get: function (encryptedValue) {
        if (!encryptedValue) return encryptedValue;
        try {
          const parsed = JSON.parse(encryptedValue);
          return cryptoHelper.decrypt(parsed);
        } catch (error) {
          return encryptedValue;
        }
      },
    },
  },
  {
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// 🔹 Virtual field to handle email (not stored in DB)
UserSchema.virtual("email")
  .get(function () {
    try {
      const parsed = JSON.parse(this.encryptedEmail);
      return cryptoHelper.decrypt(parsed);
    } catch (error) {
      return this.encryptedEmail;
    }
  })
  .set(function (email) {
    if (!validator.isEmail(email)) {
      throw new mongoose.Error.ValidationError(
        new mongoose.Error.ValidatorError({
          message: `${email} is not a valid email address!`,
          path: "email",
          value: email,
        })
      );
    }
    this.emailHash = getDeterministicHash(email);
    this.encryptedEmail = JSON.stringify(cryptoHelper.encrypt(email));
  });

// 🔹 Encrypt password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await passwordHelper.hashPassword(this.password);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
