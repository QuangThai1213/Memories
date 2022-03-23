const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const { bold } = require('@discordjs/builders');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    entersState,
    StreamType,
    AudioPlayerStatus,
    VoiceConnectionStatus,
} = require('@discordjs/voice');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music!'),
    async execute(interaction) {
        const player = createAudioPlayer();
        const connection = await connectToVoiceChannel(interaction);
        try {
            interaction.reply({
                content: "Testing"
            });
            await playSong(player).then(() => {
                connection.subscribe(player);
            });
        } catch (error) {
            console.error(error);
        }
    },
};

async function connectToVoiceChannel(interaction) {
    const connection = joinVoiceChannel({
        channelId: '447325615587196933',
        guildId: interaction.member.guild.id,
        adapterCreator: interaction.member.guild.voiceAdapterCreator,
        selfDeaf: false
    });
    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
        return connection;
    } catch (error) {
        connection.destroy();
        throw error;
    }
}

function playSong(player) {
    const resource = createAudioResource('./mp3/Happiness Magic.mp3', {
        inputType: StreamType.Arbitrary,
    });

    player.play(resource);

    return entersState(player, AudioPlayerStatus.Playing, 5e3);
}