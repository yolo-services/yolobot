const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Guild = require("../../models/guild");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fix-guild-database")
    .setDescription("Fix the guild database error")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction) {
    const existing = await Guild.findOne({ guildId: interaction.guild.id });
    if (existing) {
      return interaction.reply({
        content:
          "This server is already in the database. Nothing to do. Everything is fine.",
        ephemeral: true,
      });
    }

    const newGuild = new Guild({
      guildId: interaction.guild.id,
    });

    await newGuild.save();

    await interaction.reply({
      content:
        "Guild added to database successfully. Everything is should be fine.",
      ephemeral: true,
    });
  },
};
