const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.JWT_SECRET_KEY;

// Function to generate a JWT token
function generateToken(payload, expiresIn = "30d") {
  try {
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid payload.");
    }

    if (!secretKey) {
      throw new Error("JWT secret key not defined.");
    }

    const token = jwt.sign(payload, secretKey, { expiresIn });
    return token;
  } catch (error) {
    throw new Error("Error generating token: " + error.message);
  }
}

// Function to verify and decode a JWT token
function verifyToken(token) {
  try {
    if (!token || typeof token !== "string") {
      throw new Error("Invalid token.");
    }

    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token: " + error.message);
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
