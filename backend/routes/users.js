const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

// Get all users
router.get("/get", userController.getAllUsers);

// Get a single user by ID
router.get("/:id", userController.getUserById);

// Create a new user
router.post("/register", userController.createUser);

// Update a user by ID
router.put("/:id", userController.updateUser);

// Delete a user by ID
router.delete("/:id", userController.deleteUser);

module.exports = router;
