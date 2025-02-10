//passwordHelper.js
const argon2 = require("argon2");

module.exports = {
  async hashPassword(password) {
    try {
      const hash = await argon2.hash(password);
      return hash;
    } catch (error) {
      throw new Error("Erro ao gerar hash da senha: " + error.message);
    }
  },

  async verifyPassword(hash, password) {
    try {
      const isValid = await argon2.verify(hash, password);
      return isValid;
    } catch (error) {
      throw new Error("Erro ao verificar a senha: " + error.message);
    }
  },
};
