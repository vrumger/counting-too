const Channel = require('../models/channel');

const setActivity = async client => {
    const channelsCount = await Channel.countDocuments();
    await client.user.setActivity(`numbers in ${channelsCount} guilds`, {
        type: 'PLAYING',
    });
};

module.exports = setActivity;
