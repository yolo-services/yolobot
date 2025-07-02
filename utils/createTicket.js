const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");

const Guild = require("../models/guild");
const implementer = require("../models/implementer");

const mConfig = require("../messageConfig.json");

const { MINIMUM_BALANCE_FOR_PAYOUT } = require("../data/partnerships");

const createTicket = async (interaction) => {
  const topic = interaction.values[0];
  const username = interaction.user.username
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, "-");
  const channelName = `🎫╵${topic}╵${username}`;

  const entry = await implementer.findOne({ userId: interaction.user.id });

  if (!entry && topic === "payout-partnerships") {
    return interaction.editReply({
      content: "`⚠️` This user is not in the implementer database.",
      ephemeral: true,
    });
  }

  if (entry && topic === "apply-implementer") {
    return interaction.editReply({
      content: "`⚠️` This user is already in the implementer database.",
      ephemeral: true,
    });
  }

  if (
    topic === "payout-partnership" &&
    entry.balance < MINIMUM_BALANCE_FOR_PAYOUT
  ) {
    return interaction.editReply({
      content: `\`⚠️\` This user does not have enough balance. Minimum balance is ${MINIMUM_BALANCE_FOR_PAYOUT} PLN.`,
      ephemeral: true,
    });
  }

  const guildData = await Guild.findOne({ guildId: interaction.guild.id });

  const ticketRoleId = guildData.ticketAdminRoleId;

  if (!ticketRoleId) {
    return interaction.editReply({
      content: "`⚠️` Tickets are not correctly set up.",
      ephemeral: true,
    });
  }

  const ticketChannel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: null,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: ticketRoleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ],
  });

  let description = `# \`\`\`${interaction.guild.name} - ${topic
    .toUpperCase()
    .replace(/-/g, " ")}\`\`\`
      > **Ping:** <@${interaction.user.id}>
      > **Nick:** \`${interaction.user.username}\`
      > **ID:** \`${interaction.user.id}\`
      `;

  if (entry && topic === "payout-partnerships") {
    let implementerInfo = `
    > **Added At:** <t:${Math.floor(entry.addedAt.getTime() / 1000)}:F>
  > **Amount:** \`${entry.amount}\`
  > **Balance:** \`${entry.balance} PLN\``;

    if (entry.lastPayout) {
      implementerInfo += `
    > **Last Payout:** <t:${Math.floor(entry.lastPayout.getTime() / 1000)}:F>
    `;
    } else {
      implementerInfo += `\n`;
    }

    description += implementerInfo;
  }

  description += `
  > Describe your issue in detail,
  > and our team will assist you as soon as possible.`;

  const ticketEmbed = new EmbedBuilder()
    .setColor(mConfig.embedColorPrimary)
    .setDescription(description)
    .setThumbnail(interaction.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({ text: mConfig.footerText });

  const closeEmoji = {
    name: "NO",
    id: "1386380304293429278",
  };

  const closeButton = new ButtonBuilder()
    .setCustomId("close-ticket")
    .setLabel("Close Ticket")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji(closeEmoji);

  const row = new ActionRowBuilder().addComponents(closeButton);

  await ticketChannel.send({
    embeds: [ticketEmbed],
    components: [row],
    content: `<@${interaction.user.id}>`,
  });

  await interaction.editReply({
    content: `\`✅\` Ticket created: <#${ticketChannel.id}>`,
  });
};

module.exports = { createTicket };
