const Discord = require('discord.js');
const Channel = require('../models/channel');
const Save = require('../models/save');

module.exports = {
    name: 'me',
    description: 'Get information about yourself',
    options: [
        {
            name: 'user',
            description: 'Get info about a yourself or a different user',
            type: 'USER',
            required: false,
        },
    ],
    async execute(interaction) {
        const channel = await Channel.findOne({
            guildId: interaction.guildId,
        });

        if (!channel) {
            return;
        }

        const user = interaction.options.getUser('user') ?? interaction.user;

        let save = await Save.findOne({
            guildId: interaction.guildId,
            userId: user.id,
        });

        if (!save) {
            save = new Save({
                saves: 0,
            });
        }

        const embed = new Discord.MessageEmbed();

        embed.setColor('#8965d6');
        embed.setThumbnail(user.avatarURL());
        embed.setTitle(`Info for ${user.tag}`);
        embed.addField('Saves', save.saves.toFixed(2));

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    },
};
