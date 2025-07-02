const { EmbedBuilder } = require("discord.js");
const mConfig = require("../../messageConfig.json");

const getPartnershipsRequirementsEmbed = (interaction) => {
  let fields = [
    "> - Must have at least **50 members** in your discord community. If you have less than 50 members, you need to post our advertisement in your server with `@everyone` ping.",
    "> - it can't be a **Invites = something** server.",
    "> - It can't be absolutely dead server.",
  ];

  const embed = new EmbedBuilder()
    .setColor(mConfig.embedColorPrimary)
    .setDescription(
      `\`\`\`${interaction.guild.name} - PARTNERSHIPS REQUIREMENTS\`\`\`
      ${fields.join("\n")}`
    )
    .setFooter({ text: mConfig.footerText });

  return embed;
};

module.exports = {
  getPartnershipsRequirementsEmbed,
};
