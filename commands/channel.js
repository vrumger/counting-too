const Channel = require('../models/channel');

module.exports = {
    name: 'set-channel',
    description: 'Configure the bot to listen in this channel',
    async execute(interaction) {
        if (
            !(
                interaction.memberPermissions || interaction.member.permissions
            ).has('MANAGE_CHANNELS')
        ) {
            await interaction.reply({
                content: "you don't have permission to do this.",
                ephemeral: true,
            });
            return;
        }

        let channel = await Channel.findOne({
            guildId: interaction.guildId,
        });

        if (!channel) {
            channel = new Channel({
                guildId: interaction.guildId,
                guildName: interaction.guild.name,
            });
        }

        channel.channelId = interaction.channelId;
        await channel.save();

        const channelsCount = await Channel.countDocuments();
        await interaction.client.user.setActivity(
            `numbers in ${channelsCount} guilds`,
            { type: 'PLAYING' },
        );

        await interaction.reply({
            content: 'the counting channel has been updated to this channel.',
            ephemeral: true,
        });
    },
};
