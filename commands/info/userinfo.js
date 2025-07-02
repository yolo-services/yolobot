const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Displays information about a user")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Select a user to view their info")
        .setRequired(false)
    ),

  async execute(client, interaction) {
    const user = interaction.options.getUser("target") || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    const embed = new EmbedBuilder()
      .setColor(mConfig.embedColorPrimary) // Kolor embeda
      .setTitle(`${user.username}'s Information`) // Nazwa użytkownika w tytule
      .setThumbnail(user.displayAvatarURL()) // Avatar użytkownika
      .addFields(
        { name: "Ping", value: `<@${user.id}>` },
        { name: "Nick", value: `${user.tag}` },
        { name: "ID", value: `${user.id}` },
        {
          name: "Joined Server",
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`,
          inline: true,
        },
        {
          name: "Account Created",
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`,
          inline: true,
        },
        {
          name: "Roles",
          value: member.roles.cache.map((role) => role).join(", ") || "None",
          inline: false,
        }
      )
      .setFooter({ text: mConfig.footerText })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
