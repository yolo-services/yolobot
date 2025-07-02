const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("channelinfo")
    .setDescription("Displays information about the current channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to get information about")
    ),

  async execute(client, interaction) {
    const channel =
      interaction.options.getChannel("channel") || interaction.channel;

    const embed = new EmbedBuilder()
      .setColor(mConfig.embedColorPrimary)
      .setTitle(`${channel.name} channel Information`)
      .addFields(
        { name: "Channel ID", value: `${channel.id}` },
        {
          name: "Channel Type",
          value: `${channel.type} (${channel.type === 0 ? "Text" : "Voice"})`,
        },
        {
          name: "Created At",
          value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:D>`,
        },
        { name: "Position", value: `${channel.position}` }
      )
      .setFooter({ text: mConfig.footerText })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
