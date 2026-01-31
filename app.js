const express = require("express");
const cors = require("cors");


const app = express();
app.use(express.json());
app.use(cors());


const healthRoute = require("./routes/health");
const queueRoute = require("./routes/queue");
const authRoute = require("./routes/auth");

app.use("/", healthRoute);
app.use("/queue", queueRoute);
app.use("/auth", authRoute);

module.exports = app;
