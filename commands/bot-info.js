const { execSync } = require('child_process');
const prettyMs = require('pretty-ms');
const Discord = require('discord.js');

const commitHash = execSync(
    'echo "$(git rev-parse --short HEAD)$(git diff-index --quiet HEAD || echo "*")"',
    { encoding: 'utf8' },
).trim();

module.exports = {
    name: 'bot',
    description: 'View info about the bot',
    async execute(interaction) {
        const embed = new Discord.MessageEmbed();
        const uptime = prettyMs(process.uptime() * 1000, {
            secondsDecimalDigits: 0,
            verbose: true,
        });

        if (process.env.CLIENT_ID) {
            embed.addField(
                'Invite',
                `[Invite the bot to your own server!](https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=bot%20applications.commands)`,
            );
        }

        embed.setColor('#8965d6');
        embed.setTitle('Bot Info');
        embed.addField('Uptime', uptime);
        embed.addField('Commit', '`' + commitHash + '`');
        embed.addField(
            'Source Code',
            'https://github.com/vrumger/counting-too',
        );

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    },
};
