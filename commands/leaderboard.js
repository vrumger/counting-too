const Channel = require('../models/channel');
const Discord = require('discord.js');

module.exports = {
    name: 'leaderboard',
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
                score: channel.getLastNumber(),
            }))
            .sort((a, b) => b.score - a.score);
        const topGuilds = guilds.slice(0, 10);

        const embed = new Discord.MessageEmbed();

        let description = topGuilds
            .map((guild, index) =>
                guild.guildName === interaction.guild.name
                    ? `**${index + 1}. ${
                          guild.guildName
                      } - ${new Intl.NumberFormat().format(guild.score)}**`
                    : `**${index + 1}.** ${
                          guild.guildName
                      } - ${new Intl.NumberFormat().format(guild.score)}`,
            )
            .join('\n');

        const inTopTen = topGuilds.some(
            guild => guild.guildName === interaction.guild.name,
        );
        if (!inTopTen) {
            let index = 0;
            let score = 0;

            for (let i = 0; i < guilds.length; i++) {
                let guild = guilds[i];
                if (guild.guildName === interaction.guild.name) {
                    score = guild.score;
                    index = i + 1;
                    break;
                }
            }

            description +=
                '\n**…**\n' +
                `**${index}. ${
                    interaction.guild.name
                } - ${new Intl.NumberFormat().format(score)}**`;
        }

        embed.setColor('#8965d6');
        embed.setTitle('Leaderboard');
        embed.setDescription(description);

        await interaction.reply({
            embeds: [embed],
        });
    },
};
