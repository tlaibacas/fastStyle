const crypto = require("crypto");
require("dotenv").config();

const algorithm = "aes-256-cbc";
const secretKey = Buffer.from(process.env.SECRET_KEY, "hex");
const iv = Buffer.from(process.env.SECRET_IV, "hex");

// Function to encrypt data
function encrypt(text) {
  try {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  } catch (error) {
    throw new Error("Encryption failed: " + error.message);
  }
}
// Function to decrypt data
function decrypt(ciphertext) {
  try {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    let decrypted = decipher.update(ciphertext, "hex", "utf8");
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
