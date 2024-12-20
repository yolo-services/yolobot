const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const Guild = require("../../models/guild");
const Suggestions = require("../../models/suggestions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggestions")
    .setDescription("Setup suggestions on your server")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Setup suggestions system")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("suggestions channel")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("toggle")
        .setDescription("Enable or disable the entire suggestions system")
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Enable or disable the suggestions system")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction) {
    const guildId = interaction.guild.id;
    const subcommand = interaction.options.getSubcommand();

    const channel = interaction.options.getChannel("channel");
    const enabled = interaction.options.getBoolean("enabled");

    let guildData = await Guild.findOne({ guildId: interaction.guild.id });

    if (subcommand !== "toggle" && !guildData.enabledSystems.suggestions) {
      return interaction.reply({
        content: "This system is disabled! Use `/suggestions toggle enabled:`",
        ephemeral: true,
      });
    }

    if (subcommand === "set") {
      let suggestionsConfig = await Suggestions.findOne({ guildId });

      if (!suggestionsConfig) {
        suggestionsConfig = new Suggestions({
          guildId,
          suggestionsChannelId: channel.id,
        });
      }

      suggestionsConfig.suggestionsChannelId = channel.id;
      await suggestionsConfig.save();

      interaction.reply({
        content: `Suggestions channel has been set to <#${channel.id}>`,
        ephemeral: true,
      });
    } else if (subcommand === "toggle") {
      guildData.enabledSystems.suggestions = enabled;
      await guildData.save();

      return interaction.reply({
        content: `The Suggestions system has been ${
          enabled ? "enabled" : "disabled"
        }`,
        ephemeral: true,
      });
    }
  },
};
