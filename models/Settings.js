const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  instituteName: {
    type: String,
    default: "QueueZen Institute",
  },
  departmentName: {
    type: String,
    default: "General Department",
  },
  serviceCenterName: {
    type: String,
    default: "Service Counter",
  },
});

module.exports = mongoose.model("Settings", settingsSchema);
