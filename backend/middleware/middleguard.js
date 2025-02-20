const User = require("../models/userModel");
const cryptoHelper = require("../utils/cryptoHelper");

const middleguard = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Fetch the user from the database
      const user = await User.findById(req.user.userId).select("+role");

      if (!user) {
        console.log("User not found.");
        return res.status(404).json({ message: "User not found." });
      }

      // Decrypt the role
      const decryptedRole = cryptoHelper.decrypt(user.role);

      // Check if the role is among the allowed roles
      if (!allowedRoles.includes(decryptedRole)) {
        console.log("Access denied. Insufficient permissions.");
        return res.status(403).json({
          message: "Access denied. Insufficient permissions.",
        });
      }

      // Allow access
      next();
    } catch (error) {
      console.error("Middleguard error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };
};

module.exports = middleguard;
