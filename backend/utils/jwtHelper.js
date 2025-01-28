const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

const secretKey = process.env.JWT_SECRET_KEY;

// Function to generate a JWT token
async function generateToken(userId, expiresIn = "30d") {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const payload = {
      userId: user._id,
      username: user.username,
      role: user.role,
    };
    const token = jwt.sign(payload, secretKey, { expiresIn });
    console.log("Token generated:", token);
    return token;
  } catch (error) {
    throw new Error("Error generating token: " + error.message);
  }
}

// Function to verify and decode a JWT token
function verifyToken(token) {
  try {
    console.log("Verifying token:", token);
    const decoded = jwt.verify(token, secretKey);
    console.log("Token verified:", decoded);
    return decoded;
  } catch (error) {
    console.error("Invalid token:", error.message);
    throw new Error("Invalid token");
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
