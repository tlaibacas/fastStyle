const User = require("../models/userModel");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
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

    // Verifica se a senha foi fornecida
    if (!password) {
      return res.status(400).json({
        status: "fail",
        message: "Password is required",
      });
    }

    const newUser = new User(userData); // Cria o novo usuário com os dados fornecidos
    newUser.password = password; // Atribui a senha antes de salvar

    // Salva o usuário, o que acionará o hook 'pre-save' que realiza o hash da senha
    await newUser.save();

    // Retorna a resposta de sucesso com o usuário criado
    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        user: newUser, // Dados do usuário criado (já com a senha hashada)
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
