const Channel = require('../models/channel');
const Discord = require('discord.js');

const formatGuild = (index, guild, bold) => {
    const score = new Intl.NumberFormat().format(guild.score);
    return bold
        ? `**${index}. ${guild.guildName} - ${score}**`
        : `**${index}.** ${guild.guildName} - ${score}`;
};

function ordinal_suffix_of(i) {
    let j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) {
        return i + 'st';
    }
    if (j === 2 && k !== 12) {
        return i + 'nd';
    }
    if (j === 3 && k !== 13) {
        return i + 'rd';
    }
    return i + 'th';
}

module.exports = {
    name: 'leaderboard',
    description: 'Show the high score leaderboard',
    async execute(interaction) {
        const channels = await Channel.find({
            guildName: { $exists: true },
        });
        const guilds = channels
            .map(channel => ({
                guildId: channel.guildId,
                guildName: channel.guildName,
                score: channel.getLastNumber(),
            }))
            .sort((a, b) => b.score - a.score);
        const topGuilds = guilds.slice(0, 10);

        const embed = new Discord.MessageEmbed();

        let description = topGuilds
            .map((guild, index) =>
                formatGuild(
                    index + 1,
                    guild,
                    guild.guildName === interaction.guild.name,
                ),
            )
            .join('\n');

        const index = guilds.findIndex(
            guild => guild.guildId === interaction.guildId,
        );

        if (index + 1 > 10) {
            description +=
                '\n**…**\n' + formatGuild(index + 1, guilds[index], true);
        }

        embed.setColor('#8965d6');
        embed.setTitle('Leaderboard');
        embed.setDescription(description);
        embed.setFooter({
            text: `Ranked ${ordinal_suffix_of(index + 1)} out of ${
                guilds.length
            }.`,
        });

        await interaction.reply({
            embeds: [embed],
        });
    },
};
