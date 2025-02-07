// controllers/userController.js
const User = require("../models/userModel");
const { decrypt } = require("../utils/cryptoHelper");
const crypto = require("crypto");

const decryptField = (encryptedField) => {
  if (!encryptedField) return encryptedField;
  try {
    const parsed = JSON.parse(encryptedField);
    return decrypt(parsed);
  } catch (err) {
    return encryptedField;
  }
};

const getDeterministicHash = (text) => {
  const secret = process.env.HASH_SECRET || "default-secret";
  return crypto.createHmac("sha256", secret).update(text).digest("hex");
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().lean();

    // Mapeando os usuários para descriptografar os campos
    const decryptedUsers = users.map((user) => ({
      _id: user._id,
      username: decryptField(user.username), // Descriptografa o campo 'username' se necessário
      email: decryptField(user.encryptedEmail), // Descriptografa 'encryptedEmail' explicitamente
      role: decryptField(user.role), // Descriptografa o campo 'role' se necessário
      createdAt: user.createdAt,
    }));

    res.status(200).json({
      status: "success",
      results: decryptedUsers.length,
      users: decryptedUsers,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Error fetching users",
    });
  }
};

// Get a single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const decryptedUser = {
      _id: user._id,
      username: decryptField(user.username),
      email: decryptField(user.email),
      role: decryptField(user.role),
      createdAt: user.createdAt,
    };

    res.status(200).json({
      status: "success",
      user: decryptedUser,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Error fetching user",
    });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { email, username } = req.body;

    console.log("Creating user with email:", email, "and username:", username);

    const emailHash = getDeterministicHash(email);
    const usernameHash = getDeterministicHash(username);

    const existingUser = await User.findOne({
      $or: [{ emailHash }, { usernameHash }],
    });
    if (existingUser) {
      console.log("Email or username already exists:", existingUser);
      return res.status(400).json({
        status: "fail",
        message: "Email or username already exists",
      });
    }

    const newUser = await User.create(req.body);
    console.log("New user created:", newUser);
    res.status(201).json({
      status: "success",
      user: newUser,
    });
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
