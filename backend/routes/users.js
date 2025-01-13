const express = require("express");

const router = express.Router();

// Get all users
router.get("/", (req, res) => {
  res.send("Get all users");
});

// Get a single user by ID
router.get("/:id", (req, res) => {
  res.send(`Get user with ID ${req.params.id}`);
});

// Create a new user
router.post("/", (req, res) => {
  res.send("Create a new user");
});

// Update a user by ID
router.put("/:id", (req, res) => {
  res.send(`Update user with ID ${req.params.id}`);
});

// Delete a user by ID
router.delete("/:id", (req, res) => {
  res.send(`Delete user with ID ${req.params.id}`);
});

module.exports = router;
