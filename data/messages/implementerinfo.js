const { EmbedBuilder } = require("discord.js");
const mConfig = require("../../messageConfig.json");
const implementer = require("../../models/implementer");
const { PRICE_INCREASE_PER } = require("../partnerships");
const partnershipSystem = require("../../models/partnershipSystem");
const Guild = require("../../models/guild");

const getImplementerInfoEmbed = async (user, interaction) => {
  const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
  if (!guildConfig || !guildConfig.enabledSystems.partnerships) {
    return interaction.reply({
      content: "This system is disabled! Use `/partnerships toggle enabled:`",
      ephemeral: true,
    });
  }

  if (!guildConfig.licenseCode) {
    return interaction.reply({
      content: "This server does not have a license for using this bot.",
      ephemeral: true,
    });
  }

  const entry = await implementer.findOne({
    userId: user.id,
    guildId: interaction.guild.id,
  });

  if (!entry) {
    return;
  }

  const priceIncreseTimes = Math.floor(entry.amount / PRICE_INCREASE_PER);

  const partnershipsConfig = await partnershipSystem.findOne({
    guildId: interaction.guild.id,
  });

  if (!partnershipsConfig) {
    return interaction.reply({
      content: "This system is not set up! Use `/partnerships set`",
      ephemeral: true,
    });
  }

  let fields = [
    { name: "User", value: `<@${user.id}> (${user.id})`, inline: false },
    {
      name: "Added At",
      value: `<t:${Math.floor(entry.addedAt.getTime() / 1000)}:F>`,
      inline: false,
    },
    {
      name: "Partnerships Amount",
      value: `${entry.amount}`,
      inline: false,
    },
    {
      name: "Balance",
      value: `${entry.balance} ${partnershipsConfig.currency}`,
      inline: false,
    },
    {
      name: "Price per partnership",
      value: `${entry.price} ${partnershipsConfig.currency}`,
      inline: false,
    },
    {
      name: "Times Price Increased",
      value: `${priceIncreseTimes}x`,
      inline: true,
    },
  ];

  if (entry.lastPayout) {
    fields.push({
      name: "Last Payout",
      value: `<t:${Math.floor(entry.lastPayout.getTime() / 1000)}:F>`,
      inline: false,
    });
  }

  const embed = new EmbedBuilder()
    .setTitle("Implementer Info")
    .setColor(mConfig.embedColorPrimary)
    .addFields(fields)
    .setFooter({ text: mConfig.footerText })
    .setTimestamp();

  return embed;
};

module.exports = {
  getImplementerInfoEmbed,
};
