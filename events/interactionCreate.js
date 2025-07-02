const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const mConfig = require("../messageConfig.json");

const Guild = require("../models/guild");
const Welcomer = require("../models/welcomer");
const RolePanel = require("../models/rolePanel");
const TicketPanel = require("../models/ticketPanel");
const Giveaway = require("../models/giveaway");

const { getImplementerInfoEmbed } = require("../data/messages/implementerinfo");
const {
  getPartnershipsRequirementsEmbed,
} = require("../data/messages/partnershipsRequirements");
const { createTicket } = require("../utils/createTicket");

module.exports = {
  name: Events.InteractionCreate,
  async execute(client, interaction) {
    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });

    if (!guildConfig && !interaction.isCommand()) {
      return interaction.reply({
        content: "This server is not configured.",
        ephemeral: true,
      });
    }

    if (!guildConfig?.licenseCode && !interaction.isCommand()) {
      return interaction.reply({
        content: "This server does not have a license for this using this bot.",
        ephemeral: true,
      });
    }

    const { customId } = interaction;

    console.log("Interaction ID:", customId);

    const bypassLicenseCommands = [
      "fix-guild-database",
      "license",
      "ping",
      "help",
      "botinfo",
    ];
    const bypassServerConfigCommands = [
      "fix-guild-database",
      "fix-guild-database",
      "help",
      "botinfo",
    ];

    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        return interaction.reply({
          content: `\`${interaction.commandName}\` is not a command!`,
          ephemeral: true,
        });
      }

      if (
        !guildConfig &&
        !bypassServerConfigCommands.includes(command.data.name)
      ) {
        return interaction.reply({
          content: "This server is not configured.",
          ephemeral: true,
        });
      }

      if (
        !guildConfig?.licenseCode &&
        !bypassLicenseCommands.includes(command.data.name)
      ) {
        return interaction.reply({
          content: "This server does not have a license for using this bot.",
          ephemeral: true,
        });
      }

      const commandLicense = command.license || "standard";

      if (
        commandLicense !== guildConfig?.licenseType &&
        !bypassLicenseCommands.includes(command.data.name) &&
        guildConfig.licenseType !== "premium"
      ) {
        return interaction.reply({
          content: "This command is not available for this server.",
          ephemeral: true,
        });
      }

      try {
        await command.execute(client, interaction);
      } catch (e) {
        console.log(e);
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    } else if (interaction.isButton()) {
      if (customId.startsWith("selfrole")) {
        const roleId = interaction.customId.split("_")[1];
        const role = interaction.guild.roles.cache.get(roleId);

        if (role) {
          const member = interaction.guild.members.cache.get(
            interaction.user.id
          );
          if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
            return interaction.reply({
              content: `Role <@&${role.id}> removed!`,
              ephemeral: true,
            });
          } else {
            await member.roles.add(roleId);
            return interaction.reply({
              content: `Role <@&${role.id}> added!`,
              ephemeral: true,
            });
          }
        }
      } else if (customId === "close-ticket") {
        const modal = new ModalBuilder()
          .setCustomId("close-ticket_modal")
          .setTitle("Close Ticket");

        const reasonInput = new TextInputBuilder()
          .setCustomId("close-ticket_reason")
          .setLabel("Reason for closing the ticket")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("Enter your reason")
          .setRequired(false);

        const row = new ActionRowBuilder().addComponents(reasonInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
      } else if (interaction.customId.startsWith("giveaway-join")) {
        const giveawayId = interaction.customId.split("_")[1];
        const giveaway = await Giveaway.findOne({ giveawayId });

        if (!giveaway || !giveaway.isActive) {
          return interaction.reply({
            content: "This giveaway is no longer active.",
            ephemeral: true,
          });
        }

        if (giveaway.participants.includes(interaction.user.id)) {
          return interaction.reply({
            content: "You have already joined this giveaway!",
            ephemeral: true,
          });
        }

        giveaway.participants.push(interaction.user.id);
        await giveaway.save();

        return interaction.reply({
          content: "You have successfully joined the giveaway!",
          ephemeral: true,
        });
      } else {
        const button = client.buttons.get(customId);

        if (!button) {
          return await interaction.reply({
            content: "This button does not have an associated action.",
            ephemeral: true,
          });
        }

        await button.execute(interaction);
      }
    } else if (interaction.isModalSubmit()) {
      if (customId.startsWith("modal-ban-")) {
        const user = customId.split("-")[2];
        const cleanUserId = user.replace(/<@!?(\d+)>/, "$1");
        if (!/^\d{17,19}$/.test(cleanUserId)) {
          return await interaction.reply({
            content: "Invalid user ID provided.",
            ephemeral: true,
          });
        }

        const reason = interaction.fields.getTextInputValue("reasonInput");

        const guild = interaction.guild;
        const member = await guild.members.fetch(cleanUserId);
        await member.ban({ reason });

        await interaction.reply({
          content: `User <@${cleanUserId}> has been banned for: ${reason}`,
          ephemeral: true,
        });
      } else if (customId.startsWith("modal-kick-")) {
        const user = customId.split("-")[2];
        const cleanUserId = user.replace(/<@!?(\d+)>/, "$1");
        if (!/^\d{17,19}$/.test(cleanUserId)) {
          return await interaction.reply({
            content: "Invalid user ID provided.",
            ephemeral: true,
          });
        }

        const reason = interaction.fields.getTextInputValue("reasonInput");

        const guild = interaction.guild;
        const member = await guild.members.fetch(cleanUserId);
        await member.kick(reason);

        await interaction.reply({
          content: `User <@${cleanUserId}> has been kicked for: ${reason}`,
          ephemeral: true,
        });
      } else if (customId === "modal-leave-welcomer") {
        const message = interaction.fields.getTextInputValue("welcomerMessage");
        const title = interaction.fields.getTextInputValue("welcomerTitle");
        const image = interaction.fields.getTextInputValue("welcomerImage");
        const footer = interaction.fields.getTextInputValue("welcomerFooter");
        const color = interaction.fields.getTextInputValue("welcomerColor");
        const userFieldTitle =
          interaction.fields.getTextInputValue("userFieldTitle");

        const guildId = interaction.guild.id;

        let farewellData = await Welcomer.findOne({ guildId });
        if (!farewellData) {
          return interaction.reply({
            content: "Welcomer System has not found.",
            ephemeral: true,
          });
        }

        farewellData.farewellMessage.title = title || "Goodbye!";
        farewellData.farewellMessage.body = message || "Sad to see you go.";
        farewellData.farewellMessage.image = image;
        farewellData.farewellMessage.footer = footer;
        farewellData.farewellMessage.color = color;
        farewellData.farewellMessage.userFieldTitle = userFieldTitle || "User";

        await farewellData.save();

        const embed = new EmbedBuilder()
          .setTitle("Welcomer System")
          .setDescription("Sucessfully saved new leave messages")
          .setColor(mConfig.embedColorSuccess);

        await interaction.reply({ embeds: [embed] });
      } else if (customId === "modal-join-welcomer") {
        const message = interaction.fields.getTextInputValue("welcomerMessage");
        const title = interaction.fields.getTextInputValue("welcomerTitle");
        const image = interaction.fields.getTextInputValue("welcomerImage");
        const footer = interaction.fields.getTextInputValue("welcomerFooter");
        const color = interaction.fields.getTextInputValue("welcomerColor");
        const userFieldTitle =
          interaction.fields.getTextInputValue("userFieldTitle");

        const guildId = interaction.guild.id;

        let welcomeData = await Welcomer.findOne({ guildId });
        if (!welcomeData) {
          return interaction.reply({
            content: "Welcomer System has not found.",
            ephemeral: true,
          });
        }

        welcomeData.welcomeMessage.title = title || "Welcome!";
        welcomeData.welcomeMessage.body = message || "Welcome to the server!";
        welcomeData.welcomeMessage.image = image;
        welcomeData.welcomeMessage.footer = footer;
        welcomeData.welcomeMessage.color = color;
        farewellData.welcomeMessage.userFieldTitle = userFieldTitle || "User";

        await welcomeData.save();

        const embed = new EmbedBuilder()
          .setTitle("Welcomer System")
          .setDescription("Sucessfully saved new join messages")
          .setColor(mConfig.embedColorSuccess);

        await interaction.reply({ embeds: [embed] });
      } else if (customId.startsWith("edit-panel")) {
        const panelId = customId.split("_")[1];
        const panel = await RolePanel.findOne({
          panelId,
          guildId: interaction.guild.id,
        });

        if (!panel) {
          return interaction.reply({
            content: "Panel not found.",
            ephemeral: true,
          });
        }

        const newTitle =
          interaction.fields.getTextInputValue("title") || panel.title;
        const newDescription =
          interaction.fields.getTextInputValue("description") ||
          panel.description;

        panel.title = newTitle;
        panel.description = newDescription;
        await panel.save();

        await interaction.reply({
          content: `Panel \`${panelId}\` updated successfully!`,
          ephemeral: true,
        });
      } else if (customId.startsWith("edit-ticket-panel")) {
        const panelId = customId.split("_")[1];
        const panel = await TicketPanel.findOne({
          panelId,
          guildId: interaction.guild.id,
        });

        if (!panel) {
          return interaction.reply({
            content: "Panel not found",
            ephemeral: true,
          });
        }

        const newTitle =
          interaction.fields.getTextInputValue("title") || panel.title;
        const newDescription =
          interaction.fields.getTextInputValue("description") ||
          panel.description;

        panel.title = newTitle;
        panel.description = newDescription;
        await panel.save();

        await interaction.reply({
          content: `Panel \`${panelId}\` updated successfully!`,
          ephemeral: true,
        });
      } else if (customId === "close-ticket_modal") {
        const reason =
          interaction.fields.getTextInputValue("close-ticket_reason") ||
          "No reason privided";
        const ticketChannel = interaction.channel;
        const guild = await Guild.findOne({ guildId: interaction.guild.id });
        const user = interaction.guild.members.cache.find(
          (member) => member.user.username === ticketChannel.name.split("-")[1]
        );

        await interaction.reply({
          content: "Closing Ticket ...",
          aphemeral: true,
        });

        await ticketChannel.delete();

        if (guild.archiveChannelId) {
          const archiveChannel = interaction.guild.channels.cache.get(
            guild.archiveChannelId
          );

          const closeEmbed = new EmbedBuilder()
            .setColor(mConfig.embedColorError)
            .setTitle("Ticket Closed")
            .addFields(
              {
                name: "Opened by:",
                value: `${user}`,
              },
              {
                name: "Closed by:",
                value: `${interaction.user}`,
              },
              { name: "Reason:", value: `${reason}` }
            )
            .setTimestamp();

          await archiveChannel.send({ embeds: [closeEmbed] });
        }
      } else if (interaction.customId === "embed-modal") {
        const title = interaction.fields.getTextInputValue("embedTitle");
        const description =
          interaction.fields.getTextInputValue("embedDescription");
        const color =
          interaction.fields.getTextInputValue("embedColor") ||
          mConfig.embedColorPrimary;
        const thumbnail =
          interaction.fields.getTextInputValue("embedThumbnail") || null;
        const footer =
          interaction.fields.getTextInputValue("embedFooter") || null;

        const embed = new EmbedBuilder();

        if (title) {
          embed.setTitle(title);
        }

        if (description) {
          embed.setDescription(description);
        }

        if (color) {
          embed.setColor(color);
        }

        if (thumbnail) {
          embed.setThumbnail(thumbnail);
        }

        if (footer) {
          embed.setFooter({ text: footer });
        }

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({
          content: "Embed sent successfully!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "This modal is not recognized",
          ephemeral: true,
        });
      }
    } else if (interaction.isStringSelectMenu()) {
      if (interaction.customId.startsWith("select-ticket-topic")) {
        await interaction.deferReply({ ephemeral: true });
        await createTicket(interaction);
      } else if (interaction.customId === "partnerships-info-topic-select") {
        await interaction.deferReply({ ephemeral: true });

        if (
          interaction.values[0] === "apply-implementer" ||
          interaction.values[0] === "payout-partnerships"
        ) {
          await createTicket(interaction);
        } else if (interaction.values[0] === "implementer-info") {
          const embed = await getImplementerInfoEmbed(
            interaction.user,
            interaction
          );

          if (!embed) {
            return interaction.editReply({
              content: "`⚠️` This user is not in the implementer database.",
              ephemeral: true,
            });
          }

          await interaction.editReply({ embeds: [embed] });
        } else if (interaction.values[0] === "partnerships-requirements") {
          const embed = await getPartnershipsRequirementsEmbed(interaction);
          return interaction.editReply({ embeds: [embed] });
        }
      }
    }
  },
};
