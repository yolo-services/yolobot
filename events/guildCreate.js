const Guild = require("../models/guild");

module.exports = {
  name: "guildCreate",
  async execute(client, guild) {
    const newGuild = new Guild({
      guildId: guild.id,
    });

    await newGuild.save();
  },
};
