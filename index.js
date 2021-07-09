const mongoose = require('mongoose');
const Discord = require('discord.js');
const Channel = require('./models/channel');

require('dotenv').config();

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', async message => {
    if (message.author.bot) return;

    if (message.guild === null) {
        await message.reply('Sup');
        return;
    }

    const words = message.content.split(' ');
    const number = /^\d+$/.test(words[0]) ? Number(words[0]) : null;

    if (number) {
        const channel = await Channel.findOne({
            guildId: message.guild.id,
            channelId: message.channel.id,
        });

        if (!channel || channel.lastNumber === 0) {
            if (number === 1) {
                if (!channel) {
                    await new Channel({
                        guildId: message.guild.id,
                        channelId: message.channel.id,
                        userId: message.author.id,
                        lastNumber: 1,
                    }).save();
                } else {
                    channel.userId = message.author.id;
                    channel.lastNumber = 1;
                    await channel.save();
                }

                await message.react('✅');
                return;
            }

            const lastNumber = channel?.lastNumber ?? 0;

            channel.userId = null;
            channel.lastNumber = 0;
            await message.react('⚠️');
            await message.channel.send(
                `Incorrect number! The next number is \`${
                    lastNumber + 1
                }\`. **No stats have been changed since the current number was 0.**`,
            );
            return;
        }

        if (number !== channel.lastNumber + 1) {
            const { lastNumber } = channel;

            channel.userId = null;
            channel.lastNumber = 0;
            await channel.save();
            await message.react('❌');
            await message.reply(
                `RUINED IT AT **${lastNumber}**!! Next number is **1**. **Wrong number.**`,
            );
            return;
        }

        if (channel.userId === message.author.id) {
            const { lastNumber } = channel;

            channel.userId = null;
            channel.lastNumber = 0;
            await channel.save();
            await message.react('❌');
            await message.reply(
                `RUINED IT AT **${
                    lastNumber + 1
                }**!! Next number is **1**. **You can't count two numbers in a row.**`,
            );
            return;
        }

        channel.userId = message.author.id;
        channel.lastNumber = number;
        await channel.save();
        await message.react('✅');
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
