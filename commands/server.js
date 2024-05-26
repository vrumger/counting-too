const timeago = require('timeago.js');
const Discord = require('discord.js');
const Channel = require('../models/channel');

module.exports = {
    name: 'server',
    description: 'Get counting stats for the current server',
    async execute(interaction) {
        const channel = await Channel.findOne({
            guildId: interaction.guildId,
        });

        if (!channel) {
            return;
        }

        const embed = new Discord.EmbedBuilder();

        embed.setColor('#8965d6');
        embed.setTitle(`Info for ${interaction.guild.name}`);
        embed.addFields([
            {
                name: 'Current number',
                value: channel.getLastNumber().toString(),
            },
            {
                name: 'Guild saves',
                value: channel.guildSaves.toFixed(3),
            },
            {
                name: 'Last counted by',
                value: channel.userId ? `<@${channel.userId}>` : 'N/A',
            },
            {
                name: 'High score',
                value: `${channel.getHighScore()} (${timeago.format(
                    channel.highScoreDate,
                )})`,
            },
        ]);

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    },
};
