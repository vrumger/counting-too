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
        messageId: {
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
        guildSaves: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

channelSchema.method('hasSaves', function () {
    return this.guildSaves >= 1;
});

channelSchema.method('useSave', async function () {
    if (this.guildSaves < 1) {
        throw new Error('Not enough saves');
    }

    this.guildSaves -= 1;
    await this.save();
});

channelSchema.method('addSave', function () {
    this.guildSaves += 0.002;
});

channelSchema.method('isHighScore', function (number) {
    return number === this.highScore;
});

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
