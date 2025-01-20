const express = require("express");

const router = express.Router();

// GET endpoint
router.get("/", (req, res) => {
  const clientIp = req.ip; // Obtém o IP diretamente do objeto req
  console.log("Client IP:", clientIp);

  // Se houver proxy reverso, use o cabeçalho 'x-forwarded-for'
  const forwardedIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  console.log("Forwarded IP:", forwardedIp);

  console.log("Server awakening...");
  res.send("Server is up and running.");
});

module.exports = router;
