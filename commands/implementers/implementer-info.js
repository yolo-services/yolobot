const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const {
  getImplementerInfoEmbed,
} = require("../../data/messages/implementerinfo");
const Guild = require("../../models/guild");
const partnershipSystem = require("../../models/partnershipSystem");

module.exports = {
  license: "partnerships",
  data: new SlashCommandBuilder()
    .setName("implementer-info")
    .setDescription("Shows information about an implementer by mention.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to get info about")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction) {
    const user = interaction.options.getUser("user") || interaction.user;

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

    const embed = await getImplementerInfoEmbed(user, interaction);

    if (!embed) {
      return interaction.reply({
        content: "`⚠️` This user is not in the implementer database.",
        ephemeral: true,
      });
    }

    try {
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error("MongoDB Error:", err);
      interaction.reply({
        content: "`❌` Failed to fetch implementer information.",
        ephemeral: true,
      });
    }
  },
};
