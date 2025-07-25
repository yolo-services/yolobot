const { Schema, model } = require("mongoose");

const ticketPanelSchema = new Schema({
  panelId: { type: String, required: true },
  guildId: { type: String, required: true },
  title: { type: String, default: "Ticket Panel" },
  description: {
    type: String,
    default: "Please select a topic to open a ticket:",
  },
  topics: [
    {
      label: { type: String, required: true },
      emoji: { type: String, required: false },
      description: { type: String, required: true },
    },
  ],
});

module.exports = model("TicketPanel", ticketPanelSchema);
