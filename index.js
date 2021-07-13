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

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageDelete', deleteHandler);

client.on('message', async message => {
    if (message.author.bot) return;

    if (message.guild === null) {
        await message.reply('Sup');
        return;
    }

    const words = message.content.split(' ');
    const number = /^\d+$/.test(words[0]) ? Number(words[0]) : null;

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
