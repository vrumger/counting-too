const mongoose = require('mongoose');
const xor = require('../helpers/xor');

const channelSchema = new mongoose.Schema(
    {
        guildId: {
            type: String,
            required: true,
        },
        guildName: {
            type: String,
            sparse: true,
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
        // keep for backwards-compatibility
        lastNumber: Number,
        lastNumberXor: {
            type: String,
            required: true,
            default: xor.encrypt(0),
        },
        // keep for backwards-compatibility
        highScore: Number,
        highScoreXor: {
            type: String,
            required: true,
            default: xor.encrypt(0),
        },
        highScoreDate: {
            type: Date,
            required: true,
            default: () => new Date(),
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
    return number === this.getHighScore();
});

channelSchema.method('getLastNumber', function () {
    if (this.lastNumber) {
        return this.lastNumber;
    }

    if (!this._lastNumber) {
        this._lastNumber = this.lastNumberXor
            ? xor.decrypt(this.lastNumberXor)
            : 0;
    }

    return this._lastNumber;
});

channelSchema.method('getHighScore', function () {
    if (this.highScore) {
        return this.highScore;
    }

    if (!this._highScore) {
        this._highScore = this.highScoreXor
            ? xor.decrypt(this.highScoreXor)
            : 0;
    }

    return this._highScore;
});

channelSchema.method('setLastNumber', function (number) {
    const highScore = this.getHighScore();
    const lastNumberXor = xor.encrypt(number);

    const set = {};

    if (number > highScore) {
        set.highScore = undefined;
        set.highScoreXor = lastNumberXor;
        set.highScoreDate = new Date();
        this._highScore = number;
    }

    set.lastNumber = undefined;
    set.lastNumberXor = lastNumberXor;
    this._lastNumber = number;
    this.set(set);
});

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;
