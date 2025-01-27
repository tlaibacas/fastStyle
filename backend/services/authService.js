const argon2 = require("argon2");

async function hashPassword(password) {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (err) {
    console.error("Error hashing password:", err);
    throw err;
  }
}

async function verifyPassword(hash, password) {
  try {
    const isMatch = await argon2.verify(hash, password);
    return isMatch;
  } catch (err) {
    console.error("Error verifying password:", err);
    throw err;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
};
