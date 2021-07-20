const Discord = require('discord.js');
const Channel = require('../models/channel');
const Save = require('../models/save');

module.exports = {
    name: 'me',
    description: 'Get information about yourself',
    async execute(message, args) {
        const channel = await Channel.findOne({
            guildId: message.guild.id,
            channelId: message.channel.id,
        });

        if (!channel) {
            return;
        }

        let user = message.author;

        if (
            args.length > 0 &&
            args[0].startsWith('<@') &&
            args[0].endsWith('>')
        ) {
            let userId = args[0].slice(2, -1);

            if (userId.startsWith('!')) {
                userId = userId.slice(1);
            }

            user = message.client.users.cache.get(userId);

            if (!user) {
                await message.reply('user not found.');
                return;
            }
        }

        let save = await Save.findOne({
            guildId: message.guild.id,
            userId: user.id,
        });

        if (!save) {
            save = new Save({
                saves: 0,
            });
        }

        const embed = new Discord.MessageEmbed();

        embed.setColor('#8965d6');
        embed.setTitle(`Info for ${user.tag}`);
        embed.addField('Saves', save.saves.toFixed(2));
        embed.setFooter(`${message.client.prefix}me`);

        await message.channel.send(embed);
    },
};
