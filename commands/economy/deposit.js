const { SlashCommandBuilder } = require("discord.js");
const UserEconomy = require("../../models/userEconomy");
const Economy = require("../../models/economy");
const Guild = require("../../models/guild");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("Deposit money to your bank")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount to deposit")
        .setRequired(true)
    ),

  async execute(client, interaction) {
    const amount = interaction.options.getInteger("amount");

    const guildData = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildData || !guildData.enabledSystems.economy) {
      return interaction.reply({
        content: "This system is disabled! Use `/economy toggle enabled:`",
        ephemeral: true,
      });
    }

    const economyData = await Economy.findOne({
      guildId: interaction.guild.id,
    });

    const userData =
      (await UserEconomy.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id,
      })) ||
      new UserEconomy({
        userId: interaction.user.id,
        guildId: interaction.guild.id,
      });

    if (userData.wallet < amount) {
      return interaction.reply({
        content: "You don't have enough money in your wallet to deposit",
        ephemeral: true,
      });
    }

    userData.wallet -= amount;
    userData.bank += amount;
    await userData.save();

    await interaction.reply(
      `Successfully deposited ${amount} ${economyData.symbol} to your bank`
    );
  },
};
