const jwtHelper = require("../utils/jwtHelper");
const User = require("../models/userModel");
const argon2 = require("argon2");
const crypto = require("crypto");
const { generateLookupHash } = require("../utils/cryptoHelper");

const login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // Generate hash from identifier
    const identifierHash = generateLookupHash(identifier);

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ emailHash: identifierHash }, { userHash: identifierHash }],
    });

    if (!user) {
      return res.status(401).json({
        message: "Authentication failed. Invalid username or password.",
      });
    }

    // Verify the password
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Authentication failed. Invalid username or password.",
      });
    }

    // Generate JWT token
    const token = await jwtHelper.generateToken(user._id);

    // Return token
    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  login,
};
