const { Events, AuditLogEvent, EmbedBuilder } = require("discord.js");
const Guild = require("../models/guild");
const Welcomer = require("../models/welcomer");
const mConfig = require("../messageConfig.json");

module.exports = {
  name: Events.GuildMemberRemove,
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
        const fetchedLogs = await interaction.guild.fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.MemberKick,
        });

        const kickLog = fetchedLogs.entries.first();

        const kickTime = kickLog ? kickLog.createdAt : null;
        const currentTime = new Date();
        const timeDifference = (currentTime - kickTime) / 1000;

        console.log(kickLog);

        if (
          kickLog &&
          kickLog.target.id === interaction.user.id &&
          timeDifference < 10
        ) {
          const { executor, target, reason } = kickLog;
          const leaveEmbed = new EmbedBuilder()
            .setColor(mConfig.embedColorError)
            .setAuthor({
              name: target.tag,
              iconURL: target.displayAvatarURL(),
            })
            .setThumbnail(target.displayAvatarURL())
            .setTitle("Member kicked")
            .addFields(
              {
                name: "Reason",
                value: reason,
              },
              {
                name: "Moderator",
                value: `<@${executor.id}>`,
              },
              {
                name: "User",
                value: `<@${target.id}> (${target.id})`,
              }
            );
          logChannel.send({ embeds: [leaveEmbed] });
        } else {
          const leaveEmbed = new EmbedBuilder()
            .setColor(mConfig.embedColorError)
            .setAuthor({
              name: interaction.user.tag,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTitle("Member left")
            .addFields({
              name: "User",
              value: `<@${interaction.user.id}> (${interaction.user.id})`,
            });
          logChannel.send({ embeds: [leaveEmbed] });
        }
      }
    }

    if (welcomerConfig && welcomerConfig.welcomerChannelId) {
      const welcomeChannel = interaction.guild.channels.cache.get(
        welcomerConfig.welcomerChannelId
      );
      if (welcomeChannel && welcomerConfig.farewellMessage.title) {
        const embed = new EmbedBuilder()
          .setColor(
            welcomerConfig.welcomeMessage.color || mConfig.embedColorSuccess
          )
          .setTitle(welcomerConfig.farewellMessage.title)
          .setDescription(welcomerConfig.farewellMessage.body)
          .setThumbnail(interaction.user.displayAvatarURL())

        if (welcomerConfig.welcomeMessage.image) {
          embed.setImage(welcomerConfig.welcomeMessage.image);
        }

        if (welcomerConfig.welcomeMessage.footer) {
          embed.setFooter({ text: `${welcomerConfig.farewellMessage.footer}` });
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
