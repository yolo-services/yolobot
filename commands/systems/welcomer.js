const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Welcomer = require("../../models/welcomer");
const mConfig = require("../../messageConfig.json");

const joinWelcomerButton = require("../../components/buttons/joinWelcomerButton");
const leaveWelcomerButton = require("../../components/buttons/leaveWelcomerButton");
const cancelButton = require("../../components/buttons/cancelButton");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcomer")
    .setDescription("Setup welcome and leave notifications on your server")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("create new welcomer system")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("messages and notifications channel")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("change welcomer system options!")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("New messages and notifications channel!")
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction) {
    const guildId = interaction.guild.id;
    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel("channel");

    if (subcommand === "create") {
      let welcomerConfig = await Welcomer.findOne({ guildId });

      if (welcomerConfig) {
        return interaction.reply({
          content:
            "You have already created welcomer channel! Want to change? Use `/welcomer setup channel:`",
          ephemeral: true,
        });
      }

      welcomerConfig = new Welcomer({
        guildId,
        welcomerChannelId: channel.id,
      });
      await welcomerConfig.save();

      await interaction.reply({
        content: `Welcomer channel has been set to ${channel.name}`,
        ephemeral: true,
      });
    } else if (subcommand === "setup") {
      if (channel) {
        let welcomerConfig = await Welcomer.findOne({ guildId });

        if (!welcomerConfig) {
          welcomerConfig = new Welcomer({
            guildId,
            welcomerChannelId: channel.id,
          });
        }

        welcomerConfig.welcomerChannelId = channel.id;
        await welcomerConfig.save();

        return interaction.reply({
          content: `New welcomer channel has been set to <#${channel.id}>`,
          ephemeral: true,
        });
      }
      const setupEmbed = new EmbedBuilder()
        .setTitle("Welcomer System")
        .setDescription("Choose an action to setup a new messages")
        .setColor(mConfig.embedColorPrimary);

      const join = joinWelcomerButton.createButton();
      const leave = leaveWelcomerButton.createButton();
      const cancel = cancelButton.createButton();

      const row = new ActionRowBuilder().addComponents(join, leave, cancel);
      await interaction.reply({ embeds: [setupEmbed], components: [row] });
    }
  },
};
