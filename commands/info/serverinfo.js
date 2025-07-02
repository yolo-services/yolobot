const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Displays information about the server'),
  
  async execute(client, interaction) {
    const { guild } = interaction;

    const embed = new EmbedBuilder()
      .setColor(mConfig.embedColorPrimary)
      .setTitle(`${guild.name} Information`)
      .setThumbnail(guild.iconURL()) // Ikona serwera
      .addFields(
        { name: 'Server Name', value: guild.name },
        { name: 'Owner', value: `<@${guild.ownerId}>` }, // Właściciel serwera
        { name: 'Member Count', value: `${guild.memberCount}` }, // Liczba członków
        { name: 'Created At', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>` }, // Data utworzenia
        { name: 'Verification Level', value: `${guild.verificationLevel}` }, // Poziom weryfikacji
        { name: 'Number of Roles', value: `${guild.roles.cache.size}` }, // Liczba ról
        { name: 'Boost Tier', value: guild.premiumTier ? `Tier ${guild.premiumTier}` : 'No Boosts' }, // Poziom boosta
        { name: 'Boost Count', value: `${guild.premiumSubscriptionCount || '0'}` } // Liczba boostów
      )
      .setFooter({ text: mConfig.footerText })
      .setTimestamp();
      
    await interaction.reply({ embeds: [embed] });
  },
};
