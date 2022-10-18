const Channel = require('../models/channel');
const Discord = require('discord.js');

module.exports = {
    name: 'lb',
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
                guildName: channel.guildName,
                highScore: channel.getHighScore(),
            }))
            .sort((a, b) => b.highScore - a.highScore);

        const embed = new Discord.MessageEmbed();

        embed.setColor('#8965d6');
        embed.setTitle('Leaderboard');
        embed.setDescription(
            guilds
                .map(
                    (guild, index) =>
                        `**${index + 1}** ${
                            guild.guildName
                        } - ${new Intl.NumberFormat().format(guild.highScore)}`,
                )
                .join('\n'),
        );

        await interaction.reply({
            embeds: [embed],
        });
    },
};
