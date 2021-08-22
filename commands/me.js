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

        if (args.length > 0) {
            const match = args[0].match(/^(?:<@!?(\d+)>|(\d+))$/);

            if (match) {
                const userId = match[1] ?? match[2];

                user = message.client.users.cache.get(userId);

                if (!user) {
                    await message.reply('user not found.');
                    return;
                }
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
