const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const userRoutes = require("./routes/users");

const app = express();

// Trust proxy settings (for Nginx, AWS Load Balancer, etc.)
app.set("trust proxy", true);

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

// Connect to the database
connectDB();

// Routes
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;
