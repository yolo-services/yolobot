const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Displays the avatar of a user")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to get the avatar of")
    ),

  async execute(client, interaction) {
    const user = interaction.options.getUser("user") || interaction.user;

    const embed = new EmbedBuilder()
      .setColor(mConfig.embedColorPrimary)
      .setTitle(`${user.username}'s Avatar`)
      .setFields([{ name: "User", value: `<@${user.id}> (${user.id})` }])
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setTimestamp()
      .setFooter({ text: mConfig.footerText });

    await interaction.reply({ embeds: [embed] });
  },
};
