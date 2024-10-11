const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const Guild = require("../../models/guild");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Setup logs and notifications on your server!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create new logs system!")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Messages and notifications channel!")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("edit") 
        .setDescription("Change logs system options!")
        .addChannelOption((option) =>
          option
            .setName("newchannel")
            .setDescription("New messages and notifications channel!")
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction) {
    const guildId = interaction.guild.id;
    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel("channel");
    const newchannel = interaction.options.getChannel("newchannel");

    switch (subcommand) {
      case "create":
        let guildConfig = await Guild.findOne({ guildId });

        if (guildConfig) {
          return interaction.reply({
            content:
              "You have already created logs channel! Want to change? Use `/logs setup channel:`",
            ephemeral: true,
          });
        }

        guildConfig = new Guild({
          guildId,
          logChannelId: channel.id,
        });
        await guildConfig.save();

        await interaction.reply({
          content: `Logs channel has been set to <#${channel.id}>`,
          ephemeral: true,
        });
        break;
      case "edit":
        if (newchannel) {
          let guildConfig = await Guild.findOne({ guildId });

          if (!guildConfig) {
            guildConfig = new Guild({
              guildId,
              logChannelId: newchannel.id,
            });
          }

          guildConfig.logChannelId = newchannel.id;
          await guildConfig.save();

          return interaction.reply({
            content: `New logs channel has been set to <#${newchannel.id}>`,
            ephemeral: true,
          });
        }

        const setupEmbed = new EmbedBuilder()
          .setTitle("Logs System")
          .setDescription("Choose an action to setup a logs system")
          .setColor(mConfig.embedColorPrimary);

        // const join = joinWelcomerButton.createButton();
        // const leave = leaveWelcomerButton.createButton();
        // const cancel = cancelButton.createButton();

        // const row = new ActionRowBuilder().addComponents(join, leave, cancel);
        await interaction.reply({ embeds: [setupEmbed] });
        break;
      default:
        await interaction.reply({
          content: "Invalid subcommand!",
          ephemeral: true,
        });
        break;
    }
  },
};
