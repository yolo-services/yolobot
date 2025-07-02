const { EmbedBuilder } = require("discord.js");
const mConfig = require("../../messageConfig.json");
const Guild = require("../../models/guild");

const getPartnershipsRequirementsEmbed = async (interaction) => {
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
