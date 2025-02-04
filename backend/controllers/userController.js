const User = require("../models/userModel");
const { decrypt } = require("../utils/cryptoHelper");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().lean();

    const decryptedUsers = users.map((user) => ({
      _id: user._id,
      username: cryptoHelper.decrypt(user.username),
      email: cryptoHelper.decrypt(user.email),
      role: cryptoHelper.decrypt(user.role),
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
      username: cryptoHelper.decrypt(user.username),
      email: cryptoHelper.decrypt(user.email),
      role: cryptoHelper.decrypt(user.role),
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

    // Check if email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Email or username already exists",
      });
    }

    const newUser = await User.create(req.body);
    res.status(201).json({
      status: "success",

      user: newUser,
    });
  } catch (err) {
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
