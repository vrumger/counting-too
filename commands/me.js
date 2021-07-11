const Discord = require('discord.js');
const Save = require('../models/save');

module.exports = {
    name: 'me',
    description: 'Get information about yourself',
    async execute(message) {
        const save = await Save.findOne({
            guildId: message.guild.id,
            userId: message.author.id,
        });

        const embed = new Discord.MessageEmbed();

        embed.setColor('#8965d6');
        embed.setTitle(`Info for ${message.author.tag}`);
        embed.addField('Saves', save.saves.toFixed(2));
        embed.setFooter(`${message.client.prefix}me`);

        await message.channel.send(embed);
    },
};
