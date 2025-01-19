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

    const welcomeImageInput = new TextInputBuilder()
      .setCustomId("welcomerImage")
      .setLabel("Welcome Image")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const welcomeFooterInput = new TextInputBuilder()
      .setCustomId("welcomerFooter")
      .setLabel("Welcome Footer")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const welcomeColorInput = new TextInputBuilder()
      .setCustomId("welcomerColor")
      .setLabel("Welcome Embed Color")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const firstRow = new ActionRowBuilder().addComponents(welcomeTitleInput);
    const secondRow = new ActionRowBuilder().addComponents(
      welcomerMessageInput
    );
    const thirdRow = new ActionRowBuilder().addComponents(welcomeImageInput);
    const fourthRow = new ActionRowBuilder().addComponents(welcomeFooterInput);
    const fifthRow = new ActionRowBuilder().addComponents(welcomeColorInput);

    modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);

    await interaction.showModal(modal);
  },
};
