const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionsBitField,
  PermissionFlagsBits,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const TicketPanel = require("../../models/ticketPanel");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Manage ticket panels")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a ticket panel")
        .addStringOption((option) =>
          option
            .setName("panelid")
            .setDescription("The ID for the panel")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("title").setDescription("The title of the panel")
        )
        .addStringOption((option) =>
          option
            .setName("descripton")
            .setDescription("The description of the panel")
        )
        .addRoleOption((option) =>
          option.setName("adminrole").setDescription("The admin of ticket role")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("addtopic")
        .setDescription("Add a topic to the ticket panel")
        .addStringOption((option) =>
          option
            .setName("panelid")
            .setDescription("The panel ID")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("label")
            .setDescription("The label for the topic")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("The description of the topic")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("edit")
        .setDescription("Edit a ticket panel")
        .addStringOption((option) =>
          option
            .setName("panelid")
            .setDescription("The panel ID")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option.setName("adminrole").setDescription("The admin of ticket role")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("send")
        .setDescription("Send a ticket panel")
        .addStringOption((option) =>
          option
            .setName("panelid")
            .setDescription("The panel ID")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    // Create a new ticket panel
    if (subcommand === "create") {
      const panelId = interaction.options.getString("panelid");
      const title = interaction.options.getString("title") || "Ticket Panel";
      const adminRole = interaction.options.getRole("adminrole");

      const newPanel = new TicketPanel({
        panelId,
        guildId: interaction.guild.id,
        title,
        topics: [],
        adminRoleId: adminRole.id,
      });

      await newPanel.save();
      await interaction.reply(`Ticket panel \`${panelId}\` created!`);
    }

    // Add a topic to an existing ticket panel
    else if (subcommand === "addtopic") {
      const panelId = interaction.options.getString("panelid");
      const label = interaction.options.getString("label");
      const description = interaction.options.getString("description");

      const panel = await TicketPanel.findOne({
        panelId,
        guildId: interaction.guild.id,
      });

      if (!panel) {
        return interaction.reply("Panel not found");
      }

      panel.topics.push({ label, description });
      await panel.save();

      await interaction.reply(
        `Topic **${label}** added to panel \`${panelId}\``
      );
    }

    // Send the ticket panel as a SelectMenu
    else if (subcommand === "send") {
      const panelId = interaction.options.getString("panelid");
      const panel = await TicketPanel.findOne({
        panelId,
        guildId: interaction.guild.id,
      });

      if (!panel) {
        return interaction.reply("Panel not found");
      }

      const row = new ActionRowBuilder();
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`select-ticket-topic_${panelId}`)
        .setPlaceholder("Select a ticket topic");

      panel.topics.forEach((topic) => {
        selectMenu.addOptions({
          label: topic.label,
          description: topic.description,
          value: topic.label.toLowerCase(),
        });
      });

      row.addComponents(selectMenu);

      const embed = new EmbedBuilder()
      .setColor(mConfig.embedColorPrimary)
        .setTitle(panel.title)
        .setDescription(panel.description)
        .setFooter({ text: `Powered By ${client.user.tag}` });

      await interaction.reply({
        embeds: [embed],
        components: [row],
      });
    } else if (subcommand === "edit") {
      const panelId = interaction.options.getString("panelid");
      const adminRole = interaction.options.getRole("adminrole");

      const panel = await TicketPanel.findOne({
        panelId,
        guildId: interaction.guild.id,
        adminRoleId: adminRole.id,
      });

      panel.adminRoleId = adminRole.id;

      await panel.save();

      if (!panel) {
        return interaction.reply("Panel not found");
      }

      const modal = new ModalBuilder()
        .setCustomId(`edit-ticket-panel_${panelId}`)
        .setTitle("Edit Ticket Panel");

      const titleInput = new TextInputBuilder()
        .setCustomId("title")
        .setLabel("Panel Title")
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const descriptionInput = new TextInputBuilder()
        .setCustomId("description")
        .setLabel("Panel Description")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(descriptionInput)
      );

      await interaction.showModal(modal);
    }
  },
};
