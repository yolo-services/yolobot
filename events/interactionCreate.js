const { Events, EmbedBuilder } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const config = require("../config.json");
const mConfig = require("../messageConfig.json");
const Guild = require("../models/guild");
const Welcomer = require("../models/welcomer");
const RolePanel = require("../models/rolePanel");

const allowedGuilds = config.allowedGuilds;
const allowedChannels = config.allowedChannels;
const isDevMode = config.devMode === true;

module.exports = {
  name: Events.InteractionCreate,
  async execute(client, interaction) {
    if (isDevMode && !allowedGuilds.includes(interaction.guild.id)) {
      return interaction.reply({
        content: "This command can only be used on allowed servers.",
        ephemeral: true,
      });
    }

    if (!allowedChannels.includes(interaction.channel.id)) {
      return interaction.reply({
        content: "This command can only be used in specific channels.",
        ephemeral: true,
      });
    }

    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        return interaction.reply({
          content: `\`${interaction.commandName}\` is not a command!`,
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
      if (interaction.customId.startsWith("selfrole")) {
        const roleId = interaction.customId.split("_")[1];
        const role = interaction.guild.roles.cache.get(roleId);

        if (role) {
          const member = interaction.guild.members.cache.get(
            interaction.user.id
          );
          if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
            return interaction.reply({
              content: `Role <@${role.id}> removed!`,
              ephemeral: true,
            });
          } else {
            await member.roles.add(roleId);
            return interaction.reply({
              content: `Role <@${role.id}> added!`,
              ephemeral: true,
            });
          }
        }
      }
      const button = client.buttons.get(interaction.customId);

      if (!button) {
        return await interaction.reply({
          content: "This button does not have an associated action.",
          ephemeral: true,
        });
      }

      await button.execute(interaction);
    } else if (interaction.isModalSubmit()) {
      const { customId } = interaction;
      const guildConfig = await Guild.findOne({
        guildId: interaction.guild.id,
      });
      const welcomerConfig = await Welcomer.findOne({
        guildId: interaction.guild.id,
      });

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
        const footer = interaction.fields.getTextInputValue("welcomerFooter");

        const guildId = interaction.guild.id;

        let farewellData = await Welcomer.findOne({ guildId });
        if (!farewellData) {
          return interaction.reply({
            content:
              "Welcomer System has not found. Want to create a new Welcomer System Setup? Use `/welcomer create channel:`",
            ephemeral: true,
          });
        }

        farewellData.farewellMessage.title = title || "Goodbye!";
        farewellData.farewellMessage.body = message || "Sad to see you go.";
        farewellData.farewellMessage.footer =
          footer || "We hope to see you again.";

        await farewellData.save();

        const embed = new EmbedBuilder()
          .setTitle("Welcomer System")
          .setDescription("Sucessfully saved new leave messages")
          .setColor(mConfig.embedColorSuccess);

        await interaction.reply({ embeds: [embed] });
      } else if (customId === "modal-join-welcomer") {
        const message = interaction.fields.getTextInputValue("welcomerMessage");
        const title = interaction.fields.getTextInputValue("welcomerTitle");
        const footer = interaction.fields.getTextInputValue("welcomerFooter");

        const guildId = interaction.guild.id;

        let welcomeData = await Welcomer.findOne({ guildId });
        if (!welcomeData) {
          return interaction.reply({
            content:
              "Welcomer System has not found. Want to create a new Welcomer System Setup? Use `/welcomer create channel:`",
            ephemeral: true,
          });
        }

        welcomeData.welcomeMessage.title = title || "Welcome!";
        welcomeData.welcomeMessage.body =
          message || "Hello {user}, welcome to the server!";
        welcomeData.welcomeMessage.footer = footer || "Enjoy your stay!";

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
      } else {
        await interaction.reply({
          content: "This modal is not recognized.",
          ephemeral: true,
        });
      }
    }
  },
};
