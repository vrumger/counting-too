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
        embed.addField(
            'Commands list',
            commands.map(
                command =>
                    `\`${message.client.prefix}${command.name}\` - ${command.description}`,
            ),
        );
        embed.setFooter(`${message.client.prefix}help`);

        if (process.env.CLIENT_ID) {
            embed.addField(
                'Invite',
                `[Invite the bot to your own server!](https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=bot)`,
            );
        }

        await message.channel.send(embed);
    },
};
