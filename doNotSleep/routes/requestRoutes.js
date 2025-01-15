const express = require("express");

const router = express.Router();

// GET endpoint
router.get("/", (req, res) => {
  console.log("GET /requests endpoint was accessed.");
  res.send("GET request received. Check the terminal for more details.");
});

module.exports = router;
