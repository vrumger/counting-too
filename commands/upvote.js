const Discord = require('discord.js');

module.exports = {
    name: 'upvote',
    description: 'Links to upvote the bot',
    async execute(interaction) {
        const embed = new Discord.EmbedBuilder();

        embed.setTitle('Upvote the bot!');
        embed.setDescription(
            [
                '[Discords.com](https://discords.com/bots/bot/862833445834063902)',
                '[Discord Bot List](https://discordbotlist.com/bots/counting-too)',
                '[Top.gg](https://top.gg/bot/862833445834063902)',
            ].join('\n'),
        );

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    },
};
