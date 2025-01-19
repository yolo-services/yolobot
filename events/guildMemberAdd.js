const { EmbedBuilder } = require("discord.js");
const Guild = require("../models/guild");
const Welcomer = require("../models/welcomer");
const mConfig = require("../messageConfig.json");

module.exports = {
  name: "guildMemberAdd",
  async execute(client, interaction) {
    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    const welcomerConfig = await Welcomer.findOne({
      guildId: interaction.guild.id,
    });

    if (guildConfig && guildConfig.logChannelId) {
      const logChannel = interaction.guild.channels.cache.get(
        guildConfig.logChannelId
      );
      if (logChannel) {
        const joinEmbed = new EmbedBuilder()
          .setColor(mConfig.embedColorSuccess)
          .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTitle("Member joined")
          .addFields({
            name: "User",
            value: `<@${interaction.user.id}> (${interaction.user.id})`,
            inline: true,
          });
        logChannel.send({ embeds: [joinEmbed] });
      }
    }

    if (welcomerConfig && welcomerConfig.welcomerChannelId) {
      const welcomeChannel = interaction.guild.channels.cache.get(
        welcomerConfig.welcomerChannelId
      );

      if (welcomeChannel && welcomerConfig.welcomeMessage.title) {
        const embed = new EmbedBuilder()
          .setColor(
            welcomerConfig.welcomeMessage.color || mConfig.embedColorSuccess
          )
          .setTitle(welcomerConfig.welcomeMessage.title)
          .setDescription(welcomerConfig.welcomeMessage.body)
          .setThumbnail(interaction.user.displayAvatarURL())

        if (welcomerConfig.welcomeMessage.image) {
          embed.setImage(welcomerConfig.welcomeMessage.image);
        }

        if (welcomerConfig.welcomeMessage.footer) {
          embed.setFooter({ text: `${welcomerConfig.welcomeMessage.footer}` });
        }

        if (welcomerConfig.welcomeMessage.userFieldTitle) {
          embed.addFields({
            name: `${welcomerConfig.welcomeMessage.userFieldTitle}`,
            value: `<@${interaction.user.id}>`,
            inline: true,
          });
        }

        welcomeChannel.send({ embeds: [embed] });
      }
    }
  },
};
