const crypto = require("crypto");
require("dotenv").config();

const algorithm = "aes-256-cbc";
const secretKey = Buffer.from(process.env.SECRET_KEY, "hex");
const iv = Buffer.from(process.env.SECRET_IV, "hex");

function encrypt(text) {
  try {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    console.log("ecrypting", text, "to", encrypted);
    return {
      iv: iv.toString("hex"),
      content: encrypted,
    };
  } catch (error) {
    throw new Error("Encryption failed: " + error.message);
  }
}

function decrypt(hash) {
  try {
    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      Buffer.from(hash.iv, "hex")
    );
    let decrypted = decipher.update(hash.content, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error("Decryption failed: " + error.message);
  }
}

module.exports = {
  encrypt,
  decrypt,
};
