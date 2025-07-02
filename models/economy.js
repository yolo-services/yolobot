const { Schema, model } = require("mongoose");

const economySchema = new Schema({
  guildId: { type: String, required: true },
  symbol: { type: String, default: "$" },
});

module.exports = model("Economy", economySchema);
