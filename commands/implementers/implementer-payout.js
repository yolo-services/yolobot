const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const mConfig = require("../../messageConfig.json");
const Implementer = require("../../models/implementer");
const Guild = require("../../models/guild");
const partnershipSystem = require("../../models/partnershipSystem");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("implementer-payout")
    .setDescription("Processes a payout for an implementer.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The implementer to payout")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount to payout")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(client, interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getNumber("amount");

    let guildData =
      (await Guild.findOne({ guildId: interaction.guild.id })) ||
      new Guild({ guildId: interaction.guild.id });

    if (!guildData.enabledSystems.partnerships) {
      return interaction.reply({
        content: "This system is disabled! Use `/partnerships toggle enabled:`",
        ephemeral: true,
      });
    }

    try {
      const implementer = await Implementer.findOne({
        userId: user.id,
        guildId: interaction.guild.id,
      });

      if (!implementer) {
        return interaction.reply({
          content: "`⚠️` This user is not an implementer.",
          ephemeral: true,
        });
      }

      if (implementer.balance < amount) {
        return interaction.reply({
          content: "`💸` Not enough balance for this payout.",
          ephemeral: true,
        });
      }

      implementer.balance -= amount;
      implementer.lastPayout = new Date();
      await implementer.save();

      const partnershipsConfig = await partnershipSystem.findOne({
        guildId: interaction.guild.id,
      });

      if (!partnershipsConfig) {
        return interaction.reply({
          content: "This system is not set up! Use `/partnerships set`",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("Payout Processed")
        .setColor(mConfig.embedColorSuccess)
        .addFields(
          { name: "User", value: `<@${user.id}> (${user.id})`, inline: false },
          {
            name: "Amount",
            value: `${amount} ${partnershipsConfig.currency}`,
            inline: true,
          },
          {
            name: "New Balance",
            value: `${implementer.balance} ${partnershipsConfig.currency}`,
            inline: true,
          },
          {
            name: "Payout Date",
            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
            inline: false,
          }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error("MongoDB Error:", err);
      interaction.reply({
        content: "❌ Failed to process payout.",
        ephemeral: true,
      });
    }
  },
};
