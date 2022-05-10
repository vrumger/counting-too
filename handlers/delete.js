const Channel = require('../models/channel');

module.exports = async message => {
    const channel = await Channel.findOne({
        guildId: message.guild.id,
        channelId: message.channel.id,
        messageId: message.id,
    });

    if (!channel) {
        return;
    }

    const lastNumber = channel.getLastNumber();

    await message.channel.send(
        `<@${
            channel.userId
        }> deleted their count of \`${lastNumber}\`. The next number is \`${
            lastNumber + 1
        }\`.`,
    );
};
