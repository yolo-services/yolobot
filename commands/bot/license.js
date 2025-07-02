const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const mConfig = require("../../messageConfig.json");

const License = require("../../models/license");
const Guild = require("../../models/guild");
const { getLicenseEmoji } = require("../../utils/getLicenseEmoji");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("license")
    .setDescription("Manage your bot license")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("realize")
        .setDescription("Realize a license for your server")
        .addStringOption((option) =>
          option
            .setName("code")
            .setDescription("License code")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("info").setDescription("Get info about your license")
    ),
  async execute(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    const code = interaction.options.getString("code");

    if (subcommand === "realize") {
      const guildId = interaction.guild.id;
      const guild = await Guild.findOne({ guildId });
      const guildCode = await License.findOne({ code: guild.licenseCode });

      if (guild.licenseCode && guildCode) {
        return interaction.reply({
          content: "This server already has a license.",
          ephemeral: true,
        });
      } else if (guild.licenseCode && !guildCode) {
        return interaction.reply({
          content:
            "This server already has a license but the license code does not exist. Probably got deleted by bot managment. Please contact the bot support team.",
          ephemeral: true,
        });
      }

      const license = await License.findOne({ code });

      if (!license) {
        return interaction.reply({
          content: "This license code does not exist.",
          ephemeral: true,
        });
      }

      if (license.realized) {
        return interaction.reply({
          content: "This license has already been realized.",
          ephemeral: true,
        });
      }

      license.realized = true;
      license.realizedAt = Date.now();
      license.guildId = guildId;
      license.realizedById = interaction.user.id;
      await license.save();

      guild.licenseCode = code;
      guild.licenseType = license.type;

      await guild.save();

      return interaction.reply({
        content: "License realized successfully!",
        ephemeral: true,
      });
    } else if (subcommand === "info") {
      const guildId = interaction.guild.id;
      const guild = await Guild.findOne({ guildId });
      const guildCode = await License.findOne({ code: guild.licenseCode });

      if (!guild.licenseCode) {
        return interaction.reply({
          content: "This server does not have a license.",
          ephemeral: true,
        });
      }

      if (guild.licenseCode && !guildCode) {
        return interaction.reply({
          content:
            "Your license code does not exist. Probably got deleted by bot managment. Please contact the bot support team.",
          ephemeral: true,
        });
      }

      const license = await License.findOne({
        guildId: guildId,
        code: guild.licenseCode,
      });
      if (!license) {
        return interaction.reply({
          content: "This license does not exist.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(mConfig.embedColorPrimary)
        .setTitle("License Info")
        .addFields(
          {
            name: "License code",
            value: `\`${license.code}\``,
          },
          {
            name: "License type",
            value: `${getLicenseEmoji(license.type)}`,
          },
          {
            name: "Realized at",
            value: `<t:${Math.floor(license.realizedAt.getTime() / 1000)}:f>`,
          },
          {
            name: "Realized by",
            value: `<@${license.realizedById}> (${license.realizedById})`,
          }
        )
        .setFooter({ text: mConfig.footerText })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  },
};
