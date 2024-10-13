const { Events, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const AutoMod = require("../models/automod");
const mConfig = require("../messageConfig.json");

const spamMap = new Map();
const SPAM_LIMIT = 5;
const TIME_WINDOW = 1000;

module.exports = {
  name: Events.MessageCreate,
  async execute(client, message) {
    const autoModData = await AutoMod.findOne({ guildId: message.guild.id });
    if (autoModData.enabledFeatures.antiSpam) return;

    if (
      message.author.bot ||
      message.member.permissions.has(PermissionFlagsBits.Administrator)
    )
      return;

    const userId = message.author.id;
    const now = Date.now();

    if (!spamMap.has(userId)) {
      spamMap.set(userId, []);
    }

    const timestamps = spamMap.get(userId);
    timestamps.push(now);
    const recentMessages = timestamps.filter(
      (timestamp) => now - timestamp < TIME_WINDOW
    );
    spamMap.set(userId, recentMessages);

    if (recentMessages.length > SPAM_LIMIT) {
      await message.member.timeout(60000);

      message.author.send({
        embeds: [
          new EmbedBuilder()
            .setColor(mConfig.embedColorError)
            .setTitle("You have been muted")
            .setDescription(
              `You were muted on the **${message.guild.name}** server for spamming.`
            ),
        ],
      });

      if (autoModData && autoModData.channelId) {
        const logChannel = message.guild.channels.cache.get(
          autoModData.channelId
        );

        const logEmbed = new EmbedBuilder()
          .setColor(mConfig.embedColorError)
          .setTitle("User Muted for Spamming")
          .addFields(
            {
              name: "User",
              value: `<@${message.author.id}> (${message.author.id})`,
            },
            { name: "Messages", value: recentMessages.length.toString() }
          )
          .setTimestamp();

        logChannel.send({ embeds: [logEmbed] });
      }
    }
  },
};
