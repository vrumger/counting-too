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
            type: Discord.ApplicationCommandOptionType.User,
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

        const user =
            interaction.options?.getUser('user') ??
            interaction.user ??
            interaction.author;

        let save = await Save.findOne({
            guildId: interaction.guildId,
            userId: user.id,
        });

        if (!save) {
            save = new Save({
                saves: 0,
            });
        }

        const embed = new Discord.EmbedBuilder();

        embed.setColor('#8965d6');
        embed.setThumbnail(user.avatarURL());
        embed.setTitle(`Info for ${user.tag}`);
        embed.addFields([
            {
                name: 'Saves',
                value: save.saves.toFixed(2),
            },
        ]);

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    },
};
