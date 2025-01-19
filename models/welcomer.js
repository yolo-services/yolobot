const mongoose = require("mongoose");

const welcomerSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  welcomerChannelId: { type: String, required: true },
  welcomeMessage: {
    title: { type: String, default: "" },
    body: { type: String, default: "" },
    footer: { type: String, default: "" },
    color: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  farewellMessage: {
    title: { type: String, default: "" },
    body: { type: String, default: "" },
    footer: { type: String, default: "" },
    color: { type: String, default: "" },
    image: { type: String, default: "" },
  },
});

module.exports = mongoose.model("Welcomer", welcomerSchema);
