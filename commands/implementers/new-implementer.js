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
    .setName("new-implementer")
    .setDescription(
      "Adds a new implementer to the database and gives them the role."
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to add as implementer")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction) {
    const user = interaction.options.getUser("user");
    const guild = interaction.guild;

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

    try {
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (!member) {
        return interaction.reply({
          content: "`❌` Could not find that member in this server.",
          ephemeral: true,
        });
      }

      const existing = await Implementer.findOne({
        userId: user.id,
        guildId: interaction.guild.id,
      });

      if (existing) {
        return interaction.reply({
          content: "`⚠️` This user is already an implementer.",
          ephemeral: true,
        });
      }

      const newEntry = new Implementer({
        userId: user.id,
        guildId: interaction.guild.id,
        price: partnershipsConfig.defaultPrice,
        startPrice: partnershipsConfig.defaultPrice,
      });
      await newEntry.save();

      const implementerRoleId = partnershipsConfig.roleId;
      await member.roles.add(implementerRoleId);

      const embed = new EmbedBuilder()
        .setTitle("Implementer Added")
        .setDescription(
          "User has been added to the database and assigned the role."
        )
        .addFields({
          name: "User",
          value: `<@${user.id}> (${user.id})`,
          inline: false,
        })
        .setColor(mConfig.embedColorSuccess)
        .setFooter({ text: mConfig.footerText })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error("MongoDB Error:", err);
      await interaction.reply({
        content: "`❌` Failed to save implementer to the database.",
        ephemeral: true,
      });
    }
  },
};
