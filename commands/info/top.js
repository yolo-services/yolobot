const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserLevel = require("../../models/userLevel");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Show the top 10 users on the server!")
    .addStringOption((option) =>
      option
        .setName("system")
        .setDescription("The system to display leaderboard")
        .setRequired(true)
        .addChoices(
          { name: "Leveling", value: "level" }
          // { name: "Money", value: "money" },
        )
    ),
  async execute(client, interaction) {
    const guildId = interaction.guild.id;
    const system = interaction.options.getString("system");

    // Pobieranie top 10 użytkowników na podstawie XP
    if (system === "level") {
      const topUsers = await UserLevel.find({ guildId })
        .sort({ exp: -1 }) // Sortowanie od największego XP do najmniejszego
        .limit(10);

      if (topUsers.length === 0) {
        return interaction.reply("No users found on the leaderboard!");
      }

      // Tworzenie embedu z leaderboardem
      const embed = new EmbedBuilder()
        .setTitle("Leveling Leaderboard")
        .setColor(mConfig.embedColorPrimary)
        .setDescription("Top 10 users with the highest XP!");

      topUsers.forEach((userData, index) => {
        const member = interaction.guild.members.cache.get(userData.userId);
        const username = member ? member.user.tag : "Unknown User";
        embed.addFields({
          name: `**${index + 1}.** ${username}`,
          value: `Level: **${userData.level}** | XP: **${userData.exp}**`,
        });
      });

      await interaction.reply({ embeds: [embed] });
    }
  },
};
