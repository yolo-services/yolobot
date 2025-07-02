const Guild = require("../models/guild");

module.exports = {
  name: "guildCreate",
  async execute(client, guild) {
    const existing = await Guild.findOne({ guildId: guild.id });
    if (existing) return;

    const newGuild = new Guild({
      guildId: guild.id,
    });

    await newGuild.save();
  },
};
