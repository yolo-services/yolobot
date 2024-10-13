const { Events, EmbedBuilder } = require("discord.js");
const UserLevel = require("../models/userLevel");
const Guild = require("../models/guild");
const mConfig = require("../messageConfig.json");

module.exports = {
  name: Events.MessageCreate,
  async execute(client, message) {
    if (message.author.bot) return;

    const xpToAdd = 5;
    const userLevelData =
      (await UserLevel.findOne({
        userId: message.author.id,
        guildId: message.guild.id,
      })) ||
      new UserLevel({ userId: message.author.id, guildId: message.guild.id });

    const guildData = await Guild.findOne({ guildId: message.guild.id });

    userLevelData.exp += xpToAdd;
    const requiredXp = userLevelData.level * 100;
    const logChannel = message.guild.channels.cache.get(
      guildData.levelChannelId
    );
    const levelChannel = logChannel || message.channel;

    if (userLevelData.exp >= requiredXp) {
      userLevelData.level += 1;
      userLevelData.exp -= requiredXp;
      userLevelData.nextLevelExp = (userLevelData.level + 1) * 100;
      const embed = new EmbedBuilder()
        .setColor(mConfig.embedColorSuccess)
        .setTitle("Level Up!")
        .setDescription(
          `**Congratulations!** ${message.author} leveled up to level **${userLevelData.level}**!`
        )
        .addFields({
          name: "Next Level EXP",
          value: `You now need **${
            (userLevelData.level + 1) * 100
          }** EXP for the next level!`,
        })
        .setTimestamp();
      await levelChannel.send({ embeds: [embed] });
    }
    await userLevelData.save();
  },
};
