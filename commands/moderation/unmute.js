const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Removes timeout from a user")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to unmute").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

  async execute(client, interaction) {
    const user = interaction.options.getUser("user");

    const member = interaction.guild.members.cache.get(user.id);

    try {
      await member.timeout(null);

      await interaction.reply({ content: `User **${user}** has been unmuted`, ephemeral: true });
    } catch (e) {
      console.log(e);
      return interaction.reply({
        content: e.message,
        ephemeral: true,
      });
    }
  },
};
