const {
  Events,
  EmbedBuilder,
  PermissionsBitField,
  PermissionFlagsBits,
} = require("discord.js");
const AutoMod = require("../models/automod"); // Zakładam, że wcześniej utworzony model MongoDB dla przechowywania domen
const mConfig = require("../messageConfig.json");

module.exports = {
  name: Events.MessageCreate,
  async execute(client, message) {
    // Sprawdzanie, czy wiadomość pochodzi od bota lub użytkownika z uprawnieniami administratora
    if (
      message.author.bot //||
      //message.member.permissions.has(PermissionFlagsBits.Administrator)
    )
      return;

    // Wyrażenie regularne, które sprawdza, czy wiadomość zawiera link
    const linkRegex = /(https?:\/\/[^\s]+)/g;

    // Jeśli wiadomość zawiera linki
    if (linkRegex.test(message.content)) {
      const foundLinks = message.content.match(linkRegex);

      // Pobieramy dane o dozwolonych domenach z bazy dla danego serwera
      const autoModData = await AutoMod.findOne({ guildId: message.guild.id });

      let isAllowed = false;

      // Sprawdzamy, czy linki znajdują się na liście dozwolonych domen
      for (const link of foundLinks) {
        if (
          autoModData &&
          autoModData.domains.some((domain) => link.includes(domain))
        ) {
          isAllowed = true;
          break;
        }
      }

      // Jeśli żaden link nie jest dozwolony, usuwamy wiadomość
      if (!isAllowed) {
        await message.delete();

        // Wysyłamy prywatną wiadomość do użytkownika, który dodał niedozwolony link
        message.author.send({
          embeds: [
            new EmbedBuilder()
              .setColor(mConfig.embedColorError)
              .setTitle("Message removed")
              .setDescription(
                `Your message on the **${message.guild.name}** server has been deleted because it contained an unauthorized link`
              )
              .addFields({ name: "Message", value: message.content }),
          ],
        });

        // Logowanie do odpowiedniego kanału (jeśli jest skonfigurowany)
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
