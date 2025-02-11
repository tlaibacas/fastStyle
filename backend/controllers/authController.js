const jwtHelper = require("../utils/jwtHelper");
const User = require("../models/userModel");
const argon2 = require("argon2");
const { hashData } = require("../utils/cryptoHelper"); // Função para gerar o hash

const login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // Gerar hash do identificador (email ou username)
    const identifierHash = hashData(identifier);

    // Buscar usuário no banco pelo userHash ou emailHash
    const user = await User.findOne({
      $or: [{ emailHash: identifierHash }, { userHash: identifierHash }],
    });

    if (!user) {
      return res.status(401).json({
        message: "Authentication failed. Invalid username or password.",
      });
    }

    // Verificar a senha
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Authentication failed. Invalid username or password.",
      });
    }

    // Gerar token JWT
    const token = await jwtHelper.generateToken(user._id);

    // Retornar token
    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  login,
};
