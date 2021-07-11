const Discord = require('discord.js');
const Channel = require('../models/channel');

module.exports = {
    name: 'server',
    description: 'Get counting stats for the current server',
    async execute(message) {
        const channel = await Channel.findOne({
            guildId: message.guild.id,
            channelId: message.channel.id,
        });

        if (!channel) {
            return;
        }

        const embed = new Discord.MessageEmbed();

        embed.setColor('#8965d6');
        embed.setTitle(`Info for ${message.guild.name}`);
        embed.addField('Current number', channel.lastNumber);
        embed.addField('Last counted by', `<@${channel.userId}>`);
        embed.addField(
            'High score',
            `${channel.highScore} (${channel.highScoreDate.toDateString()})`,
        );
        embed.setFooter(`${message.client.prefix}server`);

        await message.channel.send(embed);
    },
};
