const { SlashCommandBuilder } = require("discord.js");
const {
  partnershipsInfoMessage,
} = require("../../data/messages/partnershipsInfo");

module.exports = {
  license: "partnerships",
  data: new SlashCommandBuilder()
    .setName("partnerships-info")
    .setDescription("Displays all partnerships information"),
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.channel.send(partnershipsInfoMessage(interaction));
    await interaction.editReply({
      content: "Partnerhsips information sent!",
    });
  },
};
