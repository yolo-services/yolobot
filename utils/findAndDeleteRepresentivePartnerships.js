const { EmbedBuilder } = require("discord.js");
const mConfig = require("../messageConfig.json");
const partnership = require("../models/partnership");
const Guild = require("../models/guild");
const PartnershipSystem = require("../models/partnershipSystem");

const findAndDeleteRepresentivePartnerships = async (
  client,
  userId,
  guildId
) => {
  const reps = await partnership.find({
    guildId: guildId,
    "messages.representativeId": userId,
  });

  const guildConfig = await Guild.findOne({ guildId: guildId });

  const logChannel = await client.channels.fetch(
    guildConfig.partnershipsLogChannelId
  );

  const partnetshipConfig = await PartnershipSystem.findOne({
    guildId: guildId,
  });

  for (const doc of reps) {
    const messagesToDelete = doc.messages.filter(
      (msg) => msg.representativeId === userId
    );

    const guild = await client.guilds.fetch(guildId);

    const channel = await guild.channels
      .fetch(partnetshipConfig.channelId)
      .catch(() => null);
    if (!channel || !channel.isTextBased()) continue;

    for (const messageData of messagesToDelete) {
      try {
        const msg = await channel.messages.fetch(messageData.messageId);
        await msg.delete();

        await partnership.updateOne(
          { _id: doc._id },
          { $pull: { messages: { messageId: messageData.messageId } } }
        );
      } catch (err) {
        console.warn(
          `Failed to delete message ${messageData.messageId}:`,
          err.message
        );
        console.error(err);
        continue;
      }

      const embed = new EmbedBuilder()
        .setColor(mConfig.embedColorError)
        .setTitle("Partnership Deleted!")
        .setDescription(
          `> Deleted a partnership message caused by <@${userId}> leaving the server.`
        )
        .addFields(
          {
            name: "Representative",
            value: `<@${userId}> (${userId})`,
            inline: false,
          },
          {
            name: "Implementer",
            value: `<@${messageData.implementerId}> (${messageData.implementerId})`,
            inline: false,
          },
          { name: "Invite", value: doc.invite, inline: false },
          { name: "Message ID", value: messageData.messageId, inline: false }
        )
        .setFooter({ text: mConfig.footerText })
        .setTimestamp();

      if (logChannel && logChannel.isTextBased()) {
        await logChannel.send({ embeds: [embed] });
      }
    }

    const updatedDoc = await partnership.findById(doc._id);

    if (!updatedDoc.messages || updatedDoc.messages.length === 0) {
      await partnership.deleteOne({ _id: doc._id });

      const embed = new EmbedBuilder()
        .setColor(mConfig.embedColorError)
        .setTitle("Empty Partnership Deleted!")
        .setDescription(
          `> Deleted a entire partnership from database caused by <@${userId}> leaving the server.`
        )
        .addFields({ name: "Invite", value: doc.invite, inline: false })
        .setFooter({ text: mConfig.footerText })
        .setTimestamp();

      if (logChannel && logChannel.isTextBased()) {
        await logChannel.send({ embeds: [embed] });
      }
    }
  }
};

module.exports = { findAndDeleteRepresentivePartnerships };
