const { Schema, model } = require("mongoose");

const autoModSchema = new Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  domains: [String],
});

module.exports = model("AutoMod", autoModSchema);
