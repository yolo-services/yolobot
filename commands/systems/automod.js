const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const AutoMod = require("../../models/automod");
const Guild = require("../../models/guild");
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
        .setName("domains")
        .setDescription("Change AutoMod linkRemover system options")
        .addStringOption((option) =>
          option
            .setName("allowedlink")
            .setDescription("New Allowed link url for linkRemover in automod")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("words")
        .setDescription("Change AutoMod wordCensorship system options")
        .addStringOption((option) =>
          option
            .setName("bannedword")
            .setDescription("New Banned word for wordCensorship in automod")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("feature")
        .setDescription("Enable or disable a specific auto mod feature.")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of the feature to enable or disable.")
            .setRequired(true)
            .addChoices(
              { name: "Link Remover", value: "linkRemover" },
              { name: "Anti Spam", value: "antiSpam" },
              { name: "Word Censorship", value: "wordCensorship" },
              { name: "Caps Lock Detector", value: "capsLockDetector" },
              { name: "Emoji Manager", value: "emojiManager" }
            )
        )
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Set the feature to enabled or disabled.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("toggle")
        .setDescription("Enable or disable the entire AutoMod system")
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Enable or disable the AutoMod system")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction) {
    const guildId = interaction.guild.id;
    const subcommand = interaction.options.getSubcommand();

    const channel = interaction.options.getChannel("channel");
    const allowedlink = interaction.options.getString("allowedlink");

    const bannedword = interaction.options.getString("bannedword");

    const featureName = interaction.options.getString("name");
    const enabled = interaction.options.getBoolean("enabled");

    let guildData = await Guild.findOne({ guildId });

    if (subcommand !== "toggle" && !guildData.enabledSystems.autoMod) {
      return interaction.reply(
        "This system is disabled! Use `/automod toggle enabled:`"
      );
    }

    if (subcommand === "create") {
      let guildConfig = await AutoMod.findOne({ guildId });

      if (guildConfig) {
        return interaction.reply({
          content:
            "AutoMod is already set up for this server! Want to edit? Use `/automod edit`",
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
    } else if (subcommand === "domains") {
      let guildConfig = await AutoMod.findOne({ guildId });

      if (!guildConfig) {
        return interaction.reply({
          content:
            "AutoMod is not set up for this server! Use `/automod create`",
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
    } else if (subcommand === "words") {
      let guildConfig = await AutoMod.findOne({ guildId });

      if (!guildConfig) {
        return interaction.reply({
          content:
            "AutoMod is not set up for this server! Use `/automod create`",
          ephemeral: true,
        });
      }

      if (guildConfig.bannedWords.includes(bannedword)) {
        return interaction.reply({
          content: `Word **${bannedword}** is already on the list of banned words`,
          ephemeral: true,
        });
      }

      guildConfig.bannedWords.push(bannedword);
      await guildConfig.save();

      await interaction.reply({
        content: `Word **${bannedword}** has been added to the list of banned words`,
        ephemeral: true,
      });
    } else if (subcommand === "feature") {
      const autoModData = await AutoMod.findOne({
        guildId: interaction.guild.id,
      });

      if (!autoModData) {
        return interaction.reply(
          "AutoMod is not set up for this server! Use `/automod create`"
        );
      }

      autoModData.enabledFeatures[featureName] = enabled;
      await autoModData.save();

      return interaction.reply({
        content: `The feature **${featureName}** has been set to \`${enabled}\``,
        ephemeral: true,
      });
    } else if (subcommand === "toggle") {
      guildData.enabledSystems.autoMod = enabled;
      await guildData.save();

      return interaction.reply(
        `The AutoMod system has been ${enabled ? "enabled" : "disabled"}.`
      );
    }
  },
};
