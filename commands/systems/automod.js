const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const AutoMod = require("../../models/automod");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("automod")
    .setDescription("Setup automod on your server")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create new automod system!")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("AutoMod notifications channel")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("edit")
        .setDescription("Change AutoMod system options")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("New AutoMod notifications channel")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("links")
        .setDescription("Change AutoMod system options")
        .addStringOption((option) =>
          option
            .setName("allowedlink")
            .setDescription("New Allowed link url for antylink in automod")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction) {
    const guildId = interaction.guild.id;
    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel("channel");
    const allowedlink = interaction.options.getString("allowedlink");

    if (subcommand === "create") {
      let guildConfig = await AutoMod.findOne({ guildId });

      if (guildConfig) {
        return interaction.reply({
          content:
            "You have already created automod system! Want to edit? Use `/automod edit`",
          ephemeral: true,
        });
      }

      guildConfig = new AutoMod({
        guildId,
        channelId: channel.id,
        domains: [],
      });
      await guildConfig.save();

      await interaction.reply({
        content: `Logs channel has been set to <#${channel.id}>`,
        ephemeral: true,
      });
    } else if (subcommand === "edit") {
      let guildConfig = await AutoMod.findOne({ guildId });

      if (!guildConfig) {
        guildConfig = new AutoMod({
          guildId,
          channelId: channel.id,
          domains: [],
        });
      }

      guildConfig.channelId = channel.id;
      await guildConfig.save();

      await interaction.reply({
        content: `New AutoMod channel has been set to <#${channel.id}>`,
        ephemeral: true,
      });
    } else if (subcommand === "links") {
      let guildConfig = await AutoMod.findOne({ guildId });

      if (!guildConfig) {
        return interaction.reply({
          content:
            "You have not created automod system yet! Use `/automod create`",
          ephemeral: true,
        });
      }

      if (guildConfig.domains.includes(allowedlink)) {
        return interaction.reply({
          content: `Domain **${allowedlink}** is already on the list of allowed domains`,
          ephemeral: true,
        });
      }

      guildConfig.domains.push(allowedlink);
      await guildConfig.save();

      await interaction.reply({
        content: `Domain **${allowedlink}** has been added to the list of allowed domains`,
        ephemeral: true,
      });
    }
  },
};
