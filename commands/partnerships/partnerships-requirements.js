const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const {
  getPartnershipsRequirementsEmbed,
} = require("../../data/messages/partnershipsRequirements");

module.exports = {
  license: "partnerships",
  data: new SlashCommandBuilder()
    .setName("partnerships-requirements")
    .setDescription("Displays requirements for partnerships")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });
    const embed = await getPartnershipsRequirementsEmbed(interaction);
    await interaction.channel.send({ embeds: [embed] });
    await interaction.editReply({
      content: "Partnerhsips requirements sent!",
    });
  },
};
