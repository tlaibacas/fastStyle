const express = require("express");
const cors = require("cors");
const requestRoutes = require("./routes/requestRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/requests", requestRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;
