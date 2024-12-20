const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: {
    customId: "modal-join-welcomer",
    title: "Welcome User Setup",
  },
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId(this.data.customId)
      .setTitle(this.data.title);

    const welcomeTitleInput = new TextInputBuilder()
      .setCustomId("welcomerTitle")
      .setLabel("Welcome Title")
      .setStyle(TextInputStyle.Short);

    const welcomerMessageInput = new TextInputBuilder()
      .setCustomId("welcomerMessage")
      .setLabel("Welcome Message")
      .setStyle(TextInputStyle.Paragraph);

    const welcomeFooterInput = new TextInputBuilder()
      .setCustomId("welcomerFooter")
      .setLabel("Welcome Footer")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const firstRow = new ActionRowBuilder().addComponents(welcomerMessageInput);
    const secondRow = new ActionRowBuilder().addComponents(welcomeTitleInput);
    const thirdRow = new ActionRowBuilder().addComponents(welcomeFooterInput);

    modal.addComponents(firstRow, secondRow, thirdRow);

    await interaction.showModal(modal);
  },
};
