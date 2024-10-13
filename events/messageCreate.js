const { Events } = require("discord.js");
const UserLevel = require("../models/userLevel");

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

    userLevelData.xp += xpToAdd;

    const requiredXp = userLevelData.level * 100;

    if (userLevelData.xp >= requiredXp) {
      userLevelData.level += 1;
      userLevelData.xp = 0;
      message.channel.send(
        `Congratulations! ${message.author.username} leveled up to level ${userLevelData.level}!`
      );
    }

    await userLevelData.save();
  },
};
