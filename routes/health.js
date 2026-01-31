const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Intelligent Queue System Backend is healthy 🚀",
  });
});

module.exports = router;
