const { Events, AuditLogEvent, EmbedBuilder } = require("discord.js");
const Guild = require("../models/guild");
const Welcomer = require("../models/welcomer");
const mConfig = require("../messageConfig.json");
const {
  findAndDeleteRepresentivePartnerships,
} = require("../utils/findAndDeleteRepresentivePartnerships");

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(client, member) {
    const guildConfig = await Guild.findOne({ guildId: member.guild.id });
    const welcomerConfig = await Welcomer.findOne({
      guildId: member.guild.id,
    });

    await findAndDeleteRepresentivePartnerships(
      client,
      member.id,
      member.guild.id
    );

    const roles =
      member.roles.cache
        .filter((role) => role.id !== member.guild.id)
        .map((role) => `<@&${role.id}>`)
        .join(", ") || "No roles";

    if (guildConfig && guildConfig.logChannelId) {
      const logChannel = member.guild.channels.cache.get(
        guildConfig.logChannelId
      );
      if (logChannel) {
        const fetchedLogs = await member.guild.fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.MemberKick,
        });

        const kickLog = fetchedLogs.entries.first();
        const kickTime = kickLog ? kickLog.createdAt : null;
        const currentTime = new Date();
        const timeDifference = (currentTime - kickTime) / 1000;

        if (kickLog && kickLog.target.id === member.id && timeDifference < 10) {
          const { executor, target, reason } = kickLog;
          const kickEmbed = new EmbedBuilder()
            .setColor(mConfig.embedColorError)
            .setAuthor({
              name: target.tag,
              iconURL: target.displayAvatarURL(),
            })
            .setThumbnail(target.displayAvatarURL())
            .setTitle("Member kicked")
            .addFields(
              { name: "Reason", value: reason || "No reason provided" },
              { name: "Moderator", value: `<@${executor.id}>` },
              { name: "User", value: `<@${target.id}> (${target.id})` },
              { name: "Roles", value: roles }
            )
            .setFooter({ text: mConfig.footerText })
            .setTimestamp();

          logChannel.send({ embeds: [kickEmbed] });
        } else {
          const leaveEmbed = new EmbedBuilder()
            .setColor(mConfig.embedColorError)
            .setAuthor({
              name: member.user.tag,
              iconURL: member.user.displayAvatarURL(),
            })
            .setThumbnail(member.user.displayAvatarURL())
            .setTitle("Member left")
            .addFields(
              {
                name: "User",
                value: `<@${member.user.id}> (${member.user.id})`,
              },
              {
                name: "Roles",
                value: roles,
              }
            )
            .setFooter({ text: mConfig.footerText })
            .setTimestamp();

          logChannel.send({ embeds: [leaveEmbed] });
        }
      }
    }

    if (welcomerConfig && welcomerConfig.welcomerChannelId) {
      const welcomeChannel = member.guild.channels.cache.get(
        welcomerConfig.welcomerChannelId
      );
      if (welcomeChannel && welcomerConfig.farewellMessage.title) {
        const embed = new EmbedBuilder()
          .setColor(
            welcomerConfig.farewellMessage.color || mConfig.embedColorSuccess
          )
          .setTitle(welcomerConfig.farewellMessage.title)
          .setDescription(welcomerConfig.farewellMessage.body)
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setTimestamp();

        if (welcomerConfig.farewellMessage.image) {
          embed.setImage(welcomerConfig.farewellMessage.image);
        }

        if (welcomerConfig.farewellMessage.footer) {
          embed.setFooter({
            text: welcomerConfig.farewellMessage.footer,
          });
        } else {
          embed.setFooter({ text: mConfig.footerText });
        }

        if (welcomerConfig.farewellMessage.userFieldTitle) {
          embed.addFields({
            name: welcomerConfig.farewellMessage.userFieldTitle,
            value: `<@${member.user.id}> (${member.user.id})`,
            inline: true,
          });
        }

        welcomeChannel.send({ embeds: [embed] });
      }
    }
  },
};
