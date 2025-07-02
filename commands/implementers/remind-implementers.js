const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const mConfig = require("../../messageConfig.json");
const {
  remindInactiveImplementers,
} = require("../../scripts/partnershipsReminder");
const Guild = require("../../models/guild");
const partnershipSystem = require("../../models/partnershipSystem");

module.exports = {
  license: "partnerships",
  data: new SlashCommandBuilder()
    .setName("remind-implementers")
    .setDescription("Reminds inactive implementers.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(client, interaction) {
    let guildData =
      (await Guild.findOne({ guildId: interaction.guild.id })) ||
      new Guild({ guildId: interaction.guild.id });

    if (!guildData.enabledSystems.partnerships) {
      return interaction.reply({
        content: "This system is disabled! Use `/partnerships toggle enabled:`",
        ephemeral: true,
      });
    }

    const partnershipsConfig = await partnershipSystem.findOne({
      guildId: interaction.guild.id,
    });

    if (!partnershipsConfig) {
      return interaction.reply({
        content: "This system is not set up! Use `/partnerships set`",
        ephemeral: true,
      });
    }

    try {
      remindInactiveImplementers(client, interaction.guild.id);

      const embed = new EmbedBuilder()
        .setColor(mConfig.embedColorSuccess)
        .setTitle("Reminded Implementers!")
        .setDescription("Successfully reminded all inactive implementers.")
        .setFooter({ text: mConfig.footerText })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error("Reminder Error:", err);
      await interaction.reply({
        content: "`❌` Failed to send reminders.",
        ephemeral: true,
      });
    }
  },
};
