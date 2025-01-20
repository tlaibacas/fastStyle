const express = require("express");
const requestRoutes = require("./routes/requestRoutes");
const cors = require("cors");
require("./handlers/handler");

const app = express();

// Trust proxy settings (for Nginx, AWS Load Balancer, etc.)
app.set("trust proxy", true);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/requests", requestRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;
