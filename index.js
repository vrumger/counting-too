const mongoose = require('mongoose');
const Discord = require('discord.js');
const Channel = require('./models/channel');
const Save = require('./models/save');

require('dotenv').config();

const client = new Discord.Client();
const prefix = process.env.BOT_PREFIX || '2!';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

const formatSaveMessage = (userId, saves, lastNumber) =>
    `⚠️ <@${userId}> You have used **1** of your saves. You have **${saves.toFixed(
        2,
    )}** left. The next number is **${lastNumber + 1}**`;

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
                await Save.addSave(message.guild.id, message.author.id);

                return;
            }

            if (await Save.hasSaves(message.guild.id, message.author.id)) {
                await Save.useSave(message.guild.id, message.author.id);

                const saves = await Save.getSaves(
                    message.guild.id,
                    message.author.id,
                );
                await message.channel.send(
                    formatSaveMessage(
                        message.author.id,
                        saves,
                        channel.lastNumber,
                    ),
                );

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
            if (await Save.hasSaves(message.guild.id, message.author.id)) {
                await Save.useSave(message.guild.id, message.author.id);

                const saves = await Save.getSaves(
                    message.guild.id,
                    message.author.id,
                );
                await message.channel.send(
                    formatSaveMessage(
                        message.author.id,
                        saves,
                        channel.lastNumber,
                    ),
                );

                return;
            }

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
            if (await Save.hasSaves(message.guild.id, message.author.id)) {
                await Save.useSave(message.guild.id, message.author.id);

                const saves = await Save.getSaves(
                    message.guild.id,
                    message.author.id,
                );
                await message.channel.send(
                    formatSaveMessage(
                        message.author.id,
                        saves,
                        channel.lastNumber,
                    ),
                );

                return;
            }

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
        await message.react(number === 100 ? '💯' : '✅');

        await Save.addSave(message.guild.id, message.author.id);
        return;
    }

    if (words[0].startsWith(prefix)) {
        const command = words[0].slice(prefix.length);
        const args = words.slice(1);

        if (command === 'server') {
            const channel = await Channel.findOne({
                guildId: message.guild.id,
            });

            const embed = new Discord.MessageEmbed();

            embed.setColor('#8965d6');
            embed.setTitle(`Info for ${message.guild.name}`);
            embed.addField('Current number', channel.lastNumber);
            embed.addField('Last counted by', `<@${channel.userId}>`);
            embed.addField(
                'High score',
                `${
                    channel.highScore
                } (${channel.highScoreDate.toDateString()})`,
            );
            embed.setFooter(`${prefix}server`);

            await message.channel.send(embed);
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
