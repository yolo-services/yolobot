const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const Guild = require("../../models/guild");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Setup logs and notifications on your server!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Setup new logs system!")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Messages and notifications channel")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option.setName("archives").setDescription("Tickets archives channel")
        )
        .addChannelOption((option) =>
          option
            .setName("partnerships")
            .setDescription("Partnerhsips notifications channel")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("toggle")
        .setDescription("Enable or disable the entire Logs system")
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Enable or disable the Logs system")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction) {
    const guildId = interaction.guild.id;

    const subcommand = interaction.options.getSubcommand();

    const channel = interaction.options.getChannel("channel");
    const archives = interaction.options.getChannel("archives");
    const partnerships = interaction.options.getChannel("partnerships");

    let guildConfig =
      (await Guild.findOne({ guildId })) || new Guild({ guildId });

    const enabled = interaction.options.getBoolean("enabled");

    if (subcommand !== "toggle" && !guildConfig.enabledSystems.logs) {
      return interaction.reply({
        content: "This system is disabled! Use `/logs toggle enabled:`",
        ephemeral: true,
      });
    }

    if (subcommand === "set") {
      if (channel) guildConfig.logChannelId = channel.id;
      if (archives) guildConfig.archiveChannelId = archives.id;
      if (partnerships) guildConfig.partnershipsLogChannelId = partnerships.id;
      await guildConfig.save();

      await interaction.reply({
        content: `Main logs channel has been set to <#${channel.id}>${
          archives
            ? `, ticket archives channel has been set to <#${archives.id}>`
            : ""
        }${
          partnerships
            ? `, partnerships notifications channel has been set to <#${partnerships.id}>`
            : ""
        }`,
        ephemeral: true,
      });
    } else if (subcommand === "toggle") {
      guildConfig.enabledSystems.logs = enabled;
      await guildConfig.save();

      return interaction.reply({
        content: `The Logs system has been ${enabled ? "enabled" : "disabled"}`,
        ephemeral: true,
      });
    }
  },
};
