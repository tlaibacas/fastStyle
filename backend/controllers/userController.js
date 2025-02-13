const User = require("../models/userModel");
const { decrypt } = require("../utils/cryptoHelper");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -__v").lean();

    res.status(200).json({
      status: "success",
      results: users.length,
      users: users.map((user) => ({
        _id: user._id,
        username: decrypt(user.username),
        email: decrypt(user.email),
        role: decrypt(user.role),
        createdAt: user.createdAt,
      })),
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Error fetching users",
    });
  }
};

// Create user
const { generateLookupHash } = require("../utils/cryptoHelper");

exports.createUser = async (req, res) => {
  try {
    const { email, username, password, role } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email, username and password are required",
      });
    }

    // Gera os hashes para busca
    const emailHash = generateLookupHash(email);
    const usernameHash = generateLookupHash(username);

    // Verifica se o email já existe
    const existingEmail = await User.findOne({ emailHash });
    if (existingEmail) {
      return res.status(400).json({
        status: "fail",
        message: "Email already exists",
      });
    }

    // Verifica se o username já existe
    const existingUsername = await User.findOne({ usernameHash });
    if (existingUsername) {
      return res.status(400).json({
        status: "fail",
        message: "Username already exists",
      });
    }

    // Cria o novo usuário
    const newUser = await User.create({
      emailHash,
      usernameHash,
      password,
      role: role || "client",
    });

    res.status(201).json({
      status: "success",
      data: {
        _id: newUser._id,
        username: newUser.decryptedUsername,
        email: newUser.decryptedEmail,
        role: newUser.decryptedRole,
      },
    });
  } catch (err) {
    console.error("Error creating user:", err);

    if (err.name === "ValidationError") {
      let firstError = Object.values(err.errors)[0];

      return res.status(400).json({
        status: "fail",
        message: firstError.reason?.message || firstError.message,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (req.body.email) user.email = req.body.email;
    if (req.body.username) user.username = req.body.username;
    if (req.body.role) user.role = req.body.role;
    if (req.body.password) user.password = req.body.password;

    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        _id: user._id,
        username: user.decryptedUsername,
        email: user.decryptedEmail,
        role: user.decryptedRole,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -__v")
      .lean();

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        _id: user._id,
        username: user.decryptedUsername,
        email: user.decryptedEmail,
        role: user.decryptedRole,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Error fetching user",
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
