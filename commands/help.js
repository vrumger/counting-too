const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Get a list of commands and their descriptions',
    async execute(message, args) {
        if (args.length) {
            const command = message.client.commands.get(args[0]);
            let response = 'Command not found';

            if (command) {
                response = new Discord.MessageEmbed();

                response.setColor('#8965d6');
                response.setTitle(`Command help`);
                response.addField(
                    `\`${message.client.prefix}${command.name}\``,
                    command.description,
                );
                response.setFooter(`${message.client.prefix}help`);
            }

            await message.channel.send(response);
            return;
        }

        const commands = message.client.commands.array();
        const embed = new Discord.MessageEmbed();

        embed.setColor('#8965d6');
        embed.setTitle('Commands list');
        embed.addFields(
            ...commands.map(command => ({
                name: `\`${message.client.prefix}${command.name}\``,
                value: command.description,
            })),
        );
        embed.setFooter(`${message.client.prefix}help`);

        await message.channel.send(embed);
    },
};
