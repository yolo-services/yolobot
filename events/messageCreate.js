const { Events, EmbedBuilder } = require("discord.js");
const UserLevel = require("../models/userLevel");
const Guild = require("../models/guild");
const Leveling = require("../models/leveling");
const Suggestions = require("../models/suggestions");
const mConfig = require("../messageConfig.json");
const partnershipSystem = require("../models/partnershipSystem");
const Partnership = require("../models/partnership");
const Implementer = require("../models/implementer");

const {
  MINIMUM_DAYS_BETWEEN_PARTNERSHIPS,
  PRICE_INCREASE_PER,
  PRICE_INCREASE,
} = require("../data/partnerships");

module.exports = {
  name: Events.MessageCreate,
  async execute(client, message) {
    if (message.author.bot) return;

    const guildData = await Guild.findOne({ guildId: message.guild.id });
    const levelingData = await Leveling.findOne({ guildId: message.guild.id });
    const SuggestionsData = await Suggestions.findOne({
      guildId: message.guild.id,
    });

    const partnershipsConfig = await partnershipSystem.findOne({
      guildId: message.guild.id,
    });

    const member = message.guild.members.cache.get(message.author.id);

    if (
      partnershipsConfig &&
      message.channel.id === partnershipsConfig.channelId &&
      member.roles.cache.has(partnershipsConfig.roleId) &&
      guildData.licenseCode
    ) {
      const partnershipLogChannel = await client.channels.fetch(
        guildData.partnershipsLogChannelId
      );

      const firstMention = message.mentions.users.first();
      if (!firstMention) {
        return message.reply({
          content: "`⚠️` No user mentioned!",
          ephemeral: true,
        });
      }

      const mentionedUserId = firstMention.id;

      const inviteRegex =
        /(https?:\/\/)?(www\.)?(discord\.gg|discord\.com\/invite)\/[a-zA-Z0-9]+/gi;
      const invites = message.content.match(inviteRegex);
      const firstInvite = invites ? invites[0] : null;

      if (!firstInvite) {
        return message.reply({
          content: "`⚠️` No invite link found!",
          ephemeral: true,
        });
      }

      try {
        const threeDaysAgo = new Date(
          Date.now() - MINIMUM_DAYS_BETWEEN_PARTNERSHIPS * 24 * 60 * 60 * 1000
        );

        const recentAd = await Partnership.findOne({
          guildId: message.guild.id,
          invite: firstInvite,
          lastAdvertisedAt: { $gte: threeDaysAgo },
        });

        if (recentAd) {
          message.delete();

          const cooldownEnd = new Date(
            recentAd.lastAdvertisedAt.getTime() +
              MINIMUM_DAYS_BETWEEN_PARTNERSHIPS * 24 * 60 * 60 * 1000
          );
          const cooldownTimestamp = Math.floor(cooldownEnd.getTime() / 1000);

          const embed = new EmbedBuilder()
            .setColor(mConfig.embedColorWarning)
            .setTitle("Advertisement cooldown active!")
            .setDescription(
              `> This server has already been advertised on our server in the **last 3 days**!

              > You can contect to the diferent partnerships implementer of the server you want to advertise.`
            )
            .addFields(
              {
                name: "Invite used",
                value: firstInvite,
                inline: false,
              },
              {
                name: "Next possible advertisement of this server",
                value: `<t:${cooldownTimestamp}:R>`,
                inline: false,
              }
            )
            .setFooter({ text: mConfig.footerText })
            .setTimestamp();

          return await message.author.send({ embeds: [embed] });
        }

        let user = await Implementer.findOne({ userId: message.author.id });

        if (!user) {
          return message.reply({
            content: "`⚠️` This user is not in the implementer database.",
            ephemeral: true,
          });
        }

        const amountToAdd = user.price;
        const newBalance = user.balance + amountToAdd;

        user.balance = Number(newBalance.toFixed(2));

        const newAmount = user.amount + 1;
        user.amount = newAmount;

        if (newAmount % PRICE_INCREASE_PER === 0) {
          const times = Math.floor(newAmount / PRICE_INCREASE_PER);
          const newPrice =
            PRICE_INCREASE * times + partnershipsConfig.defaultPrice;
          user.price = newPrice.toFixed(2);

          const newPriceEmbed = new EmbedBuilder()
            .setTitle("Price Increased")
            .setColor(mConfig.embedColorSuccess)
            .addFields(
              {
                name: "User",
                value: `<@${user.userId}> (${user.userId})`,
                inline: false,
              },
              { name: "New Price", value: `${newPrice} PLN`, inline: true },
              { name: "Times Increased", value: `${times}x`, inline: true }
            )
            .setFooter({ text: mConfig.footerText })
            .setTimestamp();

          await partnershipLogChannel.send({
            embeds: [newPriceEmbed],
            content: `<@${user.userId}>`,
          });
        }

        user.lastAdvertisedAt = new Date();
        user.partnerships.push({
          representiveId: mentionedUserId,
          invite: firstInvite,
          createdAt: new Date(),
          messageId: message.id,
        });

        await user.save();

        const existing = await Partnership.findOne({
          invite: firstInvite,
          guildId: message.guild.id,
        });

        if (existing) {
          existing.messages.push({
            implementerId: user.userId,
            representativeId: mentionedUserId,
            createdAt: new Date(),
            messageId: message.id,
          });

          existing.lastAdvertisedAt = new Date();
          await existing.save();
        } else {
          const newPartnership = new Partnership({
            guildId: message.guild.id,
            invite: firstInvite,
            lastAdvertisedAt: new Date(),
            messages: [
              {
                implementerId: user.userId,
                representativeId: mentionedUserId,
                createdAt: new Date(),
                messageId: message.id,
              },
            ],
          });

          await newPartnership.save();
        }

        const logEmbed = new EmbedBuilder()
          .setColor(mConfig.embedColorSuccess)
          .setTitle("New partnership!")
          .setDescription(`> New partnership made by <@${user.userId}>!`)
          .addFields(
            {
              name: "Invite",
              value: firstInvite,
              inline: false,
            },
            {
              name: "Representative",
              value: `<@${mentionedUserId}>`,
              inline: false,
            },
            {
              name: "New Amount",
              value: `${user.amount}`,
              inline: false,
            },
            {
              name: "New Balance",
              value: `${user.balance} PLN`,
              inline: false,
            }
          )
          .setFooter({ text: mConfig.footerText })
          .setTimestamp();

        await partnershipLogChannel.send({ embeds: [logEmbed] });

        const embed = new EmbedBuilder()
          .setColor(mConfig.embedColorPrimary)
          .setDescription(
            `# \`\`\`${message.guild.name} - NEW PARTNERSHIP\`\`\`
> **Partnership representative:** <@${mentionedUserId}>
> **Invite:** ${firstInvite}

> **Implementer:** <@${user.userId}>
> **New Amount:** \`${user.amount}\`
> **New Balance:** \`${user.balance} ${partnershipsConfig.currency}\`

> _Servers shared in this channel haven’t been checked for legitimacy. We are not responsible for any losses outside of our server!_`
          )
          .setThumbnail(message.author.displayAvatarURL())
          .setFooter({ text: mConfig.footerText })
          .setTimestamp();

        message.reply({ embeds: [embed] });
      } catch (err) {
        console.error("❌ Error while advertising partnership:", err);
        message.reply({
          content: "`❌` An error occurred. Try again later.",
        });
      }
    } else if (
      guildData &&
      guildData.enabledSystems.suggestions &&
      message.channel.id === SuggestionsData.suggestionsChannelId &&
      guildData.licenseCode &&
      guildData.licenseType !== "partnerships"
    ) {
      const suggestionEmbed = new EmbedBuilder()
        .setColor(mConfig.embedColorPrimary)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `\`\`\`${message.guild.name} - SUGGESTION\`\`\`
          > **Suggestion content:**
          \`\`\`${message.content}\`\`\``
        )
        .setFooter({ text: mConfig.footerText })
        .setTimestamp();
      await message.delete();
      await message.channel.send({ embeds: [suggestionEmbed] });
    }

    if (
      guildData &&
      guildData.enabledSystems.level &&
      guildData.licenseCode &&
      guildData.licenseType === "premium"
    ) {
      const xpToAdd = 5;
      const userLevelData =
        (await UserLevel.findOne({
          userId: message.author.id,
          guildId: message.guild.id,
        })) ||
        new UserLevel({ userId: message.author.id, guildId: message.guild.id });

      userLevelData.exp += xpToAdd;
      const requiredXp = userLevelData.level * 100;
      const logChannel = message.guild.channels.cache.get(
        levelingData?.channelId
      );
      const levelChannel = logChannel || message.channel;

      if (userLevelData.exp >= requiredXp) {
        userLevelData.level += 1;
        userLevelData.exp -= requiredXp;

        userLevelData.nextLevelExp = (userLevelData.level + 1) * 100;

        const embed = new EmbedBuilder()
          .setColor(mConfig.embedColorSuccess)
          .setTitle("Level Up!")
          .setDescription(
            `**Congratulations!** ${message.author} leveled up to level **${userLevelData.level}**!`
          )
          .addFields({
            name: "Next Level EXP",
            value: `You now need **${
              (userLevelData.level + 1) * 100
            }** EXP for the next level!`,
          })
          .setFooter({ text: mConfig.footerText })
          .setTimestamp();
        await levelChannel.send({
          embeds: [embed],
          content: `<@${message.author.id}>`,
        });
      }
      await userLevelData.save();
    }
  },
};
