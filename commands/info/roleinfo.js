const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("Displays information about a role")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role to get information about")
        .setRequired(true)
    ),

  async execute(client, interaction) {
    const role = interaction.options.getRole("role");

    const embed = new EmbedBuilder()
      .setColor(role.color)
      .setTitle(`${role.name} Information`)
      .addFields(
        { name: "Role ID", value: role.id },
        { name: "Color", value: role.hexColor },
        { name: "Position", value: `${role.position}` },
        { name: "Members", value: `${role.members.size}` },
        {
          name: "Mentionable",
          value: role.mentionable ? "Yes" : "No",
        },
        { name: "Hoisted", value: role.hoist ? "Yes" : "No" }
      )
      .setFooter({ text: mConfig.footerText })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
