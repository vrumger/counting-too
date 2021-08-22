const fs = require('fs');
const mongoose = require('mongoose');
const Discord = require('discord.js');
const deleteHandler = require('./handlers/delete');
const numbersHandler = require('./handlers/numbers');
const Queue = require('./helpers/queue');

require('dotenv').config();

const prefix = process.env.BOT_PREFIX || '2!';
const queue = new Queue();
const client = new Discord.Client({
    partials: ['MESSAGE'],
});

client.prefix = prefix;
client.queue = queue;
client.commands = new Discord.Collection();

const commandFiles = fs
    .readdirSync(__dirname + '/commands')
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    await client.user.setActivity('numbers', { type: 'PLAYING' });
});

client.on('messageDelete', deleteHandler);

client.on('message', async message => {
    if (message.author.bot) return;

    if (message.guild === null) {
        const inviteLink = process.env.CLIENT_ID
            ? `\nInvite the bot to your server: https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=bot\n`
            : '';
        await message.reply(`Count to infinity, one number at a time. Earn saves for yourself and everyone else in the server. Saves are automatically given when you count.

100 numbers = 1 save for yourself
500 numbers = 1 save for the server
${inviteLink}
The bot is even open source! Check it out for yourself: <https://github.com/AndrewLaneX/counting-too>`);
        return;
    }

    const words = message.content.split(' ');
    const number = /^[1-9][0-9]*$/.test(words[0]) ? Number(words[0]) : null;

    if (number) {
        await queue.add(message.guild.id, () =>
            numbersHandler(message, number),
        );
        return;
    }

    let command = words[0].toLowerCase();
    if (command.startsWith(prefix)) {
        command = command.slice(prefix.length);
        const args = words.slice(1);

        if (!client.commands.has(command)) {
            return;
        }

        try {
            const handler = client.commands.get(command);
            const result = handler.execute(message, args);

            if (result instanceof Promise) {
                await result;
            }
        } catch (error) {
            console.error(error);
            await message.reply('there was an error.');
        }
    }
});

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');

        client.login(process.env.BOT_TOKEN);
    });
