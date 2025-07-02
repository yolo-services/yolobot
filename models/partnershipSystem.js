const mongoose = require("mongoose");

const PartnershipSystemSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  roleId: { type: String, required: true },
  channelId: { type: String, required: true },
  defaultPrice: { type: Number, default: 0.5 },
  currency: { type: String, default: "USD" },
});

module.exports = mongoose.model("PartnershipSystem", PartnershipSystemSchema);
