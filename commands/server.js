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

        const embed = new Discord.MessageEmbed();

        embed.setColor('#8965d6');
        embed.setTitle(`Info for ${interaction.guild.name}`);
        embed.addField('Current number', channel.lastNumber.toString());
        embed.addField('Guild saves', channel.guildSaves.toFixed(3));
        embed.addField(
            'Last counted by',
            channel.userId ? `<@${channel.userId}>` : 'N/A',
        );
        embed.addField(
            'High score',
            `${channel.highScore} (${timeago.format(channel.highScoreDate)})`,
        );

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    },
};
