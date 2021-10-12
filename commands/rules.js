const Discord = require('discord.js');

const description = `Counting needs to be sequential. If you count the same number as another player, the count will break and restart from one.

Counting is teamwork, so find a counting buddy. You count one number; another player counts the next. If you count two numbers in a row, the count will break!

Your number must be at the start of the message. You can write whatever you want after - just make sure to put a space after the number.

Good luck!`;

module.exports = {
    name: 'rules',
    description: 'Read the rules of the game',
    async execute(message) {
        const embed = new Discord.MessageEmbed();

        embed.setTitle('Rules of the game');
        embed.setDescription(description);
        embed.setFooter(`${message.client.prefix}rules`);

        await message.channel.send(embed);
    },
};
