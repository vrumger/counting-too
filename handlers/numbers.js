const Channel = require('../models/channel');
const Save = require('../models/save');

const lastNumbers = new Map(); // guild.id => [lastNumber, timestamp]
const reactions = {
    normal: '✅',
    highScore: '☑️',
    oneHundred: '💯',
    x: '❌',
    warning: '⚠️',
    thinking: '🤔',
};

const formatSaveMessage = (userId, saves, lastNumber) =>
    `⚠️ <@${userId}> You have used **1** of your saves. You have **${saves.toFixed(
        2,
    )}** left. The next number is **${lastNumber + 1}**`;

const formatGuildSaveMessage = (userId, saves, lastNumber) =>
    `⚠️ <@${userId}> You have used **1** of the guild saves. There are **${saves.toFixed(
        3,
    )}** left. The next number is **${lastNumber + 1}**`;

module.exports = async (message, number) => {
    if (lastNumbers.has(message.guild.id)) {
        const [lastNumber, timestamp] = lastNumbers.get(message.guild.id);

        if (
            number === lastNumber &&
            message.createdTimestamp - timestamp < 1000
        ) {
            await message.react(reactions.thinking);
            lastNumbers.set(message.guild.id, [
                number,
                message.createdTimestamp,
            ]);
            return;
        }
    }

    lastNumbers.set(message.guild.id, [number, message.createdTimestamp]);

    const channel = await Channel.findOne({
        guildId: message.guild.id,
        channelId: message.channel.id,
    });

    if (!channel) {
        return;
    }

    if (channel.getLastNumber() === 0) {
        if (number === 1) {
            channel.userId = message.author.id;
            channel.messageId = message.id;
            channel.setLastNumber(1);
            channel.addSave();
            await channel.save();

            await message.react(
                channel.isHighScore(number)
                    ? reactions.highScore
                    : reactions.normal,
            );
            await Save.addSave(message.guild.id, message.author.id);

            return;
        }

        channel.userId = null;
        channel.messageId = message.id;
        channel.setLastNumber(0);
        await message.react(reactions.warning);
        await message.channel.send(
            `Incorrect number! The next number is \`${
                channel.getLastNumber() + 1
            }\`. **No stats have been changed since the current number was 0.**`,
        );
        return;
    }

    if (number !== channel.getLastNumber() + 1) {
        if (await Save.hasSaves(message.guild.id, message.author.id)) {
            await Save.useSave(message.guild.id, message.author.id);

            const saves = await Save.getSaves(
                message.guild.id,
                message.author.id,
            );
            await message.react(reactions.warning);
            await message.channel.send(
                formatSaveMessage(
                    message.author.id,
                    saves,
                    channel.getLastNumber(),
                ),
            );

            return;
        } else if (channel.hasSaves()) {
            await channel.useSave();
            await message.react(reactions.warning);
            await message.channel.send(
                formatGuildSaveMessage(
                    message.author.id,
                    channel.guildSaves,
                    channel.getLastNumber(),
                ),
            );

            return;
        }

        const lastNumber = channel.getLastNumber();

        channel.userId = null;
        channel.messageId = null;
        channel.setLastNumber(0);
        await channel.save();
        await message.react(reactions.x);
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
            await message.react(reactions.warning);
            await message.channel.send(
                formatSaveMessage(
                    message.author.id,
                    saves,
                    channel.getLastNumber(),
                ),
            );

            return;
        } else if (channel.hasSaves()) {
            await channel.useSave();
            await message.react(reactions.warning);
            await message.channel.send(
                formatGuildSaveMessage(
                    message.author.id,
                    channel.guildSaves,
                    channel.getLastNumber(),
                ),
            );

            return;
        }

        const lastNumber = channel.getLastNumber();

        channel.userId = null;
        channel.messageId = null;
        channel.setLastNumber(0);
        await channel.save();
        await message.react(reactions.x);
        await message.reply(
            `RUINED IT AT **${
                lastNumber + 1
            }**!! Next number is **1**. **You can't count two numbers in a row.**`,
        );
        return;
    }

    channel.userId = message.author.id;
    channel.messageId = message.id;
    channel.setLastNumber(number);
    channel.addSave();
    await channel.save();
    await message.react(
        number === 100
            ? reactions.oneHundred
            : channel.isHighScore(number)
            ? reactions.highScore
            : reactions.normal,
    );

    await Save.addSave(message.guild.id, message.author.id);
};
