const argon2 = require("argon2");

module.exports = {
  async hashPassword(password) {
    try {
      const hash = await argon2.hash(password);
      return hash;
    } catch (error) {
      throw new Error("Error generating password hash: " + error.message);
    }
  },

  async verifyPassword(hash, password) {
    try {
      const isValid = await argon2.verify(hash, password);
      return isValid;
    } catch (error) {
      throw new Error("Error verifying password: " + error.message);
    }
  },
};
