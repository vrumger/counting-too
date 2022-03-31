const Discord = require('discord.js');

module.exports = {
    name: 'upvote',
    aliases: ['vote'],
    hidden: true,
    async execute(message) {
        const embed = new Discord.MessageEmbed();

        embed.setTitle('Upvote the bot!');
        embed.setDescription(
            [
                '[Discords.com](https://discords.com/bots/bot/862833445834063902)',
                '[Discord Bot List](https://discordbotlist.com/bots/counting-too)',
                '[Top.gg](https://top.gg/bot/862833445834063902)',
            ].join('\n'),
        );
        embed.setFooter({ text: `${message.client.prefix}upvote` });

        await message.channel.send({ embeds: [embed] });
    },
};
