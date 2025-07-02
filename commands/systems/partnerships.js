const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const PartnershipSystem = require("../../models/partnershipSystem");
const Guild = require("../../models/guild");

module.exports = {
  license: "partnerships",
  data: new SlashCommandBuilder()
    .setName("partnerships")
    .setDescription("Setup partnerships on your server")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Setup new partnerships system!")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Partnerships main channel")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("Partnerships implementer role")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("default-price")
            .setDescription("Default price per one partnership")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("currency")
            .setDescription("Partnerships balance currency")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("toggle")
        .setDescription("Enable or disable the partnerships system")
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Enable or disable the partnerships system")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction) {
    const guildId = interaction.guild.id;
    const subcommand = interaction.options.getSubcommand();

    const channel = interaction.options.getChannel("channel");
    const role = interaction.options.getRole("role");
    const defaultPrice = interaction.options.getNumber("default-price");
    const currency = interaction.options.getString("currency");

    const enabled = interaction.options.getBoolean("enabled");

    let guildData =
      (await Guild.findOne({ guildId })) || new Guild({ guildId });

    if (subcommand !== "toggle" && !guildData.enabledSystems.partnerships) {
      return interaction.reply({
        content: "This system is disabled! Use `/partnerships toggle enabled:`",
        ephemeral: true,
      });
    }

    if (subcommand === "set") {
      let guildConfig = await PartnershipSystem.findOne({ guildId });

      if (defaultPrice <= 0) {
        return interaction.reply({
          content: "Default price must be higher than 0!",
          ephemeral: true,
        });
      }

      if (!guildConfig) {
        guildConfig = new PartnershipSystem({
          guildId,
          roleId: role.id,
          channelId: channel.id,
          defaultPrice: defaultPrice,
          currency: currency,
        });
      } else {
        guildConfig.channelId = channel.id;
        guildConfig.roleId = role.id;
        guildConfig.defaultPrice = defaultPrice;
        guildConfig.currency = currency;
      }

      await guildConfig.save();

      await interaction.reply({
        content: `Partnerships channel has been set to <#${channel.id}> and currency to \`${currency}\` and implementer role to <@&${role.id}> and default price to \`${defaultPrice}\``,
        ephemeral: true,
      });
    } else if (subcommand === "toggle") {
      guildData.enabledSystems.partnerships = enabled;
      await guildData.save();

      return interaction.reply({
        content: `The partnerships system has been ${
          enabled ? "enabled" : "disabled"
        }`,
        ephemeral: true,
      });
    }
  },
};
