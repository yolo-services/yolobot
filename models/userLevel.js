const mongoose = require("mongoose");

const userLevelSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  guildId: { type: String, required: true },
  level: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
});

module.exports = mongoose.model("UserLevel", userLevelSchema);
