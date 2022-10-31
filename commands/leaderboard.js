const Channel = require('../models/channel');
const Discord = require('discord.js');

const formatGuild = (index, guild, bold) => {
    const score = new Intl.NumberFormat().format(guild.score);
    return bold
        ? `**${index}. ${guild.guildName} - ${score}**`
        : `**${index}.** ${guild.guildName} - ${score}`;
};

module.exports = {
    name: 'leaderboard',
    description: 'Show the high score leaderboard',
    async execute(interaction) {
        await Channel.updateOne(
            { guildId: interaction.guildId },
            { $set: { guildName: interaction.guild.name } },
        );

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

        const inTopTen = topGuilds.some(
            guild => guild.guildName === interaction.guild.name,
        );
        if (!inTopTen) {
            const index = guilds.findIndex(
                guild => guild.guildId === interaction.guildId,
            );

            description +=
                '\n**…**\n' + formatGuild(index + 1, guilds[index], true);
        }

        embed.setColor('#8965d6');
        embed.setTitle('Leaderboard');
        embed.setDescription(description);

        await interaction.reply({
            embeds: [embed],
        });
    },
};
