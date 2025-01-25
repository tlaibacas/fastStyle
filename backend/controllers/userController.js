const User = require("../models/userModel");
const { decryptField } = require("../handlers/handler");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().lean();

    // Decriptografar todos os campos para cada usuário
    const decryptedUsers = users.map((user) => ({
      ...user,
      phoneNumber: decryptField("phoneNumber", user.phoneNumber),
      phonePrefix: decryptField("phonePrefix", user.phonePrefix),
      phoneFinal: decryptField("phoneFinal", user.phoneFinal),
      email: decryptField("email", user.email),
      firstName: decryptField("firstName", user.firstName),
      lastName: decryptField("lastName", user.lastName),
      sex: decryptField("sex", user.sex),
      role: decryptField("role", user.role),
      serviceSpecialist: user.serviceSpecialist
        ? user.serviceSpecialist.map((specialist) =>
            decryptField("serviceSpecialist", specialist)
          )
        : [],
      birthDate: user.birthDate
        ? {
            day: decryptField("birthDate.day", user.birthDate.day),
            month: decryptField("birthDate.month", user.birthDate.month),
            year: decryptField("birthDate.year", user.birthDate.year),
          }
        : { day: "", month: "", year: "" },
      age: decryptField("age", user.age),
      serviceRate: decryptField("serviceRate", user.serviceRate),
      rank: decryptField("rank", user.rank),
      languages: user.languages
        ? user.languages.map((lang) => ({
            language: lang.language,
            proficiency: decryptField(
              "languages.proficiency",
              lang.proficiency
            ),
          }))
        : [],
      username: decryptField("username", user.username),
      countryPrefix: decryptField("countryPrefix", user.countryPrefix),
    }));

    res.status(200).json({
      status: "success",
      results: decryptedUsers.length,
      data: {
        users: decryptedUsers,
      },
    });
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Get a single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
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

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { password, ...userData } = req.body;

    if (!password) {
      return res.status(400).json({
        status: "fail",
        message: "Password is required",
      });
    }

    const newUser = new User(userData);
    newUser.password = password;

    await newUser.save();

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        user: newUser,
      },
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
