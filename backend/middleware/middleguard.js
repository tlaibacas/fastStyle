// middleware/middleguard.js
const User = require("../models/userModel");
const cryptoHelper = require("../utils/cryptoHelper");

const middleguard = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId).select("+role");

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const decryptedRole = cryptoHelper.decrypt(user.role);

      if (!allowedRoles.includes(decryptedRole)) {
        return res.status(403).json({
          message: "Access denied. Insufficient permissions.",
        });
      }

      next();
    } catch (error) {
      console.error("Middleguard error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };
};

module.exports = middleguard;
