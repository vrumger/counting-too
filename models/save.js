const mongoose = require('mongoose');

const saveSchema = new mongoose.Schema(
    {
        guildId: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        saves: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

saveSchema.static('getSaves', async function (guildId, userId) {
    const save = await this.findOne({ guildId, userId });

    return save.saves ?? 0;
});

saveSchema.static('hasSaves', async function (guildId, userId) {
    const save = await this.findOne({ guildId, userId });
    if (!save) {
        return false;
    }

    return save.saves >= 1;
});

saveSchema.static('useSave', async function (guildId, userId) {
    const save = await this.findOne({ guildId, userId });
    if (!save || save.saves < 1) {
        throw new Error('Not enough saves');
    }

    save.saves -= 1;
    await save.save();

    return true;
});

saveSchema.static('addSave', async function (guildId, userId) {
    return await this.updateOne(
        { guildId, userId },
        { $inc: { saves: 0.01 } },
        { upsert: true },
    );
});

const Save = mongoose.model('Save', saveSchema);

module.exports = Save;
