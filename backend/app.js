const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const userRoutes = require("./routes/users");
const loginRoutes = require("./routes/authRoutes");

const app = express();
const upload = multer();

// Trust proxy settings (for Nginx, AWS Load Balancer, etc.)
app.set("trust proxy", true);

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.any());
app.use(cors());
app.use(morgan("dev"));

// Connect to the database
connectDB();

// Routes
app.use("/auth", loginRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the backend!" });
});

module.exports = app;
