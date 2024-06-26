require('dotenv').config();

const fs = require('fs');
const mongoose = require('mongoose');
const {
    Client,
    Collection,
    Events,
    IntentsBitField,
    GatewayIntentBits,
    Partials,
} = require('discord.js');
const deleteHandler = require('./handlers/delete');
const numbersHandler = require('./handlers/numbers');
const Queue = require('./helpers/queue');
const User = require('./models/user');
const Channel = require('./models/channel');
const setActivity = require('./helpers/activity');

const prefix = process.env.BOT_PREFIX || '2!';
const queue = new Queue();
const commands = new Collection();
const client = new Client({
    intents: [
        IntentsBitField.Flags.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message],
});

const commandFiles = fs
    .readdirSync(__dirname + '/commands')
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.set(command.name, command);
    command.aliases?.forEach(subCommand =>
        commands.set(subCommand.name, command),
    );
}

client.on(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user.tag}`);

    await setActivity(client);

    const guild = process.env.DEV_GUILD_ID
        ? client.guilds.cache.get(process.env.DEV_GUILD_ID)
        : null;
    const commandManager = guild ? guild.commands : client.application.commands;

    commands.forEach(command => {
        commandManager.create({
            name: command.name,
            description: command.description,
            options: command.options,
        });

        if (command.aliases) {
            command.aliases.forEach(subCommand =>
                commandManager.create({
                    name: subCommand.name,
                    description: subCommand.description,
                    options: subCommand.options,
                }),
            );
        }
    });
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) {
        return;
    }

    const { commandName } = interaction;

    if (!commands.has(commandName)) {
        return;
    }

    try {
        const handler = commands.get(commandName);
        const result = handler.execute(interaction);

        if (result instanceof Promise) {
            await result;
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'there was an error.',
            ephemeral: true,
        });
    }
});

client.on(Events.MessageDelete, deleteHandler);

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    if (message.guild === null) {
        const inviteLink = process.env.CLIENT_ID
            ? `\nInvite the bot to your server: https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=bot%20applications.commands\n`
            : '';
        await message.reply(`Count to infinity, one number at a time. Earn saves for yourself and everyone else in the server. Saves are automatically given when you count.

100 numbers = 1 save for yourself
500 numbers = 1 save for the server
${inviteLink}
The bot is even open source! Check it out for yourself: <https://github.com/vrumger/counting-too>`);
        return;
    }

    const user = await User.findOne({ userId: message.author.id });
    if (user?.disabled) {
        return;
    }

    const words = message.content.split(/\s/);
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

        if (!commands.has(command)) {
            return;
        }

        message.commandName = command;

        try {
            const handler = commands.get(command);
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

client.on(Events.GuildDelete, async guild => {
    await Channel.deleteOne({
        guildId: guild.id,
    });
    await setActivity(client);
});

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');

    client.login(process.env.BOT_TOKEN);
});
