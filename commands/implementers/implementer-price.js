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
  license: "partnerships",
  data: new SlashCommandBuilder()
    .setName("implementer-price")
    .setDescription("Sets a new price for an implementer.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The implementer to set a new price for")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option.setName("price").setDescription("The new price").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(client, interaction) {
    const user = interaction.options.getUser("user");
    const newPrice = interaction.options.getNumber("price");

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
      const implementer = await Implementer.findOne({ userId: user.id });

      if (!implementer) {
        return interaction.reply({
          content: "`⚠️` This user is not an implementer.",
          ephemeral: true,
        });
      }

      implementer.price = newPrice;
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
        .setTitle("Price Updated")
        .setColor(mConfig.embedColorSuccess)
        .addFields(
          { name: "User", value: `<@${user.id}> (${user.id})`, inline: false },
          {
            name: "New Price",
            value: `${newPrice} ${partnershipsConfig.currency}`,
            inline: true,
          }
        )
        .setFooter({ text: mConfig.footerText })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error("MongoDB Error:", err);
      interaction.reply({
        content: "❌ Failed to update price.",
        ephemeral: true,
      });
    }
  },
};
