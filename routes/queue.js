const express = require("express");
const router = express.Router();
const Token = require("../models/Token");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * Join Queue (PUBLIC)
 */
router.post("/join", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const lastToken = await Token.findOne().sort({ tokenNumber: -1 });
    const nextTokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    const token = new Token({
      name,
      tokenNumber: nextTokenNumber,
      status: "waiting",
    });

    await token.save();

    const io = req.app.get("io");
    io.emit("queueUpdated", await Token.find().sort({ tokenNumber: 1 }));

    res.json({ message: "Joined queue", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to join queue" });
  }
});

/**
 * Get Queue (PUBLIC)
 */
router.get("/", async (req, res) => {
  const queue = await Token.find().sort({ tokenNumber: 1 });
  res.json(queue);
});

/**
 * Call Next Token (ADMIN)
 */
router.post("/next", authMiddleware, async (req, res) => {
  const currentServing = await Token.findOne({ status: "serving" });
  if (currentServing) {
    currentServing.status = "completed";
    await currentServing.save();
  }

  const nextWaiting = await Token.findOne({ status: "waiting" }).sort({
    tokenNumber: 1,
  });

  if (!nextWaiting) return res.json({ message: "No waiting tokens" });

  nextWaiting.status = "serving";
  await nextWaiting.save();

  const io = req.app.get("io");
  io.emit("queueUpdated", await Token.find().sort({ tokenNumber: 1 }));

  res.json(nextWaiting);
});

/**
 * Skip Current Token (ADMIN)
 */
router.post("/skip", authMiddleware, async (req, res) => {
  const currentServing = await Token.findOne({ status: "serving" });
  if (!currentServing) {
    return res.status(400).json({ error: "No serving token" });
  }

  currentServing.status = "skipped";
  await currentServing.save();

  const io = req.app.get("io");
  io.emit("queueUpdated", await Token.find().sort({ tokenNumber: 1 }));

  res.json(currentServing);
});

/**
 * Clear Queue (ADMIN)
 */
router.delete("/clear", authMiddleware, async (req, res) => {
  await Token.deleteMany({});
  const io = req.app.get("io");
  io.emit("queueUpdated", []);
  res.json({ message: "Queue cleared" });
});

/**
 * Queue Stats (ADMIN)
 */
router.get("/stats", authMiddleware, async (req, res) => {
  const total = await Token.countDocuments();
  const waiting = await Token.countDocuments({ status: "waiting" });
  const serving = await Token.countDocuments({ status: "serving" });
  const completed = await Token.countDocuments({ status: "completed" });
  const skipped = await Token.countDocuments({ status: "skipped" });

  res.json({ total, waiting, serving, completed, skipped });
});

module.exports = router;
