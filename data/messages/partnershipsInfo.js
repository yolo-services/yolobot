const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

const mConfig = require("../../messageConfig.json");

const ticketOptions = [
  {
    label: "Partnerships Reqirements",
    value: "partnerships-requirements",
    description: "Displays partnerships requirements",
    emoji: "📜",
  },
  {
    label: "Apply for Implementer",
    value: "apply-implementer",
    description: "Apply for implementer role",
    emoji: "💼",
  },
  {
    label: "Implementer Info",
    value: "implementer-info",
    description: "Displays information for implementers",
    emoji: "👤",
  },
  {
    label: "Implementer Payout",
    value: "payout-partnerships",
    description: "Open ticket for payout your partnerships",
    emoji: "💸",
  },
];

const partnershipsInfoMessage = (interaction) => {
  const embed = new EmbedBuilder()
    .setColor(mConfig.embedColorPrimary)
    .setDescription(
      `# \`\`\`${interaction.guild.name} - PARTNERSHIPS INFO\`\`\`

    > You need help or have a question about partnerships?`
    )
    .setFooter({ text: mConfig.footerText });

  const menu = new StringSelectMenuBuilder()
    .setCustomId("partnerships-info-topic-select")
    .setPlaceholder("Select an option")
    .addOptions(ticketOptions);

  const row = new ActionRowBuilder().addComponents(menu);

  const partnershipsInfoMessage = {
    embeds: [embed],
    components: [row],
  };

  return partnershipsInfoMessage;
};

module.exports = { partnershipsInfoMessage };
