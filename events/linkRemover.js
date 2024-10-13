const {
  Events,
  EmbedBuilder,
  PermissionsBitField,
  PermissionFlagsBits,
} = require("discord.js");
const AutoMod = require("../models/automod");
const mConfig = require("../messageConfig.json");

module.exports = {
  name: Events.MessageCreate,
  async execute(client, message) {
    const autoModData = await AutoMod.findOne({ guildId: message.guild.id });
    if (!autoModData.enabledFeatures.linkRemover) return;

    if (
      message.author.bot ||
      message.member.permissions.has(PermissionFlagsBits.Administrator)
    )
      return;

    const linkRegex = /(https?:\/\/[^\s]+)/g;

    if (linkRegex.test(message.content)) {
      const foundLinks = message.content.match(linkRegex);

      let isAllowed = false;

      for (const link of foundLinks) {
        if (
          autoModData &&
          autoModData.domains.some((domain) => link.includes(domain))
        ) {
          isAllowed = true;
          break;
        }
      }

      if (!isAllowed) {
        await message.delete();

        message.author.send({
          embeds: [
            new EmbedBuilder()
              .setColor(mConfig.embedColorError)
              .setTitle("Message removed")
              .setDescription(
                `Your message on the **${message.guild.name}** server has been deleted because it contained an unauthorized link.`
              )
              .addFields({ name: "Message", value: message.content }),
          ],
        });

        if (autoModData && autoModData.channelId) {
          const logChannel = message.guild.channels.cache.get(
            autoModData.channelId
          );
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor(mConfig.embedColorError)
              .setTitle("Unauthorized link")
              .addFields(
                {
                  name: "User",
                  value: `<@${message.author.id}> (${message.author.id})`,
                },
                { name: "Message", value: message.content },
                { name: "Channel", value: `<#${message.channel.id}>` }
              )
              .setTimestamp();
            logChannel.send({ embeds: [logEmbed] });
          }
        }
      }
    }
  },
};
