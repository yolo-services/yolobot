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

    userLevelData.exp += xpToAdd;

    const requiredXp = userLevelData.level * 100;

    if (userLevelData.exp >= requiredXp) {
      userLevelData.level += 1;
      userLevelData.exp = 0;
      message.channel.send(
        `**Congratulations!** ${message.author} leveled up to level **${userLevelData.level}**!`
      );
    }
    userLevelData.nextLevelExp = requiredXp;
    await userLevelData.save();
  },
};
