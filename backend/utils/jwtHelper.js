const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.JWT_SECRET_KEY;

// Function to generate a JWT token
function generateToken(userId, role, expiresIn = "30d") {
  const payload = { userId, role };
  return jwt.sign(payload, secretKey, { expiresIn });
}

// Function to verify and decode a JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    throw new Error("Invalid token");
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
