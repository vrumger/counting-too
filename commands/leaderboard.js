const Channel = require('../models/channel');
const Discord = require('discord.js');

const formatGuild = (index, guild, bold) => {
    const score = new Intl.NumberFormat().format(guild.score);
    return bold
        ? `${index}. **${guild.guildName} - ${score}**`
        : `${index}. ${guild.guildName} - ${score}`;
};

// https://stackoverflow.com/a/13627586
const ordinal = index => {
    const lastDigit = index % 10,
        teenTh = index % 100;
    if (lastDigit === 1 && teenTh !== 11) {
        return index + 'st';
    }
    if (lastDigit === 2 && teenTh !== 12) {
        return index + 'nd';
    }
    if (lastDigit === 3 && teenTh !== 13) {
        return index + 'rd';
    }
    return index + 'th';
};

module.exports = {
    name: 'leaderboard',
    description: 'Show the high score leaderboard',
    async execute(interaction) {
        const date = new Date();
        date.setDate(date.getDate() - 7);

        const channels = await Channel.find({
            guildName: { $exists: true },
            lastNumberDate: { $gte: date },
        });
        const guilds = channels
            .map(channel => ({
                guildId: channel.guildId,
                guildName: channel.guildName,
                score: channel.getLastNumber(),
            }))
            .sort((a, b) => b.score - a.score);
        const topGuilds = guilds.slice(0, 10);

        const embed = new Discord.EmbedBuilder();

        let description = topGuilds
            .map((guild, index) =>
                formatGuild(
                    index + 1,
                    guild,
                    guild.guildName === interaction.guild?.name,
                ),
            )
            .join('\n');

        const index = guilds.findIndex(
            guild => guild.guildId === interaction.guildId,
        );
        const rank = ordinal(index + 1);
        const totalGuilds = new Intl.NumberFormat('en-US', {
            notation: 'compact',
        }).format(guilds.length);

        if (index + 1 > 10) {
            description +=
                '\n**…**\n' + formatGuild(index + 1, guilds[index], true);
        }

        embed.setColor('#8965d6');
        embed.setTitle('Leaderboard');
        embed.setDescription(description);
        embed.setFooter({
            text:
                index === -1
                    ? `Total ${totalGuilds}.`
                    : `Ranked ${rank} out of ${totalGuilds}.`,
        });

        await interaction.reply({
            embeds: [embed],
        });
    },
};
