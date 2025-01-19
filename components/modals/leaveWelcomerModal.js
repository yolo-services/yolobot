const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: {
    customId: "modal-leave-welcomer",
    title: "Leave User Setup",
  },
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId(this.data.customId)
      .setTitle(this.data.title);

    const welcomeTitleInput = new TextInputBuilder()
      .setCustomId("welcomerTitle")
      .setLabel("Leave Title")
      .setStyle(TextInputStyle.Short);

    const welcomerMessageInput = new TextInputBuilder()
      .setCustomId("welcomerMessage")
      .setLabel("Leave Message")
      .setStyle(TextInputStyle.Paragraph);

    const welcomeImageInput = new TextInputBuilder()
      .setCustomId("welcomerImage")
      .setLabel("Leave Image")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const welcomeFooterInput = new TextInputBuilder()
      .setCustomId("welcomerFooter")
      .setLabel("Leave Footer")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const welcomeColorInput = new TextInputBuilder()
      .setCustomId("welcomerColor")
      .setLabel("Leave Embed Color")
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
