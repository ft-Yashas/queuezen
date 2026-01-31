const express = require("express");
const router = express.Router();
const queueService = require("../services/queueService");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * Join queue (PUBLIC)
 */
router.post("/join", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const token = await queueService.joinQueue(name);

    const io = req.app.get("io");
    io.emit("queueUpdated", await queueService.getQueue());

    res.json({
      message: "Joined queue successfully",
      token,
    });
  } catch (error) {
    console.error("JOIN QUEUE ERROR:", error);
    res.status(500).json({ error: "Failed to join queue" });
  }
});

/**
 * Get full queue (PUBLIC)
 */
router.get("/", async (req, res) => {
  const queue = await queueService.getQueue();
  res.json(queue);
});

/**
 * Call next token (ADMIN)
 */
router.post("/next", authMiddleware, async (req, res) => {
  try {
    const token = await queueService.callNextToken();

    const io = req.app.get("io");
    io.emit("queueUpdated", await queueService.getQueue());

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Skip current token (ADMIN)
 */
router.post("/skip", authMiddleware, async (req, res) => {
  try {
    const token = await queueService.skipCurrentToken();

    const io = req.app.get("io");
    io.emit("queueUpdated", await queueService.getQueue());

    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Clear queue (ADMIN)
 */
router.delete("/clear", authMiddleware, async (req, res) => {
  await queueService.clearQueue();

  const io = req.app.get("io");
  io.emit("queueUpdated", []);

  res.json({ message: "Queue cleared successfully" });
});

module.exports = router;
