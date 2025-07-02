const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  userMention,
} = require("discord.js");
const mConfig = require("../../messageConfig.json");
const Implementer = require("../../models/implementer");
const Guild = require("../../models/guild");
const partnershipSystem = require("../../models/partnershipSystem");

module.exports = {
  license: "partnerships",
  data: new SlashCommandBuilder()
    .setName("remove-implementer")
    .setDescription("Removes an implementer from the database by user mention.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to remove as implementer")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(client, interaction) {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members
      .fetch(user.id)
      .catch(() => null);

    let guildData =
      (await Guild.findOne({ guildId: interaction.guild.id })) ||
      new Guild({ guildId: interaction.guild.id });

    if (!guildData.enabledSystems.partnerships) {
      return interaction.reply({
        content: "This system is disabled! Use `/partnerships toggle enabled:`",
        ephemeral: true,
      });
    }

    const partnershipsConfig = await partnershipSystem.findOne({
      guildId: interaction.guild.id,
    });

    if (!partnershipsConfig) {
      return interaction.reply({
        content: "This system is not set up! Use `/partnerships set`",
        ephemeral: true,
      });
    }

    if (!member) {
      return interaction.reply({
        content: "`❌` Could not find that member in this server.",
        ephemeral: true,
      });
    }

    try {
      const existing = await Implementer.findOne({
        userId: user.id,
        guildId: interaction.guild.id,
      });

      if (!existing) {
        return interaction.reply({
          content: "`⚠️` This user is not an implementer in the database.",
          ephemeral: true,
        });
      }

      await Implementer.deleteOne({
        userId: user.id,
        guildId: interaction.guild.id,
      });

      const implementerRoleId = partnershipsConfig.roleId;
      await member.roles.remove(implementerRoleId);

      const embed = new EmbedBuilder()
        .setTitle("Implementer removed")
        .setDescription(
          "The user has been removed from the database and the role was taken away."
        )
        .addFields({
          name: "User",
          value: `${userMention(user.id)} (${user.id})`,
          inline: false,
        })
        .setColor(mConfig.embedColorError)
        .setFooter({ text: mConfig.footerText })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error("MongoDB Error:", err);
      await interaction.reply({
        content: "`❌` Failed to remove implementer from the database.",
        ephemeral: true,
      });
    }
  },
};
