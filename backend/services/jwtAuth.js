const { verifyToken } = require("./jwtHelper");

const jwtAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("Token not provided.");
    return res.status(401).json({ message: "Token not provided." });
  }

  try {
    const decoded = verifyToken(token);
    req.user = { userId: decoded.userId };
    console.log("Token successfully verified. User ID:", decoded.userId);
    next();
  } catch (error) {
    console.log("Invalid or expired token.");
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = jwtAuth;
