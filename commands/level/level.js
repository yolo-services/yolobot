const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const UserLevel = require("../../models/userLevel");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Manage and check user levels")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Check the level of a specific user (optional)")
    ),

  async execute(client, interaction) {
    const target = interaction.options.getUser("user") || interaction.user;

    const userData =
      (await UserLevel.findOne({
        userId: target.id,
        guildId: interaction.guild.id,
      })) ||
      new UserLevel({ userId: target.id, guildId: interaction.guild.id });

    const levelEmbed = new EmbedBuilder()
      .setColor(mConfig.embedColorPrimary)
      .setTitle(`${target.username}'s Level`)
      .addFields(
        { name: "Level", value: `${userData.level}`, inline: true },
        { name: "Exp", value: `${userData.exp}`, inline: true },
        {
          name: "Next Level Exp",
          value: `${userData.nextLevelExp}`,
        }
      );

    await interaction.reply({ embeds: [levelEmbed] });
  },
};
