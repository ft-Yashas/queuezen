const express = require("express");
const cors = require("cors");

const queueRoutes = require("./routes/queue");
const authRoutes = require("./routes/auth");
const healthRoutes = require("./routes/health");
const settingsRoutes = require("./routes/settings");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/queue", queueRoutes);
app.use("/auth", authRoutes);
app.use("/health", healthRoutes);
app.use("/settings", settingsRoutes);

module.exports = app;
