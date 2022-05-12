const User = require('../models/user');

module.exports = {
    name: 'disable',
    description: 'Block the bot from counting your numbers',
    aliases: [
        {
            name: 'enable',
            description: 'Unblock the bot from counting your numbers',
        },
    ],
    async execute(interaction) {
        const author = interaction.user ?? interaction.author;
        const user = await User.findOneAndUpdate(
            { userId: author.id },
            { $set: { disabled: interaction.commandName === 'disable' } },
            { upsert: true, new: true },
        );

        await interaction.reply({
            content: user.disabled
                ? 'I will no longer count your numbers 😔'
                : 'I will start counting your numbers again 🙂',
            ephemeral: true,
        });
    },
};
