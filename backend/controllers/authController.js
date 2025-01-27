const jwtHelper = require("../utils/jwtHelper");
const User = require("../models/userModel");
const argon2 = require("argon2");

const login = async (req, res) => {
  const { identifier, password } = req.body; // Changed from email to identifier

  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) {
      return res
        .status(401)
        .json({
          message: "Authentication failed. Invalid username or password.",
        });
    }

    // Check if password matches
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return res
        .status(401)
        .json({
          message: "Authentication failed. Invalid username or password.",
        });
    }

    // Generate token
    const token = jwtHelper.generateToken(user);

    // Respond with token
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  login,
};
