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
        highScore: {
            type: Number,
        },
        highScoreDate: {
            type: Date,
        },
    },
    { timestamps: true },
);

channelSchema.pre('save', function (next) {
    if (!this.highScore || this.lastNumber > this.highScore) {
        this.set({
            highScore: this.lastNumber,
            highScoreDate: new Date(),
        });
    }

    next();
});

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;
