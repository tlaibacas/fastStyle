const mongoose = require("mongoose");
const cryptoHelper = require("../utils/cryptoHelper");
const passwordHelper = require("../utils/passwordHelper");
const crypto = require("crypto");
const validator = require("validator");

// Helper para gerar hash (lookup)
function generateLookupHash(text) {
  if (!process.env.HASH_KEY) throw new Error("HASH_KEY not set");
  return crypto
    .createHmac("sha256", process.env.HASH_KEY)
    .update(text)
    .digest("hex");
}

// Schema para campos criptografados
const EncryptedFieldSchema = new mongoose.Schema(
  {
    iv: { type: String, required: true },
    content: { type: String, required: true },
  },
  { _id: false }
); // Evita que seja criado um _id para o subdocumento

// Schema do usuário
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: EncryptedFieldSchema,
      unique: true,
      set: function (value) {
        // Se for uma string (ou seja, ainda não criptografado)
        if (typeof value === "string") {
          // Gera a hash do valor _plaintext_ para lookup
          this.usernameHash = generateLookupHash(value);
          // Retorna o valor criptografado
          return cryptoHelper.encrypt(value);
        }
        return value;
      },
    },
    email: {
      type: EncryptedFieldSchema,
      unique: true,
      set: function (value) {
        if (typeof value === "string") {
          if (!validator.isEmail(value)) {
            throw new Error("Formato de email inválido");
          }
          this.emailHash = generateLookupHash(value);
          return cryptoHelper.encrypt(value);
        }
        return value;
      },
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
      // Removemos o enum (pois o valor armazenado é o objeto criptografado)
      // e usamos o setter para validar e criptografar o valor.
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

// Virtuals para retornar os valores decriptados
UserSchema.virtual("decryptedUsername").get(function () {
  return cryptoHelper.decrypt(this.username);
});
UserSchema.virtual("decryptedEmail").get(function () {
  return cryptoHelper.decrypt(this.email);
});
UserSchema.virtual("decryptedRole").get(function () {
  return cryptoHelper.decrypt(this.role);
});

// Middleware pre-save para realizar o hash da senha
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
