const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema(
    {
        guildId: {
            type: String,
            required: true,
        },
        channelId: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
        },
        lastNumber: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { timestamps: true },
);

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;
