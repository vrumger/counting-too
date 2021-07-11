const Discord = require('discord.js');
const Channel = require('../models/channel');
const Save = require('../models/save');

module.exports = {
    name: 'me',
    description: 'Get information about yourself',
    async execute(message) {
        const channel = await Channel.findOne({
            guildId: message.guild.id,
            channelId: message.channel.id,
        });

        if (!channel) {
            return;
        }

        let save = await Save.findOne({
            guildId: message.guild.id,
            userId: message.author.id,
        });

        if (!save) {
            save = new Save({
                saves: 0,
            });
        }

        const embed = new Discord.MessageEmbed();

        embed.setColor('#8965d6');
        embed.setTitle(`Info for ${message.author.tag}`);
        embed.addField('Saves', save.saves.toFixed(2));
        embed.setFooter(`${message.client.prefix}me`);

        await message.channel.send(embed);
    },
};
