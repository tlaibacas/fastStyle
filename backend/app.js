const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const userRoutes = require("./routes/users");
require("./handlers/handler");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));
// Connect to database
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;
