const mongoose = require("mongoose");

const rolePanelSchema = new mongoose.Schema({
  panelId: String,
  guildId: String,
  title: String,
  description: String,
  roles: [
    {
      label: String,
      roleId: String,
      buttonStyle: String,
    },
  ],
});

module.exports = mongoose.model("RolePanel", rolePanelSchema);