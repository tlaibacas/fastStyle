const jwtHelper = require("../utils/jwtHelper");
const User = require("../models/User");
const argon2 = require("argon2");

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Authentication failed. User not found." });
    }

    // Check if password matches
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Authentication failed. Wrong password." });
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
