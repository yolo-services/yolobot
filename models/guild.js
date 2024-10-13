const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  logChannelId: { type: String, required: false },
  archiveChannelId: { type: String, required: false },
});

module.exports = mongoose.model("Guild", guildSchema);
