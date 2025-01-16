const express = require("express");

const router = express.Router();

// GET endpoint
router.get("/", (req, res) => {
  console.log("Server awakening...");
  res.send("Server is up and running.");
});

module.exports = router;
