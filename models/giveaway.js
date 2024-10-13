const mongoose = require("mongoose");

const giveawaySchema = new mongoose.Schema({
  guildId: String,
  giveawayId: String,
  name: String,
  description: String,
  prize: String,
  endTime: Date,
  winnersCount: Number,
  participants: [String],
  isActive: Boolean,
  channelId: String,
});

module.exports = mongoose.model("Giveaway", giveawaySchema);
