// cryptoHelper.js
const crypto = require("crypto");
require("dotenv").config();

const algorithm = "aes-256-cbc";
const secretKey = Buffer.from(process.env.SECRET_KEY, "hex");

// Function to generate lookup hash
function generateLookupHash(text) {
  if (!process.env.HASH_KEY) throw new Error("HASH_KEY not set");
  return crypto
    .createHmac("sha256", process.env.HASH_KEY)
    .update(text)
    .digest("hex");
}

// Encrypt/decrypt functions
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { iv: iv.toString("hex"), content: encrypted };
}

function decrypt(encryptedData) {
  const iv = Buffer.from(encryptedData.iv, "hex");
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encryptedData.content, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Export all functions together
module.exports = {
  generateLookupHash,
  encrypt,
  decrypt,
};
