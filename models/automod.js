const { Schema, model } = require("mongoose");

const autoModSchema = new Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  enabledFeatures: {
    linkRemover: { type: Boolean, default: true },
    antiSpam: { type: Boolean, default: true },
    wordCensorship: { type: Boolean, default: true },
    capsLockDetector: { type: Boolean, default: true },
    emojiManager: { type: Boolean, default: true },
  },
  domains: [String],
  bannedWords: [String],
  emojiLimit: { type: Number, required: false },
});

module.exports = model("AutoMod", autoModSchema);
