const mongoose = require("mongoose");

const suggestionsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  suggestionsChannelId: { type: String, required: true },
});

module.exports = mongoose.model("Suggestions", suggestionsSchema);